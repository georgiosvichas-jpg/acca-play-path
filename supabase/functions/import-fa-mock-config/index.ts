import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    configs_created: number;
    configs_updated: number;
  };
  preview: Array<{
    paper_code: string;
    duration_minutes: number;
    total_questions: number;
    pass_mark_percentage: number;
    sections: any[];
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("User is not an admin");

    // Get mock_exams from request body
    const body = await req.json();
    const mockExams: MockExamTemplate[] = body.mock_exams || [];

    if (mockExams.length === 0) {
      throw new Error("No mock exams provided in request");
    }

    console.log(`Found ${mockExams.length} mock exam templates`);

    let configsCreated = 0;
    let configsUpdated = 0;
    const preview: Array<any> = [];

    // Process each mock exam template
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
          paper_code: "FA",
          duration_minutes: mockExam.duration_minutes,
          total_questions: mockExam.question_count,
          pass_mark_percentage: 50,
          sections_json: sectionsJson,
        };

        // Check if config already exists for FA
        const { data: existing } = await supabase
          .from("mock_config")
          .select("id")
          .eq("paper_code", "FA")
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
          console.log("Updated existing FA mock config");
        } else {
          // Insert new config
          const { error: insertError } = await supabase
            .from("mock_config")
            .insert(mockConfigData);

          if (insertError) {
            throw insertError;
          }
          configsCreated++;
          console.log("Created new FA mock config");
        }

        // Add to preview
        preview.push({
          paper_code: "FA",
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

  } catch (error) {
    console.error("Error importing FA mock config:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
