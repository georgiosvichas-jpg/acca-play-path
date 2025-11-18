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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, exam_paper, exam_date, weekly_study_hours } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to find existing user by email
    const { data: existingUser } = await supabaseClient
      .from("sb_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      // Update if new data provided
      if (exam_paper || exam_date || weekly_study_hours) {
        const updates: any = {};
        if (exam_paper) updates.exam_paper = exam_paper;
        if (exam_date) updates.exam_date = exam_date;
        if (weekly_study_hours) updates.weekly_study_hours = weekly_study_hours;
        updates.updated_at = new Date().toISOString();

        const { data: updated } = await supabaseClient
          .from("sb_users")
          .update(updates)
          .eq("id", existingUser.id)
          .select()
          .single();

        return new Response(
          JSON.stringify(updated || existingUser),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(existingUser),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user
    const { data: newUser, error } = await supabaseClient
      .from("sb_users")
      .insert({
        email,
        exam_paper: exam_paper || null,
        exam_date: exam_date || null,
        weekly_study_hours: weekly_study_hours || 5,
        subscription_status: "free",
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Created new sb_user for email: ${email}`);

    return new Response(
      JSON.stringify(newUser),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in users-get-or-create:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
