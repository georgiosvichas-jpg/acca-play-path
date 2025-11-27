import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface for FM question structure
interface FMQuestion {
  paper: string;
  unit_code: string;
  type: string;
  difficulty: string;
  question: string;
  options?: string[];
  correct_option_index?: number;
  explanation: string;
  model_answer?: string;
  marking_points?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting FM question import...');

    // Accept questions in request body
    const { questions: inputQuestions } = await req.json();
    
    if (!inputQuestions || !Array.isArray(inputQuestions)) {
      throw new Error('Invalid request: questions array required');
    }

    console.log(`Received ${inputQuestions.length} FM questions to process`);

    // Transform and upsert questions
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const skippedDetails: Array<{ external_id: string; error_reason: string }> = [];

    for (const q of inputQuestions) {
      try {
        // Generate external_id if missing
        const externalId = q.external_id || `FM_Q${String(inputQuestions.indexOf(q) + 1).padStart(3, '0')}`;
        
        // Force paper to FM
        const transformedQuestion = {
          paper: 'FM',
          external_id: externalId,
          unit_code: q.unit_code || null,
          type: q.type || 'MCQ_SINGLE',
          difficulty: q.difficulty ? q.difficulty.toLowerCase() : null,
          question: q.question,
          options: q.options || null,
          correct_option_index: q.correct_option_index ?? null,
          explanation: q.explanation || null,
          answer: q.model_answer || null,
          learning_outcome_code: null,
          estimated_time_seconds: 60,
        };

        // Upsert by (paper, external_id)
        const { error, data } = await supabase
          .from('sb_questions')
          .upsert(transformedQuestion, { 
            onConflict: 'paper,external_id',
            ignoreDuplicates: false 
          })
          .select();

        if (error) {
          console.error(`Error upserting question ${externalId}:`, error);
          skipped++;
          skippedDetails.push({
            external_id: externalId,
            error_reason: error.message,
          });
        } else {
          // Check if it was an insert or update based on created_at
          if (data && data.length > 0) {
            const now = new Date().getTime();
            const createdAt = new Date(data[0].created_at).getTime();
            if (now - createdAt < 1000) {
              inserted++;
            } else {
              updated++;
            }
          }
        }
      } catch (err: any) {
        const externalId = q.external_id || `FM_Q${String(inputQuestions.indexOf(q) + 1).padStart(3, '0')}`;
        console.error(`Error processing question ${externalId}:`, err);
        skipped++;
        skippedDetails.push({
          external_id: externalId,
          error_reason: err.message || 'Unknown error',
        });
      }
    }

    console.log(`Import complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        summary: {
          total_questions: inputQuestions.length,
          inserted_count: inserted,
          updated_count: updated,
          skipped_count: skipped,
        },
        skipped: skippedDetails,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Import failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error occurred',
        details: error?.toString() || 'No additional details'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
