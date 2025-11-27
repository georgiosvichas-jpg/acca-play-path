import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, options, unit_code, unit_name, difficulty } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an experienced ACCA exam tutor helping students develop strategic thinking skills. Your job is to provide helpful hints that guide students toward the right approach WITHOUT revealing the answer.

CRITICAL RULES:
1. NEVER mention which option is correct (A, B, C, or D)
2. NEVER paraphrase or directly hint at the answer
3. Guide students toward the relevant concept, formula, accounting principle, or framework they need
4. Ask thought-provoking questions that help them reason through the problem
5. Provide strategic direction like "Consider what accounts are affected" or "Think about the formula for..."
6. Keep hints concise: 1-3 sentences maximum
7. Focus on the conceptual framework or methodology needed, not the specific answer

Your hint should help students THINK THROUGH the problem, not give them the solution.`;

    const userPrompt = `Question: ${question}

${options && options.length > 0 ? `Options:\n${options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}\n` : ''}
${unit_name ? `Topic: ${unit_name}` : ''}
${difficulty ? `Difficulty: ${difficulty}` : ''}

Provide a strategic hint that helps the student think through this question without revealing the answer.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const hint = data.choices?.[0]?.message?.content;

    if (!hint) {
      throw new Error('No hint generated from AI');
    }

    return new Response(
      JSON.stringify({ hint }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-hint function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate hint' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
