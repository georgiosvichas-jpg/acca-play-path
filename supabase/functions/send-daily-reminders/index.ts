import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    console.log('Starting daily reminder job...');

    // Get all active study paths
    const { data: paths, error: pathsError } = await supabase
      .from('study_paths')
      .select(`
        id,
        user_id,
        exam_date,
        path_data,
        progress
      `)
      .eq('is_active', true);

    if (pathsError) {
      console.error('Error fetching study paths:', pathsError);
      throw pathsError;
    }

    console.log(`Found ${paths?.length || 0} active study paths`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let remindersSent = 0;

    // Process each user's study path
    for (const path of paths || []) {
      try {
        // Get user email from auth
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(path.user_id);
        
        if (userError || !user?.email) {
          console.log(`Skipping user ${path.user_id} - no email found`);
          continue;
        }

        const pathData = path.path_data as any;
        const progress = path.progress as Record<string, boolean> || {};

        // Find today's tasks
        const todaysTasks: string[] = [];
        const examDate = new Date(path.exam_date);
        
        pathData.weeks?.forEach((week: any) => {
          week.dailyTasks?.forEach((day: any, dayIdx: number) => {
            const dayDate = new Date(examDate);
            dayDate.setDate(dayDate.getDate() - (pathData.weeks.length - week.weekNumber) * 7 + dayIdx);
            dayDate.setHours(0, 0, 0, 0);
            
            if (dayDate.getTime() === today.getTime()) {
              day.tasks?.forEach((task: string, taskIdx: number) => {
                const taskId = `w${week.weekNumber}-d${dayIdx}-t${taskIdx}`;
                if (!progress[taskId]) {
                  todaysTasks.push(task);
                }
              });
            }
          });
        });

        if (todaysTasks.length === 0) {
          console.log(`No pending tasks for user ${path.user_id} today`);
          continue;
        }

        // Send email reminder
        const { error: emailError } = await resend.emails.send({
          from: 'StudyBuddy <notifications@studybuddy.app>',
          to: user.email,
          subject: `📚 You have ${todaysTasks.length} study task${todaysTasks.length > 1 ? 's' : ''} today`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Good morning! Time to study 🎓</h2>
              <p>You have <strong>${todaysTasks.length}</strong> task${todaysTasks.length > 1 ? 's' : ''} scheduled for today:</p>
              <ul style="line-height: 1.8;">
                ${todaysTasks.map(task => `<li>${task}</li>`).join('')}
              </ul>
              <p style="margin-top: 24px;">
                <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/planner" 
                   style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Your Study Plan
                </a>
              </p>
              <p style="color: #666; font-size: 12px; margin-top: 24px;">
                To stop receiving these reminders, turn off email notifications in your study planner settings.
              </p>
            </div>
          `,
        });

        if (emailError) {
          console.error(`Error sending email to ${user.email}:`, emailError);
        } else {
          console.log(`Reminder sent to ${user.email}`);
          remindersSent++;
        }
      } catch (error) {
        console.error(`Error processing path ${path.id}:`, error);
      }
    }

    console.log(`Daily reminder job completed. Sent ${remindersSent} reminders.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        remindersSent,
        message: `Sent ${remindersSent} reminders`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-daily-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
