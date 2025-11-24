import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MiniTestTemplate {
  id: string;
  title: string;
  target_units: string[];
  question_count: number;
  format?: string;
  notes_for_agent?: string[];
}

interface BuildResult {
  success: boolean;
  summary: {
    tests_created: number;
    questions_per_test: Record<string, number>;
    errors: string[];
  };
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

    // Fetch the template file
    console.log("Fetching FA assessment templates...");
    const templateUrl = `${supabaseUrl}/storage/v1/object/public/data/fa_assessment_templates.json`;
    
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error("Could not fetch assessment templates file");
    }

    const templateData = await templateResponse.json();
    const miniTests: MiniTestTemplate[] = templateData.mini_tests || [];

    if (miniTests.length === 0) {
      throw new Error("No mini tests found in template file");
    }

    console.log(`Found ${miniTests.length} mini test templates`);

    let testsCreated = 0;
    const questionsPerTest: Record<string, number> = {};
    const errors: string[] = [];

    // Process each mini test template
    for (const template of miniTests) {
      console.log(`Processing template: ${template.title}`);

      try {
        // Check if this test already exists
        const { data: existingTest } = await supabase
          .from("sb_minitests")
          .select("id")
          .eq("paper", "FA")
          .eq("title", template.title)
          .maybeSingle();

        if (existingTest) {
          console.log(`Test "${template.title}" already exists, skipping`);
          errors.push(`Test "${template.title}" already exists`);
          continue;
        }

        // Fetch questions from target units
        const { data: questions, error: questionsError } = await supabase
          .from("sb_questions")
          .select("id, unit_code, difficulty")
          .eq("paper", "FA")
          .in("unit_code", template.target_units);

        if (questionsError) {
          throw questionsError;
        }

        if (!questions || questions.length === 0) {
          errors.push(`No questions found for units: ${template.target_units.join(", ")}`);
          continue;
        }

        console.log(`Found ${questions.length} questions for ${template.title}`);

        // Check if we have enough questions
        if (questions.length < template.question_count) {
          errors.push(
            `Only ${questions.length} questions available for "${template.title}", need ${template.question_count}`
          );
        }

        // Randomly sample questions
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, Math.min(template.question_count, questions.length));
        const questionIds = selectedQuestions.map(q => q.id);

        // Calculate recommended time (2 minutes per question)
        const recommendedTime = selectedQuestions.length * 2;

        // Insert mini test
        const { error: insertError } = await supabase
          .from("sb_minitests")
          .insert({
            paper: "FA",
            title: template.title,
            question_ids: questionIds,
            duration_minutes: recommendedTime,
          });

        if (insertError) {
          throw insertError;
        }

        testsCreated++;
        questionsPerTest[template.title] = selectedQuestions.length;
        console.log(`Created test "${template.title}" with ${selectedQuestions.length} questions`);

      } catch (error) {
        console.error(`Error processing template ${template.title}:`, error);
        errors.push(`Failed to create "${template.title}": ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    const result: BuildResult = {
      success: true,
      summary: {
        tests_created: testsCreated,
        questions_per_test: questionsPerTest,
        errors,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error building mini tests:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
