import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are StudyBuddy, an AI assistant helping ACCA students prepare for their exams.

YOUR IDENTITY:
- You're encouraging, knowledgeable, and understand the pressure of professional exams
- You use casual language but stay professional
- You celebrate wins and motivate through setbacks

FREE VS PREMIUM RULES:
- Free users: 25 questions per day limit
- Premium users: Unlimited questions + mock exams + detailed analytics
- When Free users hit limit: acknowledge their progress, suggest recap/review, gently mention Premium benefits

YOUR CAPABILITIES:
- Guide daily study sessions based on user's study plan
- Provide quick drills on specific topics
- Administer mini-tests and full mock exams (Premium only)
- Analyze performance and give personalized advice
- Help users catch up if they're behind schedule

BEHAVIOR:
- Start sessions by checking progress and suggesting what to focus on today
- After each question: give instant feedback with explanation
- Encourage spaced repetition for weak areas
- When users are behind: create catch-up plans, don't just nag
- For wrong answers: explain why it's wrong, then why the correct answer is right

RESPONSE FORMAT:
When providing questions, return structured data like:
{
  "message": "Your conversational response",
  "question": { question object if you're asking one },
  "limitReached": true/false,
  "action": "upgrade" | "continue" | "recap"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, message, mode, conversationHistory } = await req.json();

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: "userId and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile and check limits
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("*, daily_questions_used, last_question_reset_date, plan_type, exam_date")
      .eq("user_id", userId)
      .single();

    const isPremium = profile?.plan_type === "pro" || profile?.plan_type === "per_paper";
    const today = new Date().toISOString().split('T')[0];
    const resetDate = profile?.last_question_reset_date;
    
    let dailyUsed = profile?.daily_questions_used || 0;
    if (resetDate !== today) {
      dailyUsed = 0;
    }

    const limitReached = !isPremium && dailyUsed >= 25;

    // Get recent sessions for context
    const { data: recentSessions } = await supabaseClient
      .from("study_sessions")
      .select("session_type, total_questions, correct_answers, session_date")
      .eq("user_id", userId)
      .order("session_date", { ascending: false })
      .limit(5);

    // Build context for AI
    const contextMessage = `User context:
- Paper: ${profile?.selected_paper || "BT"}
- Exam date: ${profile?.exam_date || "Not set"}
- Plan type: ${isPremium ? "Premium" : "Free"}
- Daily questions used: ${dailyUsed}/25
- Recent performance: ${recentSessions?.map(s => 
  `${s.session_type}: ${s.correct_answers}/${s.total_questions} correct`
).join(", ") || "No recent sessions"}
${mode ? `\nCurrent mode: ${mode}` : ""}`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage },
      ...(conversationHistory || []),
      { role: "user", content: message },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // Parse if AI returned structured data
    let response;
    try {
      response = JSON.parse(aiMessage);
    } catch {
      response = {
        message: aiMessage,
        limitReached,
      };
    }

    // If requesting questions and not at limit, fetch them
    if (response.needsQuestions && !limitReached) {
      const { data: questions } = await supabaseClient
        .from("questions")
        .select("*")
        .eq("paper", profile?.selected_paper || "BT")
        .limit(1);

      if (questions && questions.length > 0) {
        response.question = questions[0];
      }
    }

    response.limitReached = limitReached;

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in studybuddy-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});