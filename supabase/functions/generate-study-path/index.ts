import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceData {
  byUnit: Record<string, { correct: number; total: number; accuracy: number }>;
  byDifficulty: Record<string, { correct: number; total: number; accuracy: number }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { examDate, weeksAvailable, papers } = await req.json();

    if (!examDate || !weeksAvailable || !papers || papers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: examDate, weeksAvailable, and papers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('Generating study path for user:', user.id, 'Papers:', papers);

    // Fetch syllabus units for selected papers
    const { data: syllabusUnits, error: syllabusError } = await supabase
      .from('syllabus_units')
      .select('*')
      .in('paper_code', papers)
      .order('paper_code, unit_code');

    if (syllabusError) throw syllabusError;

    // Group units by paper
    const unitsByPaper: Record<string, any[]> = {};
    syllabusUnits?.forEach(unit => {
      if (!unitsByPaper[unit.paper_code]) {
        unitsByPaper[unit.paper_code] = [];
      }
      unitsByPaper[unit.paper_code].push(unit);
    });

    // Fetch user's study sessions for performance analysis
    const { data: sessions, error: sessionsError } = await supabase
      .from('sb_study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('raw_log', 'is', null);

    if (sessionsError) throw sessionsError;

    // Analyze performance
    const performance: PerformanceData = {
      byUnit: {},
      byDifficulty: {}
    };

    if (sessions && sessions.length > 0) {
      sessions.forEach(session => {
        if (session.raw_log && Array.isArray(session.raw_log)) {
          session.raw_log.forEach((entry: any) => {
            const unit = entry.unit_code || 'Unknown';
            if (!performance.byUnit[unit]) {
              performance.byUnit[unit] = { correct: 0, total: 0, accuracy: 0 };
            }
            performance.byUnit[unit].total++;
            if (entry.correct) performance.byUnit[unit].correct++;

            const diff = entry.difficulty || 'Unknown';
            if (!performance.byDifficulty[diff]) {
              performance.byDifficulty[diff] = { correct: 0, total: 0, accuracy: 0 };
            }
            performance.byDifficulty[diff].total++;
            if (entry.correct) performance.byDifficulty[diff].correct++;
          });
        }
      });

      Object.keys(performance.byUnit).forEach(unit => {
        const stats = performance.byUnit[unit];
        stats.accuracy = (stats.correct / stats.total) * 100;
      });

      Object.keys(performance.byDifficulty).forEach(diff => {
        const stats = performance.byDifficulty[diff];
        stats.accuracy = (stats.correct / stats.total) * 100;
      });
    }

    // Prepare context for AI
    const performanceContext = sessions && sessions.length > 0 
      ? `
Current Performance:
${Object.entries(performance.byUnit)
  .sort((a, b) => a[1].accuracy - b[1].accuracy)
  .map(([unit, stats]) => `  ${unit}: ${stats.accuracy.toFixed(1)}% (${stats.correct}/${stats.total})`)
  .join('\n')}
`
      : 'No prior performance data - creating beginner study plan.';

    console.log('Calling Lovable AI for study path generation...');

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
            content: `You are an expert ACCA study planner creating personalized multi-week study schedules.

Available Papers and Units:
${papers.map((paperCode: string) => {
  const units = unitsByPaper[paperCode] || [];
  return `${paperCode}: ${units.map(u => u.unit_code).join(', ')}`;
}).join('\n')}

Study Planning Principles:
1. Build foundation first (cover fundamental units early)
2. Progress to intermediate then advanced topics
3. Include review weeks for weak areas
4. Gradual difficulty progression (easy → medium → hard)
5. Regular revision and mock tests
6. Balance multiple papers if applicable
7. Leave final week for full exam simulation

Create realistic, achievable plans with:
- Daily study goals (1-3 hours max)
- Specific unit focus per week
- Mix of learning and practice activities
- Built-in review sessions
- Rest days to prevent burnout

CRITICAL: For each task, specify the activity type, paper, and unit so tasks can be linked to the correct feature.
Task format: "Practice [PAPER] [UNIT]: [Description]" or "Review flashcards for [PAPER] [UNIT]" or "Mock exam for [PAPER]"`
          },
          {
            role: 'user',
            content: `Create a ${weeksAvailable}-week personalized study plan for papers: ${papers.join(', ')} with exam on ${examDate}.

${performanceContext}

Requirements:
- ${weeksAvailable} weeks of structured study
- Cover all selected papers: ${papers.join(', ')}
- Target weak areas first
- Progressive difficulty increase
- Weekly goals and daily tasks
- Balance study time across papers
- Include mock exam in final week
- Each task must specify paper code and unit code for linking`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_study_path',
              description: 'Generate a complete multi-week study plan',
              parameters: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Title for the study plan'
                  },
                  description: {
                    type: 'string',
                    description: 'Brief overview of the study plan approach'
                  },
                  weeks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        weekNumber: {
                          type: 'integer',
                          description: 'Week number (1, 2, 3, etc.)'
                        },
                        title: {
                          type: 'string',
                          description: 'Week title (e.g., "Foundation Building")'
                        },
                        focus: {
                          type: 'string',
                          description: 'Main focus areas for this week (e.g., "BT01-BT03")'
                        },
                        goals: {
                          type: 'array',
                          items: { type: 'string' },
                          description: '3-5 specific goals for the week'
                        },
                        dailyTasks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              day: {
                                type: 'string',
                                description: 'Day of week (Monday-Sunday)'
                              },
                              tasks: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'List of tasks for this day'
                              },
                              estimatedHours: {
                                type: 'number',
                                description: 'Estimated study hours (1-3)'
                              }
                            },
                            required: ['day', 'tasks', 'estimatedHours']
                          }
                        }
                      },
                      required: ['weekNumber', 'title', 'focus', 'goals', 'dailyTasks']
                    }
                  },
                  tips: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'General study tips and advice'
                  }
                },
                required: ['title', 'description', 'weeks', 'tips'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_study_path' } }
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

    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const studyPath = JSON.parse(toolCall.function.arguments);
    console.log('Study path generated');

    // Save study path to database
    const { data: savedPath, error: saveError } = await supabase
      .from('study_paths')
      .insert({
        user_id: user.id,
        exam_date: examDate,
        weeks_duration: weeksAvailable,
        papers: papers,
        path_data: studyPath,
        is_active: true
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving study path:', saveError);
      // Continue anyway, return the path even if save fails
    }

    return new Response(
      JSON.stringify({
        studyPath,
        savedPathId: savedPath?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-study-path:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
