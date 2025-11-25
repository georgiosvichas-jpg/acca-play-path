import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Use service role key for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate input
    const requestSchema = z.object({
      session_type: z.enum(["onboarding", "daily", "quick_drill", "mini_test", "mock_exam"]),
      total_questions: z.number().int().min(0).max(1000).optional(),
      correct_answers: z.number().int().min(0).max(1000).optional(),
      raw_log: z.array(z.any()).optional(),
    });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
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

    const { session_type, total_questions, correct_answers, raw_log } = validation.data;

    // Ensure user exists in sb_users (auto-create if not)
    const { error: upsertError } = await supabaseAdmin
      .from("sb_users")
      .upsert({
        id: userId,
        email: user.email || "",
        name: user.user_metadata?.full_name || null,
      }, {
        onConflict: "id",
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error("Error upserting user to sb_users:", upsertError);
    }

    // Create session log
    const { data: session, error } = await supabaseAdmin
      .from("sb_study_sessions")
      .insert({
        user_id: userId,
        session_type,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        total_questions: total_questions || 0,
        correct_answers: correct_answers || 0,
        raw_log: raw_log || null,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Logged session for user ${userId}: ${session_type}, ${correct_answers}/${total_questions} correct`);

    return new Response(
      JSON.stringify(session),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in sessions-log:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
