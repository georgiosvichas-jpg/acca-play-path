import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MockConfigRow {
  mock_id: string;
  paper_code: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  pass_mark_percentage: number;
  easy_ratio?: number;
  medium_ratio?: number;
  hard_ratio?: number;
  unit_scope?: string[];
  description?: string;
  sections_json?: string;
}

interface MockExamTemplate {
  id: string;
  title: string;
  duration_minutes: number;
  question_count: number;
  structure?: {
    sections?: Array<{
      name: string;
      approx_questions: number;
      focus_units: string[];
    }>;
  };
}

interface ImportResult {
  success: boolean;
  summary: {
    total?: number;
    inserted?: number;
    updated?: number;
    skipped?: number;
    errors?: number;
    configs_created?: number;
    configs_updated?: number;
  };
  preview?: Array<{
    paper_code: string;
    duration_minutes: number;
    total_questions: number;
    pass_mark_percentage: number;
    sections?: any[];
  }>;
  configs?: Array<any>;
  errors?: Array<any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user has admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("User is not an admin");
    }

    // Check if request contains FormData (CSV) or JSON (template-based)
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle CSV file upload
      return await handleCSVImport(req, supabase, corsHeaders);
    } else {
      // Handle JSON template-based import
      return await handleTemplateImport(req, supabase, corsHeaders);
    }

  } catch (error) {
    console.error("Error importing mock config:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleTemplateImport(req: Request, supabase: any, corsHeaders: any) {
  // Get mock_exams and paper_code from request body
  const body = await req.json();
  const mockExams: MockExamTemplate[] = body.mock_exams || [];
  const paperCode = body.paper_code;

  if (!paperCode) {
    throw new Error("paper_code is required in request body");
  }

  if (mockExams.length === 0) {
    throw new Error("No mock exams provided in request");
  }

  console.log(`Found ${mockExams.length} mock exam templates for ${paperCode}`);

  let configsCreated = 0;
  let configsUpdated = 0;
  const preview: Array<any> = [];

  // Process each mock exam template (only use first one per paper)
  for (const mockExam of mockExams) {
    console.log(`Processing mock exam: ${mockExam.title}`);

    try {
      // Build sections_json from structure
      let sectionsJson = null;
      if (mockExam.structure?.sections) {
        sectionsJson = mockExam.structure.sections.map(section => ({
          name: section.name,
          num_questions: section.approx_questions,
          focus_units: section.focus_units,
        }));
      }

      const mockConfigData = {
        paper_code: paperCode,
        duration_minutes: mockExam.duration_minutes,
        total_questions: mockExam.question_count,
        pass_mark_percentage: 50,
        sections_json: sectionsJson,
      };

      // Check if config already exists for this paper
      const { data: existing } = await supabase
        .from("mock_config")
        .select("id")
        .eq("paper_code", paperCode)
        .maybeSingle();

      if (existing) {
        // Update existing config
        const { error: updateError } = await supabase
          .from("mock_config")
          .update(mockConfigData)
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }
        configsUpdated++;
        console.log(`Updated existing ${paperCode} mock config`);
      } else {
        // Insert new config
        const { error: insertError } = await supabase
          .from("mock_config")
          .insert(mockConfigData);

        if (insertError) {
          throw insertError;
        }
        configsCreated++;
        console.log(`Created new ${paperCode} mock config`);
      }

      // Add to preview
      preview.push({
        paper_code: paperCode,
        duration_minutes: mockExam.duration_minutes,
        total_questions: mockExam.question_count,
        pass_mark_percentage: 50,
        sections: sectionsJson || [],
      });

      // Only process the first mock exam (since we can only have one config per paper)
      break;

    } catch (error) {
      console.error(`Error processing mock exam ${mockExam.title}:`, error);
      throw error;
    }
  }

  const result: ImportResult = {
    success: true,
    summary: {
      configs_created: configsCreated,
      configs_updated: configsUpdated,
    },
    preview,
  };

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Helper function to parse CSV line properly handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field boundary - push current field and reset
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Push the last field
  result.push(current.trim());
  
  return result;
}

async function handleCSVImport(req: Request, supabase: any, corsHeaders: any) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  const csvContent = await file.text();
  const lines = csvContent.split("\n").filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows");
  }

  // Parse header using proper CSV parser
  const rawHeader = parseCSVLine(lines[0]);
  const header = rawHeader.map(col => {
    const cleanCol = col.trim().replace(/^["']|["']$/g, "");
    // Column aliases from source format -> internal field names
    if (cleanCol === "question_count") return "total_questions";
    if (cleanCol === "paper") return "paper_code";
    if (cleanCol === "mock_code") return "mock_id";
    if (cleanCol === "mock_name") return "title";
    if (cleanCol === "unit_filter") return "unit_scope";
    if (cleanCol === "notes") return "description";
    return cleanCol;
  });
  
  console.log(`[CSV Import] Parsed header columns:`, header);
  
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: Array<{ row: number; error: string; data: string }> = [];
  const configs: Array<any> = [];

  // Process each row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // Use proper CSV parser that handles quoted fields
      const values = parseCSVLine(line).map(v => {
        // Remove surrounding quotes if present
        const trimmed = v.trim();
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });
      
      const row: any = {};
      header.forEach((key, idx) => {
        row[key] = values[idx] || null;
      });
      
      console.log(`[Row ${i + 1}] Parsed values:`, { 
        mock_id: row.mock_id, 
        paper_code: row.paper_code,
        title: row.title?.substring(0, 30),
        description: row.description?.substring(0, 30)
      });

      // Validate required fields
      if (!row.mock_id || !row.paper_code || !row.duration_minutes || !row.total_questions) {
        const missingFields = [];
        if (!row.mock_id) missingFields.push('mock_id');
        if (!row.paper_code) missingFields.push('paper_code');
        if (!row.duration_minutes) missingFields.push('duration_minutes');
        if (!row.total_questions) missingFields.push('total_questions');
        
        console.error(`[Row ${i + 1}] Missing fields:`, missingFields);
        errors.push({
          row: i + 1,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          data: line
        });
        skipped++;
        continue;
      }

      // Verify paper exists
      const { data: paperExists } = await supabase
        .from("papers")
        .select("paper_code")
        .eq("paper_code", row.paper_code)
        .maybeSingle();

      if (!paperExists) {
        errors.push({
          row: i + 1,
          error: `Paper code ${row.paper_code} does not exist in papers table`,
          data: line
        });
        skipped++;
        continue;
      }

      // Parse sections_json if provided
      let sectionsJson = null;
      if (row.sections_json) {
        try {
          sectionsJson = JSON.parse(row.sections_json);
        } catch (e) {
          errors.push({
            row: i + 1,
            error: "Invalid JSON in sections_json field",
            data: line
          });
          skipped++;
          continue;
        }
      }

      // Parse unit_scope from semicolon or comma-separated string to array
      let unitScope = null;
      if (row.unit_scope && row.unit_scope.trim() && row.unit_scope !== 'null') {
        // Handle both semicolon and comma separators
        const separator = row.unit_scope.includes(';') ? ';' : ',';
        unitScope = row.unit_scope
          .split(separator)
          .map((u: string) => u.trim())
          .filter((u: string) => u && u !== 'null');
        
        if (unitScope.length === 0) {
          unitScope = null;
        }
        
        console.log(`[Row ${i + 1}] Parsed unit_scope:`, unitScope);
      }

      const mockConfig: any = {
        mock_id: row.mock_id,
        paper_code: row.paper_code,
        title: row.title || "Mock Exam",
        duration_minutes: parseInt(row.duration_minutes),
        total_questions: parseInt(row.total_questions),
        pass_mark_percentage: row.pass_mark_percentage ? parseInt(row.pass_mark_percentage) : 50,
        easy_ratio: row.easy_ratio ? parseFloat(row.easy_ratio) : null,
        medium_ratio: row.medium_ratio ? parseFloat(row.medium_ratio) : null,
        hard_ratio: row.hard_ratio ? parseFloat(row.hard_ratio) : null,
        unit_scope: unitScope,
        description: row.description || null,
        sections_json: sectionsJson,
      };

      // Upsert (insert or update based on mock_id)
      const { data: result, error: upsertError } = await supabase
        .from("mock_config")
        .upsert(mockConfig, {
          onConflict: "mock_id"
        })
        .select()
        .single();

      if (upsertError) {
        console.error(`[Row ${i + 1}] Upsert error:`, upsertError);
        throw upsertError;
      }

      // Check if it was an insert or update
      const { data: existing } = await supabase
        .from("mock_config")
        .select("created_at, updated_at")
        .eq("mock_id", row.mock_id)
        .single();

      if (existing && existing.created_at !== existing.updated_at) {
        updated++;
        console.log(`[Row ${i + 1}] Updated mock_id: ${row.mock_id}`);
      } else {
        inserted++;
        console.log(`[Row ${i + 1}] Inserted mock_id: ${row.mock_id}`);
      }

      configs.push(mockConfig);

    } catch (error) {
      console.error(`[Row ${i + 1}] Processing error:`, error);
      errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : "Unknown error",
        data: line.substring(0, 100) + (line.length > 100 ? '...' : '')
      });
      skipped++;
    }
  }
  
  console.log(`[CSV Import] Summary: ${inserted} inserted, ${updated} updated, ${skipped} skipped/errors`);

  return new Response(
    JSON.stringify({
      success: true,
      summary: {
        total: lines.length - 1,
        inserted,
        updated,
        skipped,
        errors: errors.length
      },
      configs,
      errors
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}