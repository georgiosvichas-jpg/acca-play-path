import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Flashcard {
  front: string;
  back: string;
  tag: string;
}

interface GenerationResult {
  success: boolean;
  summary: {
    total_generated: number;
    inserted: number;
    skipped_duplicates: number;
  };
  preview: Array<{
    unit_code: string;
    unit_name: string;
    front: string;
    back: string;
    tag: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
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

    // Get paper_code from request body
    const body = await req.json();
    const paperCode = body.paper_code;

    if (!paperCode) {
      throw new Error("paper_code is required in request body");
    }

    // Get paper details
    const { data: paperData } = await supabase
      .from("papers")
      .select("title")
      .eq("paper_code", paperCode)
      .single();

    const paperTitle = paperData?.title || paperCode;

    console.log(`Fetching ${paperCode} syllabus units...`);
    const { data: syllabusUnits, error: syllabusError } = await supabase
      .from("syllabus_units")
      .select("unit_code, unit_name, description")
      .eq("paper_code", paperCode)
      .order("unit_code");

    if (syllabusError) throw syllabusError;
    if (!syllabusUnits || syllabusUnits.length === 0) {
      throw new Error(`No syllabus units found for ${paperCode}`);
    }

    console.log(`Found ${syllabusUnits.length} ${paperCode} syllabus units`);

    // Fetch all questions for this paper
    console.log(`Fetching ${paperCode} questions...`);
    const { data: questions, error: questionsError } = await supabase
      .from("sb_questions")
      .select("unit_code, question, explanation, options")
      .eq("paper", paperCode);

    if (questionsError) throw questionsError;
    console.log(`Found ${questions?.length || 0} ${paperCode} questions`);

    let totalGenerated = 0;
    let totalInserted = 0;
    let totalSkipped = 0;
    const preview: Array<any> = [];

    // Process each unit
    for (const unit of syllabusUnits) {
      console.log(`Processing unit: ${unit.unit_code} - ${unit.unit_name}`);

      // Get questions for this unit
      const unitQuestions = questions?.filter(q => q.unit_code === unit.unit_code) || [];
      
      // Build context for AI
      const context = {
        unit_code: unit.unit_code,
        unit_name: unit.unit_name,
        unit_description: unit.description || "",
        sample_questions: unitQuestions.slice(0, 5).map(q => ({
          question: q.question,
          explanation: q.explanation,
        })),
      };

      const prompt = `Generate 5-15 flashcards for the ACCA ${paperCode} (${paperTitle}) syllabus unit below.

Unit: ${context.unit_code} - ${context.unit_name}
Description: ${context.unit_description}

Sample questions from this unit:
${context.sample_questions.map((q, i) => `${i + 1}. ${q.question}\nExplanation: ${q.explanation || "N/A"}`).join("\n\n")}

Create flashcards that cover:
- Key term definitions
- Basic formulas or calculations
- Conceptual contrasts
- Core principles
- Practical applications

Each flashcard should have:
- front: A clear question or term to test
- back: A concise, accurate answer (2-4 sentences max)
- tag: One of ["definition", "formula", "concept", "principle", "application"]

Generate between 5-15 flashcards depending on the complexity of the unit.`;

      try {
        // Call Lovable AI with tool calling for structured output
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: `You are an ACCA ${paperCode} exam expert creating study flashcards.` },
              { role: "user", content: prompt },
            ],
            tools: [{
              type: "function",
              function: {
                name: "create_flashcards",
                description: "Generate flashcards for a syllabus unit",
                parameters: {
                  type: "object",
                  properties: {
                    flashcards: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          front: { type: "string", description: "Question or term" },
                          back: { type: "string", description: "Answer or definition" },
                          tag: { 
                            type: "string", 
                            enum: ["definition", "formula", "concept", "principle", "application"],
                            description: "Flashcard type"
                          },
                        },
                        required: ["front", "back", "tag"],
                      },
                    },
                  },
                  required: ["flashcards"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "create_flashcards" } },
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for ${unit.unit_code}:`, aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall) {
          console.error(`No tool call for ${unit.unit_code}`);
          continue;
        }

        const flashcardsData = JSON.parse(toolCall.function.arguments);
        const flashcards: Flashcard[] = flashcardsData.flashcards || [];
        
        console.log(`Generated ${flashcards.length} flashcards for ${unit.unit_code}`);
        totalGenerated += flashcards.length;

        // Insert flashcards with duplicate checking
        for (const card of flashcards) {
          // Check for duplicate
          const { data: existing } = await supabase
            .from("flashcards")
            .select("id")
            .eq("paper_code", paperCode)
            .eq("question", card.front)
            .eq("unit_title", unit.unit_name)
            .maybeSingle();

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Insert new flashcard
          const { error: insertError } = await supabase
            .from("flashcards")
            .insert({
              paper_code: paperCode,
              paper_name: paperTitle,
              unit_title: unit.unit_name,
              question: card.front,
              answer: card.back,
              category: card.tag,
              source_type: "AI-generated",
              difficulty: "MEDIUM",
              xp: 10,
            });

          if (insertError) {
            console.error(`Error inserting flashcard for ${unit.unit_code}:`, insertError);
            totalSkipped++;
          } else {
            totalInserted++;
            
            // Add to preview (first 10)
            if (preview.length < 10) {
              preview.push({
                unit_code: unit.unit_code,
                unit_name: unit.unit_name,
                front: card.front,
                back: card.back,
                tag: card.tag,
              });
            }
          }
        }

      } catch (error) {
        console.error(`Error processing ${unit.unit_code}:`, error);
        continue;
      }
    }

    const result: GenerationResult = {
      success: true,
      summary: {
        total_generated: totalGenerated,
        inserted: totalInserted,
        skipped_duplicates: totalSkipped,
      },
      preview,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating flashcards:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
