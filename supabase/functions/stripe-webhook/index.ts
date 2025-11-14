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
        logStep("WARNING: STRIPE_WEBHOOK_SECRET not set, skipping signature verification");
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
          mode: session.mode 
        });

        const customerEmail = session.customer_email || session.customer_details?.email;
        if (!customerEmail) {
          logStep("ERROR: No customer email in session");
          throw new Error("No customer email found");
        }

        // Get the price and product info
        let productId: string | null = null;
        let planType: "free" | "per_paper" | "pro" = "free";
        
        if (session.mode === "subscription" && session.subscription) {
          // Fetch subscription to get product info
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          productId = subscription.items.data[0]?.price.product as string;
          planType = "pro"; // Subscription = Pro
          logStep("Subscription detected", { productId, planType });
        } else if (session.mode === "payment") {
          // One-time payment = per_paper
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          if (lineItems.data.length > 0) {
            const priceId = lineItems.data[0].price?.id;
            if (priceId) {
              const price = await stripe.prices.retrieve(priceId);
              productId = price.product as string;
            }
          }
          planType = "per_paper";
          logStep("One-time payment detected", { productId, planType });
        }

        // Find user by email
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
          // For subscriptions, set end date to 30 days from now (will be updated on renewal)
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

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", {
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
        const productId = subscription.items.data[0]?.price.product as string;

        const updates: any = {
          subscription_status: subscription.status,
          subscription_product_id: productId,
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        };

        // Update plan_type based on subscription status
        if (subscription.status === "active") {
          updates.plan_type = "pro";
        } else if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
          updates.plan_type = "free";
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

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });

        const { data: profiles, error: profileError } = await supabaseClient
          .from("user_profiles")
          .select("*")
          .eq("stripe_customer_id", subscription.customer as string);

        if (profileError || !profiles || profiles.length === 0) {
          logStep("ERROR: Profile not found for customer", { customerId: subscription.customer });
          throw new Error("Profile not found");
        }

        const profile = profiles[0];

        const { error: updateError } = await supabaseClient
          .from("user_profiles")
          .update({
            plan_type: "free",
            subscription_status: "canceled",
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("user_id", profile.user_id);

        if (updateError) {
          logStep("ERROR: Failed to cancel subscription", { error: updateError });
          throw updateError;
        }

        logStep("Subscription canceled successfully", { userId: profile.user_id });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_succeeded", { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription 
        });

        // For recurring subscription payments, extend the subscription
        if (invoice.subscription) {
          const { data: profiles, error: profileError } = await supabaseClient
            .from("user_profiles")
            .select("*")
            .eq("stripe_customer_id", invoice.customer as string);

          if (profileError || !profiles || profiles.length === 0) {
            logStep("WARNING: Profile not found for invoice payment", { customerId: invoice.customer });
            break;
          }

          const profile = profiles[0];
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

          const { error: updateError } = await supabaseClient
            .from("user_profiles")
            .update({
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              subscription_status: "active",
            })
            .eq("user_id", profile.user_id);

          if (updateError) {
            logStep("ERROR: Failed to extend subscription", { error: updateError });
            throw updateError;
          }

          logStep("Subscription extended successfully", { userId: profile.user_id });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});