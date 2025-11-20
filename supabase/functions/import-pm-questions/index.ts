import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching PM question bank from public storage...");

    // Fetch the JSON file from public storage
    const questionBankUrl = `${supabaseUrl}/storage/v1/object/public/data/pm_question_bank.json`;
    const response = await fetch(questionBankUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch question bank: ${response.statusText}`);
    }

    const questions = await response.json();
    console.log(`Loaded ${questions.length} PM questions`);

    // Insert questions in batches
    const batchSize = 100;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from("sb_questions")
        .upsert(batch, { 
          onConflict: "paper,question",
          ignoreDuplicates: true 
        });

      if (error) {
        console.error(`Error importing batch ${i}-${i + batchSize}:`, error);
        skipped += batch.length;
      } else {
        imported += batch.length;
        console.log(`Imported batch ${i}-${i + batchSize}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `PM questions import completed`,
        imported,
        skipped,
        total: questions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error importing PM questions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
