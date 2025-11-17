import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BTQuestion {
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
    console.log('Starting BT questions import...');

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the JSON file from the public data folder
    const baseUrl = supabaseUrl.replace('.supabase.co', '.supabase.co');
    const jsonUrl = `${baseUrl}/storage/v1/object/public/data/bt_question_bank.json`;
    
    console.log('Fetching BT questions from public folder...');
    
    // Since it's in the public folder, we need to fetch it differently
    // Let's read it from the uploaded file URL directly
    const fileResponse = await fetch(`${supabaseUrl.replace('/v1', '')}/storage/v1/object/public/data/bt_question_bank.json`);
    
    // If that doesn't work, try fetching from the public folder directly via the app URL
    let questions: BTQuestion[];
    
    try {
      // Try to get from the origin header if available
      const origin = req.headers.get('origin') || supabaseUrl;
      const publicUrl = `${origin}/data/bt_question_bank.json`;
      console.log(`Attempting to fetch from: ${publicUrl}`);
      
      const response = await fetch(publicUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }
      
      questions = await response.json();
      console.log(`Loaded ${questions.length} questions from JSON file`);
    } catch (error) {
      console.error('Error fetching from public URL:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch question bank file. Please ensure bt_question_bank.json is in the public/data folder.',
          details: errorMessage 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if questions already exist to avoid duplicates
    const { data: existingQuestions } = await supabase
      .from('sb_questions')
      .select('question')
      .eq('paper', 'BT')
      .limit(1);

    if (existingQuestions && existingQuestions.length > 0) {
      console.log('BT questions already exist in database');
      return new Response(
        JSON.stringify({ 
          message: 'BT questions already imported',
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

    console.log(`Successfully imported ${totalInserted} BT questions`);

    return new Response(
      JSON.stringify({ 
        message: 'BT questions imported successfully',
        count: totalInserted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-bt-questions function:', error);
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
