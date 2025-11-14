import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { paper, unit_code, type, difficulty, size } = await req.json();

    if (!paper || !size) {
      return new Response(
        JSON.stringify({ error: "paper and size are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build query
    let query = supabaseClient
      .from("questions")
      .select("*")
      .eq("paper", paper);

    if (unit_code) query = query.eq("unit_code", unit_code);
    if (type) query = query.eq("type", type);
    if (difficulty) query = query.eq("difficulty", difficulty);

    // Get random questions up to size
    const { data: questions, error } = await query.limit(size * 2); // Get more to randomize

    if (error) throw error;

    // Shuffle and limit to requested size
    const shuffled = questions?.sort(() => Math.random() - 0.5).slice(0, size) || [];

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