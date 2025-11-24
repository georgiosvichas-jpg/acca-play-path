import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MockConfigRow {
  paper_code: string;
  duration_minutes: number;
  total_questions: number;
  pass_mark_percentage: number;
  sections_json?: string;
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

    // Parse header
    const header = lines[0].split(",").map(h => h.trim());
    
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
        const values = line.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
        const row: any = {};
        header.forEach((key, idx) => {
          row[key] = values[idx] || null;
        });

        // Validate required fields
        if (!row.paper_code || !row.duration_minutes || !row.total_questions) {
          errors.push({
            row: i + 1,
            error: "Missing required fields: paper_code, duration_minutes, or total_questions",
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

        const mockConfig: any = {
          paper_code: row.paper_code,
          duration_minutes: parseInt(row.duration_minutes),
          total_questions: parseInt(row.total_questions),
          pass_mark_percentage: row.pass_mark_percentage ? parseInt(row.pass_mark_percentage) : 50,
          sections_json: sectionsJson,
        };

        // Upsert (insert or update)
        const { data: result, error: upsertError } = await supabase
          .from("mock_config")
          .upsert(mockConfig, {
            onConflict: "paper_code"
          })
          .select()
          .single();

        if (upsertError) {
          throw upsertError;
        }

        // Check if it was an insert or update by looking if it existed before
        const { data: existing } = await supabase
          .from("mock_config")
          .select("created_at, updated_at")
          .eq("paper_code", row.paper_code)
          .single();

        if (existing && existing.created_at !== existing.updated_at) {
          updated++;
        } else {
          inserted++;
        }

        configs.push(mockConfig);

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
          data: line
        });
        skipped++;
      }
    }

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