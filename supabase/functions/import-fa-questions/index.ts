import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FAQuestion {
  external_id: string;
  unit_code: string;
  question_type: string;
  stem: string;
  options?: string[];
  correct_answer: string;
  difficulty: string;
  estimated_time_seconds?: number;
  official_explanation?: string;
  tags?: string[];
}

interface ImportResult {
  success: boolean;
  summary: {
    total_questions: number;
    inserted_count: number;
    updated_count: number;
    skipped_count: number;
  };
  skipped: Array<{ external_id: string; error_reason: string }>;
}

const VALID_QUESTION_TYPES = ["MCQ_SINGLE", "MCQ_MULTI", "NUMERIC", "SHORT"];
const VALID_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
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

    const jsonContent = await file.text();
    let parsedData: any;

    try {
      parsedData = JSON.parse(jsonContent);
    } catch (e) {
      throw new Error("Invalid JSON format");
    }

    // Handle both Format A and Format B
    let questions: FAQuestion[] = [];
    
    if (Array.isArray(parsedData)) {
      // Format B: array of questions
      questions = parsedData;
    } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
      // Format A: { paper, questions }
      questions = parsedData.questions;
    } else {
      throw new Error("Invalid JSON structure. Expected array or {questions: [...]}");
    }

    // Fetch all FA syllabus units for validation
    const { data: faSyllabusUnits } = await supabase
      .from("syllabus_units")
      .select("unit_code")
      .eq("paper_code", "FA");

    const validUnitCodes = new Set(faSyllabusUnits?.map(u => u.unit_code) || []);

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const skipped: Array<{ external_id: string; error_reason: string }> = [];

    for (const q of questions) {
      try {
        // Validate required fields
        if (!q.external_id || !q.unit_code || !q.question_type || !q.stem || !q.difficulty) {
          skipped.push({
            external_id: q.external_id || "UNKNOWN",
            error_reason: "Missing required fields (external_id, unit_code, question_type, stem, or difficulty)",
          });
          skippedCount++;
          continue;
        }

        // Validate question type
        if (!VALID_QUESTION_TYPES.includes(q.question_type)) {
          skipped.push({
            external_id: q.external_id,
            error_reason: `Invalid question_type: ${q.question_type}`,
          });
          skippedCount++;
          continue;
        }

        // Validate difficulty
        if (!VALID_DIFFICULTIES.includes(q.difficulty)) {
          skipped.push({
            external_id: q.external_id,
            error_reason: `Invalid difficulty: ${q.difficulty}`,
          });
          skippedCount++;
          continue;
        }

        // Validate unit_code exists in FA syllabus
        if (!validUnitCodes.has(q.unit_code)) {
          skipped.push({
            external_id: q.external_id,
            error_reason: `unit_code ${q.unit_code} not found in FA syllabus_units`,
          });
          skippedCount++;
          continue;
        }

        // Validate MCQ questions have options
        if ((q.question_type === "MCQ_SINGLE" || q.question_type === "MCQ_MULTI") && (!q.options || q.options.length === 0)) {
          skipped.push({
            external_id: q.external_id,
            error_reason: "MCQ question missing options array",
          });
          skippedCount++;
          continue;
        }

        // Validate correct_answer for MCQ
        if (q.question_type === "MCQ_SINGLE" || q.question_type === "MCQ_MULTI") {
          const letters = q.correct_answer.split("|");
          let invalidAnswer = false;
          for (const letter of letters) {
            const index = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (index < 0 || index >= (q.options?.length || 0)) {
              skipped.push({
                external_id: q.external_id,
                error_reason: `correct_answer ${letter} out of range for options`,
              });
              skippedCount++;
              invalidAnswer = true;
              break;
            }
          }
          if (invalidAnswer) continue;
        }

        // Map to sb_questions schema
        const questionData: any = {
          paper: "FA",
          external_id: q.external_id,
          unit_code: q.unit_code,
          type: q.question_type,
          question: q.stem,
          options: q.options || [],
          difficulty: q.difficulty,
          explanation: q.official_explanation || null,
          estimated_time_seconds: q.estimated_time_seconds || 60,
          tags: q.tags || null,
          is_active: true,
        };

        // Handle correct_answer mapping
        if (q.question_type === "MCQ_SINGLE") {
          // Store as correct_option_index (A=0, B=1, etc.)
          questionData.correct_option_index = q.correct_answer.charCodeAt(0) - 65;
          questionData.answer = null;
        } else if (q.question_type === "MCQ_MULTI") {
          // Store multi-select as answer string
          questionData.correct_option_index = null;
          questionData.answer = q.correct_answer;
        } else {
          // NUMERIC or SHORT - store as answer
          questionData.correct_option_index = null;
          questionData.answer = q.correct_answer;
        }

        // Check if question exists
        const { data: existing } = await supabase
          .from("sb_questions")
          .select("id")
          .eq("paper", "FA")
          .eq("external_id", q.external_id)
          .maybeSingle();

        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from("sb_questions")
            .update(questionData)
            .eq("id", existing.id);

          if (updateError) {
            throw updateError;
          }
          updatedCount++;
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from("sb_questions")
            .insert(questionData);

          if (insertError) {
            throw insertError;
          }
          insertedCount++;
        }

      } catch (error) {
        console.error(`Error processing question ${q.external_id}:`, error);
        skipped.push({
          external_id: q.external_id || "UNKNOWN",
          error_reason: error instanceof Error ? error.message : "Unknown error",
        });
        skippedCount++;
      }
    }

    const result: ImportResult = {
      success: true,
      summary: {
        total_questions: questions.length,
        inserted_count: insertedCount,
        updated_count: updatedCount,
        skipped_count: skippedCount,
      },
      skipped,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error importing FA questions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
