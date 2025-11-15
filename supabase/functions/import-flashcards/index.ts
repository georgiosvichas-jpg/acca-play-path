import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlashcardRow {
  paper_code: string;
  paper_name: string;
  unit_title: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  source_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role using user_roles table
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.log("Non-admin user attempted to import flashcards:", userData.user.id);
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("Admin user verified:", userData.user.id);

    console.log("Starting flashcard import...");

    // Fetch CSV from public directory
    const csvUrl = "https://f96e568f-61ab-4a8c-b65f-315967d1abcd.lovableproject.com/data/acca_flashcards_dataset.csv";
    console.log("Fetching CSV from:", csvUrl);
    
    const csvResponse = await fetch(csvUrl);
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.statusText}`);
    }
    
    const csvData = await csvResponse.text();
    console.log("CSV fetched successfully");

    // Parse CSV
    const lines = csvData.trim().split(/\r?\n/);
    const headers = lines[0].split(",");
    
    console.log(`Processing ${lines.length - 1} flashcards...`);

    const flashcards: FlashcardRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle CSV parsing with potential commas in quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length === headers.length) {
        flashcards.push({
          paper_code: values[0],
          paper_name: values[1],
          unit_title: values[2],
          category: values[3],
          difficulty: values[4],
          question: values[5],
          answer: values[6],
          source_type: values[7] || "Mini-problem",
        });
      }
    }

    console.log(`Parsed ${flashcards.length} flashcards`);

    // Check if flashcards already exist
    const { count: existingCount } = await supabaseClient
      .from("flashcards")
      .select("*", { count: "exact", head: true });

    if (existingCount && existingCount > 0) {
      console.log(`Found ${existingCount} existing flashcards. Clearing table...`);
      
      // Delete existing flashcards
      const { error: deleteError } = await supabaseClient
        .from("flashcards")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) {
        console.error("Error deleting existing flashcards:", deleteError);
      }
    }

    // Insert in batches of 100
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < flashcards.length; i += batchSize) {
      const batch = flashcards.slice(i, i + batchSize);
      
      const { error: insertError } = await supabaseClient
        .from("flashcards")
        .insert(batch.map(fc => ({
          paper_code: fc.paper_code,
          paper_name: fc.paper_name,
          unit_title: fc.unit_title,
          category: fc.category,
          difficulty: fc.difficulty,
          question: fc.question,
          answer: fc.answer,
          source_type: fc.source_type,
          xp: 1, // 1 XP per flashcard
        })));

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }

      imported += batch.length;
      console.log(`Imported ${imported}/${flashcards.length} flashcards`);
    }

    console.log(`Successfully imported ${imported} flashcards`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: imported,
        total: flashcards.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in import-flashcards:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
