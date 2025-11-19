import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@4.0.0'

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
      const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your StudyBuddy account</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 40px 40px 30px 40px;">
                        <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Welcome to StudyBuddy! 🎓</h1>
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #4a5568;">Thanks for signing up! Please verify your email address to get started with your ACCA exam preparation journey.</p>
                        <table role="presentation" style="margin: 30px 0;">
                          <tr>
                            <td style="border-radius: 6px; background-color: #6366f1;">
                              <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">Verify Email Address</a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #718096;">Or copy and paste this URL into your browser:</p>
                        <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 18px; color: #a0aec0; word-break: break-all;">${confirmationUrl}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #718096;">If you didn't create a StudyBuddy account, you can safely ignore this email.</p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0 0; font-size: 12px; color: #a0aec0;">© ${new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `

      const { error } = await resend.emails.send({
        from: 'StudyBuddy <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Verify your StudyBuddy account',
        html,
      })

      if (error) {
        console.error('Error sending email:', error)
        throw error
      }

      console.log('Verification email sent successfully to:', user.email)
    } else {
      console.error('SEND_EMAIL_HOOK_SECRET not configured')
      throw new Error('Webhook secret not configured')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in send-verification-email function:', error)
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
