import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Question {
  external_id?: string;
  unit_code: string;
  question_type?: string;
  type?: string;
  stem?: string;
  question?: string;
  options?: any[];
  correct_answer?: string;
  correct_option_index?: number;
  explanation?: string;
  difficulty?: string;
  estimated_time_seconds?: number;
  tags?: string[];
  metadata?: any;
  learning_outcome_code?: string;
  left_column?: any[];
  right_column?: any[];
  correct_matches?: any;
}

interface ImportResult {
  success: boolean;
  message: string;
  inserted: number;
  updated: number;
  skipped: number;
  skipped_details: Array<{ external_id: string; reason: string }>;
}

const VALID_QUESTION_TYPES = ["MCQ_SINGLE", "MCQ_MULTI", "NUMERIC", "SHORT", "MATCHING"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[IMPORT-QUESTIONS] Starting import");

    // Parse request body
    const body = await req.json();
    const { paper_code, questions } = body;

    if (!paper_code) {
      throw new Error("paper_code is required");
    }

    if (!questions || !Array.isArray(questions)) {
      throw new Error("questions must be an array");
    }

    console.log(`[IMPORT-QUESTIONS] Importing ${questions.length} questions for paper: ${paper_code}`);

    // Validate paper exists
    const { data: paperData, error: paperError } = await supabase
      .from("papers")
      .select("paper_code")
      .eq("paper_code", paper_code)
      .single();

    if (paperError || !paperData) {
      throw new Error(`Paper ${paper_code} does not exist in the database`);
    }

    // Fetch syllabus units for this paper
    const { data: syllabusUnits, error: syllabusError } = await supabase
      .from("syllabus_units")
      .select("unit_code")
      .eq("paper_code", paper_code);

    if (syllabusError) {
      console.error("[IMPORT-QUESTIONS] Error fetching syllabus units:", syllabusError);
      throw new Error("Failed to fetch syllabus units");
    }

    const validUnitCodes = new Set(syllabusUnits?.map((u) => u.unit_code) || []);
    console.log(`[IMPORT-QUESTIONS] Valid unit codes for ${paper_code}:`, Array.from(validUnitCodes));

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const skipped_details: Array<{ external_id: string; reason: string }> = [];

    // Process each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionNum = i + 1;

      try {
        // Normalize field names
        const external_id = q.external_id || q.id || `${paper_code}_Q${String(questionNum).padStart(3, "0")}`;
        const question_type = (q.question_type || q.type || "MCQ_SINGLE").toUpperCase();
        const stem = q.stem || q.question;
        const difficulty = (q.difficulty || "medium").toLowerCase();
        const unit_code = q.unit_code;

        // Validation
        if (!stem) {
          skipped++;
          skipped_details.push({ external_id, reason: "Missing question stem" });
          continue;
        }

        if (!unit_code) {
          skipped++;
          skipped_details.push({ external_id, reason: "Missing unit_code" });
          continue;
        }

        if (!validUnitCodes.has(unit_code)) {
          skipped++;
          skipped_details.push({ external_id, reason: `Invalid unit_code: ${unit_code} (not in ${paper_code} syllabus)` });
          continue;
        }

        if (!VALID_QUESTION_TYPES.includes(question_type)) {
          skipped++;
          skipped_details.push({ external_id, reason: `Invalid question_type: ${question_type}` });
          continue;
        }

        if (!VALID_DIFFICULTIES.includes(difficulty)) {
          skipped++;
          skipped_details.push({ external_id, reason: `Invalid difficulty: ${difficulty}` });
          continue;
        }

        // Prepare question data
        const questionData: any = {
          paper: paper_code,
          external_id,
          type: question_type,
          question: stem,
          difficulty,
          unit_code,
          explanation: q.explanation || null,
          estimated_time_seconds: q.estimated_time_seconds || 60,
          learning_outcome_code: q.learning_outcome_code || null,
          tags: q.tags || null,
          is_active: true,
        };

        // Handle question type specific fields
        if (question_type === "MCQ_SINGLE" || question_type === "MCQ_MULTI") {
          const options = q.options;
          const correct_answer = q.correct_answer;

          if (!options || !Array.isArray(options) || options.length === 0) {
            skipped++;
            skipped_details.push({ external_id, reason: "MCQ question missing options array" });
            continue;
          }

          // Convert correct_answer letter(s) to index
          let correctIndex: number | null = null;
          if (correct_answer) {
            const answerLetter = correct_answer.trim().toUpperCase();
            correctIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
            if (correctIndex < 0 || correctIndex >= options.length) {
              skipped++;
              skipped_details.push({ external_id, reason: `Invalid correct_answer: ${correct_answer}` });
              continue;
            }
          } else if (q.correct_option_index !== undefined) {
            correctIndex = q.correct_option_index;
          }

          if (correctIndex === null) {
            skipped++;
            skipped_details.push({ external_id, reason: "Missing correct_answer or correct_option_index" });
            continue;
          }

          questionData.options = options;
          questionData.correct_option_index = correctIndex;
          questionData.answer = null;
        } else if (question_type === "MATCHING") {
          // Handle MATCHING questions
          const leftItems = q.left_column || [];
          const rightItems = q.right_column || [];
          const correctMatches = q.correct_matches || {};

          if (leftItems.length === 0 || rightItems.length === 0) {
            skipped++;
            skipped_details.push({ external_id, reason: "MATCHING question missing left_column or right_column" });
            continue;
          }

          // Convert correct_matches object to array of tuples
          const correctPairs = Object.entries(correctMatches).map(([left, right]) => [
            parseInt(left),
            parseInt(right as string),
          ]);

          questionData.options = null;
          questionData.correct_option_index = null;
          questionData.answer = null;
          questionData.metadata = {
            leftItems,
            rightItems,
            correctPairs,
          };
        } else {
          // NUMERIC or SHORT
          questionData.options = null;
          questionData.correct_option_index = null;
          questionData.answer = q.correct_answer || q.answer || null;
        }

        // Upsert question
        const { data, error } = await supabase
          .from("sb_questions")
          .upsert(questionData, {
            onConflict: "paper,external_id",
            ignoreDuplicates: false,
          })
          .select();

        if (error) {
          console.error(`[IMPORT-QUESTIONS] Error upserting question ${external_id}:`, error);
          skipped++;
          skipped_details.push({ external_id, reason: error.message });
        } else {
          if (data && data.length > 0) {
            inserted++;
          } else {
            updated++;
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[IMPORT-QUESTIONS] Error processing question ${questionNum}:`, errorMsg);
        skipped++;
        skipped_details.push({
          external_id: q.external_id || `Q${questionNum}`,
          reason: errorMsg,
        });
      }
    }

    const result: ImportResult = {
      success: true,
      message: `Import completed for ${paper_code}`,
      inserted,
      updated,
      skipped,
      skipped_details,
    };

    console.log(`[IMPORT-QUESTIONS] Import summary:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[IMPORT-QUESTIONS] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
