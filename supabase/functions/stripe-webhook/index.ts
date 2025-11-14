import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("ERROR: No stripe-signature header");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!webhookSecret) {
        logStep("WARNING: STRIPE_WEBHOOK_SECRET not configured, skipping signature verification");
        // Parse without verification in development
        event = JSON.parse(body);
      } else {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Signature verified", { eventType: event.type });
      }
    } catch (err) {
      logStep("ERROR: Signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          mode: session.mode,
          metadata: session.metadata 
        });

        const customerEmail = session.customer_email || session.customer_details?.email;
        if (!customerEmail) {
          logStep("ERROR: No customer email in session");
          throw new Error("No customer email found");
        }

        // Check if this is for sb_users (from GPT) via metadata
        if (session.metadata?.sb_user_id) {
          logStep("Updating sb_users table", { sb_user_id: session.metadata.sb_user_id });
          
          const { error: sbUpdateError } = await supabaseClient
            .from("sb_users")
            .update({
              subscription_status: "premium",
            })
            .eq("id", session.metadata.sb_user_id);

          if (sbUpdateError) {
            logStep("ERROR: Failed to update sb_users", { error: sbUpdateError });
            throw sbUpdateError;
          }

          logStep("sb_users updated successfully", { sb_user_id: session.metadata.sb_user_id });
          break;
        }

        // Otherwise, update user_profiles (web app)
        let productId: string | null = null;
        let planType: "free" | "per_paper" | "pro" = "free";
        
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          productId = subscription.items.data[0]?.price.product as string;
          planType = "pro";
          logStep("Subscription detected", { productId, planType });
        } else if (session.mode === "payment") {
          planType = "per_paper";
          logStep("One-time payment detected", { planType });
        }

        // Find user by email in auth
        const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();
        if (usersError) throw usersError;

        const user = users?.find(u => u.email === customerEmail);
        if (!user) {
          logStep("ERROR: User not found", { email: customerEmail });
          throw new Error(`User not found for email: ${customerEmail}`);
        }

        logStep("User found", { userId: user.id, email: user.email });

        // Update user profile
        const updates: any = {
          plan_type: planType,
          stripe_customer_id: session.customer as string,
          subscription_status: "active",
          subscription_product_id: productId,
        };

        if (planType === "pro") {
          updates.subscription_end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        const { error: updateError } = await supabaseClient
          .from("user_profiles")
          .update(updates)
          .eq("user_id", user.id);

        if (updateError) {
          logStep("ERROR: Failed to update profile", { error: updateError });
          throw updateError;
        }

        logStep("Profile updated successfully", { userId: user.id, planType });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep(`Processing ${event.type}`, {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        const { data: profiles, error: profileError } = await supabaseClient
          .from("user_profiles")
          .select("*")
          .eq("stripe_customer_id", subscription.customer as string);

        if (profileError || !profiles || profiles.length === 0) {
          logStep("ERROR: Profile not found for customer", { customerId: subscription.customer });
          throw new Error("Profile not found");
        }

        const profile = profiles[0];
        const updates: any = {
          subscription_status: subscription.status,
        };

        if (event.type === "customer.subscription.deleted" || 
            ["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
          updates.plan_type = "free";
        } else if (subscription.status === "active") {
          updates.plan_type = "pro";
          updates.subscription_end_date = new Date(subscription.current_period_end * 1000).toISOString();
        }

        const { error: updateError } = await supabaseClient
          .from("user_profiles")
          .update(updates)
          .eq("user_id", profile.user_id);

        if (updateError) {
          logStep("ERROR: Failed to update subscription", { error: updateError });
          throw updateError;
        }

        logStep("Subscription updated successfully", { userId: profile.user_id, status: subscription.status });
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR in webhook handler", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
