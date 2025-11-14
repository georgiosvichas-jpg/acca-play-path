import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const RequestSchema = z.object({
  paper: z.string().min(1, "Paper code required").max(50, "Paper code too long"),
  unit_code: z.string().max(50, "Unit code too long").optional(),
  type: z.string().max(50, "Type too long").optional(),
  difficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "Difficulty must be easy, medium, or hard" })
  }).optional(),
  size: z.number().int("Size must be an integer").min(1, "Size must be at least 1").max(100, "Size cannot exceed 100"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Parse and validate request body
    const body = await req.json();
    const validationResult = RequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return new Response(
        JSON.stringify({ error: "Invalid input", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { paper, unit_code, type, difficulty, size } = validationResult.data;

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