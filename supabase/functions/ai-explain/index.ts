import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, correctAnswer, options, explanation } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert ACCA tutor providing clear, detailed explanations for exam questions.
Your role is to help students understand:
1. Why the correct answer is right
2. Why their answer was wrong (if applicable)
3. Key concepts they need to remember
4. Tips to avoid similar mistakes

Keep explanations clear, structured, and educational. Use bullet points where appropriate.`;

    const userPrompt = `Question: ${question}

Options:
${options?.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n") || "N/A"}

Correct Answer: ${correctAnswer}
${userAnswer ? `Student's Answer: ${userAnswer}` : ""}
${explanation ? `Official Explanation: ${explanation}` : ""}

Please provide a detailed explanation covering:
1. Why the correct answer is right
${userAnswer && userAnswer !== correctAnswer ? "2. Why the student's answer was incorrect" : ""}
${userAnswer && userAnswer !== correctAnswer ? "3. Key concepts to understand" : "2. Key concepts to understand"}
${userAnswer && userAnswer !== correctAnswer ? "4. Tips to remember for similar questions" : "3. Tips to remember for similar questions"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add credits to your workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const explanation_text = data.choices?.[0]?.message?.content || "No explanation available";

    return new Response(JSON.stringify({ explanation: explanation_text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-explain function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
