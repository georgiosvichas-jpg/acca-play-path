import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ContentBatchSchema = z.object({
  paper: z.string().min(1).max(50),
  unit_code: z.string().max(50).optional(),
  type: z.string().max(20).optional(),
  difficulty: z.string().max(20).optional(),
  size: z.number().int().min(1).max(100),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse and validate input
    const body = await req.json();
    const validation = ContentBatchSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input parameters",
          details: validation.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { paper, unit_code, type, difficulty, size } = validation.data;

    // Build query
    let query = supabaseClient
      .from("sb_questions")
      .select("*")
      .eq("paper", paper);

    if (unit_code) query = query.eq("unit_code", unit_code);
    if (type) query = query.eq("type", type);
    if (difficulty) query = query.eq("difficulty", difficulty);

    // Get questions (fetch more than needed for randomization)
    const { data: questions, error } = await query.limit(size * 2);

    if (error) throw error;

    // Shuffle and limit to requested size
    const shuffled = questions?.sort(() => Math.random() - 0.5).slice(0, size) || [];

    console.log(`Fetched ${shuffled.length} questions for paper ${paper}`);

    return new Response(JSON.stringify(shuffled), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in content-batch:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
