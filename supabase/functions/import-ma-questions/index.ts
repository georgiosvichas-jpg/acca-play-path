import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MAQuestion {
  paper: string;
  unit_code: string;
  type: string;
  difficulty: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting MA questions import...');

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch JSON file from public storage
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/data/ma_question_bank.json`;
    console.log(`Fetching questions from: ${publicUrl}`);
    
    const fileResponse = await fetch(publicUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch question bank file: ${fileResponse.statusText}`);
    }
    
    const questions: MAQuestion[] = await fileResponse.json();
    
    if (!Array.isArray(questions)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON format. Expected array of questions.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Loaded ${questions.length} questions from file`);

    // Check if questions already exist to avoid duplicates
    const { data: existingQuestions } = await supabase
      .from('sb_questions')
      .select('question')
      .eq('paper', 'MA')
      .limit(1);

    if (existingQuestions && existingQuestions.length > 0) {
      console.log('MA questions already exist in database');
      return new Response(
        JSON.stringify({ 
          message: 'MA questions already imported',
          count: 0,
          alreadyExists: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform and insert questions in batches
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      const questionsToInsert = batch.map((q) => ({
        paper: q.paper,
        unit_code: q.unit_code || null,
        type: q.type,
        difficulty: q.difficulty || null,
        question: q.question,
        options: q.options, // This will be stored as JSONB
        correct_option_index: q.correct_option_index,
        explanation: q.explanation || null,
        learning_outcome_code: null, // Not provided in the JSON
        answer: null, // Not provided in the JSON (MCQs use correct_option_index instead)
      }));

      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} questions)...`);

      const { error } = await supabase
        .from('sb_questions')
        .insert(questionsToInsert);

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }

      totalInserted += batch.length;
    }

    console.log(`Successfully imported ${totalInserted} MA questions`);

    return new Response(
      JSON.stringify({ 
        message: 'MA questions imported successfully',
        count: totalInserted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-ma-questions function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
