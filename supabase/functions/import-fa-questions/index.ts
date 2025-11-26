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

const VALID_QUESTION_TYPES = ["MCQ_SINGLE", "MCQ_MULTI", "CALCULATION", "FILL_IN_BLANK", "SHORT_ANSWER", "MATCHING", "mcq", "flashcard"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

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

    // Read body as text first for debugging
    console.log("=== EDGE FUNCTION DEBUG ===");
    console.log("Request method:", req.method);
    console.log("Content-Type:", req.headers.get("content-type"));
    console.log("Content-Length:", req.headers.get("content-length"));
    console.log("Authorization present:", !!req.headers.get("authorization"));
    
    const bodyText = await req.text();
    console.log("Raw body length:", bodyText.length);
    console.log("Raw body preview (first 500 chars):", bodyText.substring(0, 500));
    
    let body: any;
    try {
      body = JSON.parse(bodyText);
      console.log("Body parsed successfully");
      console.log("Body keys:", Object.keys(body));
      console.log("Has questions:", !!body.questions);
      console.log("Has fileContent:", !!body.fileContent);
      if (body.questions) {
        console.log("Questions count:", body.questions.length);
      }
      if (body.fileContent) {
        console.log("FileContent length:", body.fileContent.length);
      }
    } catch (e) {
      console.error("Failed to parse request JSON:", e);
      console.error("Error details:", e instanceof Error ? e.message : String(e));
      console.error("Body text was:", bodyText.substring(0, 1000));
      throw new Error(`Invalid request body: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    
    // Accept either questions array (chunked) or fileContent string (legacy)
    let parsedData: any;
    let chunkOffset = 0; // Global offset for external_id generation
    
    if (body.questions) {
      // New format: direct questions array from chunked import
      console.log("Received questions array directly, count:", body.questions.length);
      chunkOffset = body.chunk_offset || 0; // Accept offset for chunk-based imports
      console.log("Chunk offset:", chunkOffset);
      parsedData = body.questions;
    } else if (body.fileContent) {
      // Legacy format: fileContent string containing JSON
      const fileContent = body.fileContent;
      console.log("Received fileContent string, length:", fileContent?.length || 0);
      
      if (!fileContent) {
        throw new Error("No file content provided in request body");
      }

      try {
        parsedData = JSON.parse(fileContent);
        console.log("Questions data parsed successfully, total questions:", Array.isArray(parsedData) ? parsedData.length : parsedData.questions?.length || 0);
      } catch (e) {
        throw new Error(`Invalid JSON in file: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    } else {
      throw new Error("No questions or fileContent provided in request body");
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

    for (let i = 0; i < questions.length; i++) {
      const rawQ: any = questions[i]; // Use any to handle both formats
      let normalized: any = null;
      
      try {
        // Normalize the question object to handle both formats
        normalized = {
          // Auto-generate external_id if missing (use chunk_offset + local index)
          external_id: rawQ.external_id || `FA_Q${String(chunkOffset + i + 1).padStart(4, '0')}`,
          
          // Map field names
          unit_code: rawQ.unit_code,
          
          // Map question_type: use as-is (mcq, flashcard)
          question_type: rawQ.type || rawQ.question_type,
          
          // Map stem: use "question" field or "stem" field
          stem: rawQ.stem || rawQ.question,
          
          // Lowercase difficulty
          difficulty: (rawQ.difficulty || "").toLowerCase(),
          
          // Keep options as-is
          options: rawQ.options || [],
          
          // Convert correct_option_index or correct_option_indices to letter format
          correct_answer: rawQ.correct_answer || (() => {
            // Handle MCQ_MULTI with correct_option_indices array
            if (rawQ.correct_option_indices && Array.isArray(rawQ.correct_option_indices)) {
              return rawQ.correct_option_indices
                .map((idx: number) => String.fromCharCode(65 + idx))
                .join("|");
            }
            // Handle single correct_option_index
            if (typeof rawQ.correct_option_index === "number") {
              return String.fromCharCode(65 + rawQ.correct_option_index);
            }
            return null;
          })(),
          
          // Keep other fields
          official_explanation: rawQ.official_explanation || rawQ.explanation,
          estimated_time_seconds: rawQ.estimated_time_seconds || 60,
          tags: rawQ.tags || null,
        };

        // Validate required fields after normalization
        if (!normalized.unit_code || !normalized.question_type || !normalized.stem || !normalized.difficulty) {
          skipped.push({
            external_id: normalized.external_id,
            error_reason: "Missing required fields (unit_code, question_type, stem, or difficulty)",
          });
          skippedCount++;
          continue;
        }

        // Validate question type
        if (!VALID_QUESTION_TYPES.includes(normalized.question_type)) {
          skipped.push({
            external_id: normalized.external_id,
            error_reason: `Invalid question_type: ${normalized.question_type}`,
          });
          skippedCount++;
          continue;
        }

        // Validate difficulty
        if (!VALID_DIFFICULTIES.includes(normalized.difficulty)) {
          skipped.push({
            external_id: normalized.external_id,
            error_reason: `Invalid difficulty: ${normalized.difficulty}`,
          });
          skippedCount++;
          continue;
        }

        // Validate unit_code exists in FA syllabus
        if (!validUnitCodes.has(normalized.unit_code)) {
          skipped.push({
            external_id: normalized.external_id,
            error_reason: `unit_code ${normalized.unit_code} not found in FA syllabus_units`,
          });
          skippedCount++;
          continue;
        }

        // Validate MCQ questions have options
        const isMCQType = ["MCQ_SINGLE", "MCQ_MULTI", "mcq"].includes(normalized.question_type);
        if (isMCQType && (!normalized.options || normalized.options.length === 0)) {
          skipped.push({
            external_id: normalized.external_id,
            error_reason: "MCQ question missing options array",
          });
          skippedCount++;
          continue;
        }

        // Validate correct_answer for MCQ
        if (isMCQType) {
          if (!normalized.correct_answer) {
            skipped.push({
              external_id: normalized.external_id,
              error_reason: "MCQ question missing correct_answer",
            });
            skippedCount++;
            continue;
          }
          
          const letters = normalized.correct_answer.split("|");
          let invalidAnswer = false;
          for (const letter of letters) {
            const index = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (index < 0 || index >= (normalized.options?.length || 0)) {
              skipped.push({
                external_id: normalized.external_id,
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
          external_id: normalized.external_id,
          unit_code: normalized.unit_code,
          type: normalized.question_type,
          question: normalized.stem,
          options: normalized.options || [],
          difficulty: normalized.difficulty,
          explanation: normalized.official_explanation || null,
          estimated_time_seconds: normalized.estimated_time_seconds || 60,
          tags: normalized.tags || null,
          is_active: true,
        };

        // Handle MATCHING type questions - extract left_column, right_column, correct_matches
        if (normalized.question_type === "MATCHING") {
          const leftColumn = rawQ.left_column || [];
          const rightColumn = rawQ.right_column || [];
          const correctMatches = rawQ.correct_matches || {};
          
          // Convert correct_matches object {"0": 3, "1": 0} to array [[0, 3], [1, 0]]
          const correctPairs = Object.entries(correctMatches).map(
            ([leftIdx, rightIdx]) => [parseInt(leftIdx), rightIdx as number]
          );
          
          questionData.metadata = {
            leftItems: leftColumn,
            rightItems: rightColumn,
            correctPairs: correctPairs,
          };
          
          console.log(`MATCHING question ${normalized.external_id}: leftItems=${leftColumn.length}, rightItems=${rightColumn.length}, pairs=${correctPairs.length}`);
        }

        // Handle correct_answer mapping for MCQ
        const isMCQTypeForStorage = ["MCQ_SINGLE", "MCQ_MULTI", "mcq"].includes(normalized.question_type);
        if (isMCQTypeForStorage) {
          // For MCQ_SINGLE/mcq: store first letter as index (A=0, B=1, etc.)
          questionData.correct_option_index = normalized.correct_answer.charCodeAt(0) - 65;
          questionData.answer = null;
        } else {
          // Other types (CALCULATION, FILL_IN_BLANK, SHORT_ANSWER) - store as answer
          questionData.correct_option_index = null;
          questionData.answer = normalized.correct_answer || null;
        }

        // Check if question exists
        const { data: existing } = await supabase
          .from("sb_questions")
          .select("id")
          .eq("paper", "FA")
          .eq("external_id", normalized.external_id)
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
        console.error(`Error processing question ${normalized?.external_id || 'UNKNOWN'}:`, error);
        skipped.push({
          external_id: normalized?.external_id || "UNKNOWN",
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
