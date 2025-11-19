import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { PasswordResetEmail } from './_templates/password-reset-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    // Verify webhook signature if secret is set
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      const verifiedPayload = wh.verify(payload, headers) as {
        user: { email: string }
        email_data: {
          token: string
          token_hash: string
          redirect_to: string
          email_action_type: string
        }
      }

      const { user, email_data } = verifiedPayload
      const resetUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`

      const html = await renderAsync(
        React.createElement(PasswordResetEmail, {
          resetUrl,
          email: user.email,
        })
      )

      const { error } = await resend.emails.send({
        from: 'StudyBuddy <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Reset your StudyBuddy password',
        html,
      })

      if (error) {
        console.error('Error sending email:', error)
        throw error
      }

      console.log('Password reset email sent successfully to:', user.email)
    } else {
      console.error('SEND_EMAIL_HOOK_SECRET not configured')
      throw new Error('Webhook secret not configured')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in send-password-reset-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
