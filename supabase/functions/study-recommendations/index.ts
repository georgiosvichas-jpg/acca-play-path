import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceData {
  totalQuestions: number;
  overallAccuracy: number;
  byUnit: Record<string, { correct: number; total: number; accuracy: number }>;
  byDifficulty: Record<string, { correct: number; total: number; accuracy: number }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('Fetching performance data for user:', user.id);

    // Fetch user's study sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sb_study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('raw_log', 'is', null);

    if (sessionsError) {
      throw sessionsError;
    }

    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No performance data available. Complete some practice quizzes first!' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Analyze performance
    const performance: PerformanceData = {
      totalQuestions: 0,
      overallAccuracy: 0,
      byUnit: {},
      byDifficulty: {}
    };

    let totalCorrect = 0;

    sessions.forEach(session => {
      performance.totalQuestions += session.total_questions || 0;
      totalCorrect += session.correct_answers || 0;

      if (session.raw_log && Array.isArray(session.raw_log)) {
        session.raw_log.forEach((entry: any) => {
          // By unit
          const unit = entry.unit_code || 'Unknown';
          if (!performance.byUnit[unit]) {
            performance.byUnit[unit] = { correct: 0, total: 0, accuracy: 0 };
          }
          performance.byUnit[unit].total++;
          if (entry.correct) performance.byUnit[unit].correct++;

          // By difficulty
          const diff = entry.difficulty || 'Unknown';
          if (!performance.byDifficulty[diff]) {
            performance.byDifficulty[diff] = { correct: 0, total: 0, accuracy: 0 };
          }
          performance.byDifficulty[diff].total++;
          if (entry.correct) performance.byDifficulty[diff].correct++;
        });
      }
    });

    // Calculate accuracies
    performance.overallAccuracy = (totalCorrect / performance.totalQuestions) * 100;
    
    Object.keys(performance.byUnit).forEach(unit => {
      const stats = performance.byUnit[unit];
      stats.accuracy = (stats.correct / stats.total) * 100;
    });

    Object.keys(performance.byDifficulty).forEach(diff => {
      const stats = performance.byDifficulty[diff];
      stats.accuracy = (stats.correct / stats.total) * 100;
    });

    console.log('Performance analysis:', performance);

    // Prepare AI prompt
    const performanceSummary = `
User Performance Summary:
- Total Questions Attempted: ${performance.totalQuestions}
- Overall Accuracy: ${performance.overallAccuracy.toFixed(1)}%

Performance by Unit:
${Object.entries(performance.byUnit)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([unit, stats]) => `  ${unit}: ${stats.accuracy.toFixed(1)}% (${stats.correct}/${stats.total})`)
  .join('\n')}

Performance by Difficulty:
${Object.entries(performance.byDifficulty)
  .map(([diff, stats]) => `  ${diff}: ${stats.accuracy.toFixed(1)}% (${stats.correct}/${stats.total})`)
  .join('\n')}
`;

    console.log('Calling Lovable AI for recommendations...');

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert ACCA study advisor analyzing student performance on BT (Business and Technology) practice questions. Your role is to:
1. Identify weak areas (units or difficulty levels with accuracy < 70%)
2. Recognize strong areas (accuracy > 80%)
3. Provide specific, actionable study recommendations
4. Prioritize recommendations by impact (focus on weakest areas first)
5. Be encouraging and supportive in your tone

ACCA BT Units Context:
- BT01-BT06: Core business concepts
- BT07-BT12: Technology and systems
- BT13-BT16: Professional values and ethics

Difficulty levels represent question complexity: easy, medium, hard.`
          },
          {
            role: 'user',
            content: `Analyze this student's performance and provide personalized study recommendations:\n\n${performanceSummary}\n\nProvide 3-5 specific recommendations on which units or difficulty levels to focus on, and brief reasoning for each.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_recommendations',
              description: 'Return structured study recommendations based on performance analysis',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'A brief 1-2 sentence summary of overall performance'
                  },
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'string',
                          description: 'Short title for the recommendation (e.g., "Focus on BT03")'
                        },
                        description: {
                          type: 'string',
                          description: 'Detailed explanation of why this is recommended'
                        },
                        priority: {
                          type: 'string',
                          enum: ['high', 'medium', 'low'],
                          description: 'Priority level based on impact'
                        },
                        targetArea: {
                          type: 'string',
                          description: 'The specific unit code (e.g., "BT03") or difficulty level (e.g., "medium")'
                        },
                        actionItems: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'List of 2-3 specific actions the student should take'
                        }
                      },
                      required: ['title', 'description', 'priority', 'targetArea', 'actionItems'],
                      additionalProperties: false
                    },
                    minItems: 3,
                    maxItems: 5
                  },
                  encouragement: {
                    type: 'string',
                    description: 'An encouraging message to motivate the student'
                  }
                },
                required: ['summary', 'recommendations', 'encouragement'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_recommendations' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }

      throw new Error(`AI API returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract recommendations from tool call
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const recommendations = JSON.parse(toolCall.function.arguments);
    console.log('Recommendations generated:', recommendations);

    return new Response(
      JSON.stringify({
        performance,
        recommendations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in study-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
