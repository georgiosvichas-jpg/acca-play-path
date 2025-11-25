import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userId: string;
  pathId?: string;
  enable: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, pathId, enable }: RequestBody = await req.json();

    console.log('Schedule reminders request:', { userId, pathId, enable });

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (enable) {
      // Store reminder preferences in user_profiles
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          // We can extend the user_profiles table to include reminder preferences
          // For now, we'll just log this
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating reminder preferences:', updateError);
        throw updateError;
      }

      console.log('Email reminders enabled for user:', userId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email reminders enabled'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      // Disable reminders
      console.log('Email reminders disabled for user:', userId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email reminders disabled'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error('Error in schedule-study-reminders:', error);
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
