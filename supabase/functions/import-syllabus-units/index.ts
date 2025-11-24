import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyllabusUnitRow {
  paper_code: string;
  unit_code: string;
  parent_unit_code?: string;
  unit_name: string;
  unit_level: string;
  estimated_study_minutes?: number;
  description?: string;
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
        if (!row.paper_code || !row.unit_code) {
          errors.push({
            row: i + 1,
            error: "Missing required fields: paper_code or unit_code",
            data: line
          });
          skipped++;
          continue;
        }

        const syllabusUnit: any = {
          paper_code: row.paper_code,
          unit_code: row.unit_code,
          parent_unit_code: row.parent_unit_code || null,
          unit_name: row.unit_name,
          unit_title: row.unit_title || row.unit_name,
          chapter: row.chapter || row.unit_code,
          unit_level: row.unit_level,
          description: row.description || null,
          estimated_study_minutes: row.estimated_study_minutes ? parseInt(row.estimated_study_minutes) : null,
        };

        // Check if unit exists
        const { data: existing } = await supabase
          .from("syllabus_units")
          .select("id")
          .eq("paper_code", syllabusUnit.paper_code)
          .eq("unit_code", syllabusUnit.unit_code)
          .maybeSingle();

        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from("syllabus_units")
            .update(syllabusUnit)
            .eq("id", existing.id);

          if (updateError) {
            throw updateError;
          }
          updated++;
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from("syllabus_units")
            .insert(syllabusUnit);

          if (insertError) {
            throw insertError;
          }
          inserted++;
        }

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

    // Fetch imported units for preview
    const { data: importedUnits } = await supabase
      .from("syllabus_units")
      .select("unit_code, unit_name, parent_unit_code, unit_level")
      .order("unit_code");

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
        errors,
        units: importedUnits || []
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error importing syllabus units:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});