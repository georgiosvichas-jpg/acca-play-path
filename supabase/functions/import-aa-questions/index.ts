import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface for AA question structure
interface AAQuestion {
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

    console.log('Starting AA question import...');

    // Fetch the AA question bank JSON from storage
    const jsonUrl = `${supabaseUrl}/storage/v1/object/public/data/aa_question_bank.json`;
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch AA question bank: ${response.statusText}`);
    }

    const questions: AAQuestion[] = await response.json();
    
    if (!Array.isArray(questions)) {
      throw new Error('Invalid JSON format: expected an array of questions');
    }

    console.log(`Loaded ${questions.length} AA questions from JSON`);

    // Check if AA questions already exist
    const { count: existingCount } = await supabase
      .from('sb_questions')
      .select('id', { count: 'exact' })
      .eq('paper', 'AA');

    if (existingCount && existingCount > 0) {
      return new Response(
        JSON.stringify({ 
          message: 'AA questions already imported',
          count: existingCount,
          skipped: questions.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Transform and insert questions in batches
    const batchSize = 100;
    let imported = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      const transformedBatch = batch.map(q => ({
        paper: q.paper,
        unit_code: q.unit_code || null,
        type: q.type,
        difficulty: q.difficulty || null,
        question: q.question,
        options: q.options || null,
        correct_option_index: q.correct_option_index ?? null,
        explanation: q.explanation || null,
        answer: q.model_answer || null,
        learning_outcome_code: null
      }));

      const { error, data } = await supabase
        .from('sb_questions')
        .insert(transformedBatch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errors += batch.length;
        errorDetails.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        const count = data?.length || batch.length;
        imported += count;
        console.log(`Imported batch ${i / batchSize + 1}: ${count} questions`);
      }
    }

    console.log(`Import complete. Imported: ${imported}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({ 
        message: 'AA questions import complete',
        imported,
        errors,
        total: questions.length,
        errorDetails: errorDetails.length > 0 ? errorDetails : undefined
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
