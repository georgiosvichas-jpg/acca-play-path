import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Product ID mappings for tier detection
const STRIPE_PRODUCTS = {
  PRO_MONTHLY: "prod_TSovoEevwjBlAJ",
  PRO_ANNUAL: "prod_TSovAlz3AJldbA",
  ELITE_MONTHLY: "prod_TSovxpBecu5RAg",
  ELITE_ANNUAL: "prod_TSou39pPeUsXRY",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      
      // Update user profile to free plan
      await supabaseClient
        .from("user_profiles")
        .update({
          plan_type: "free",
          subscription_status: null,
          subscription_product_id: null,
          subscription_end_date: null,
        })
        .eq("user_id", user.id);

      return new Response(JSON.stringify({
        subscribed: false,
        plan_type: "free",
        unlocked_papers: [],
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10, // Get multiple in case user has multiple subscriptions
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let planType: "free" | "per_paper" | "pro" | "elite" = "free";

    if (hasActiveSub) {
      // Find the highest tier subscription
      for (const subscription of subscriptions.data) {
        if (!subscription.items.data[0]?.price?.product) {
          logStep("Skipping subscription with missing product data", { subscriptionId: subscription.id });
          continue;
        }
        
        const subProductId = subscription.items.data[0].price.product as string;
        
        // Safely handle subscription end date
        let subEndDate = null;
        try {
          if (subscription.current_period_end) {
            subEndDate = new Date(subscription.current_period_end * 1000).toISOString();
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          logStep("Error parsing subscription end date", { error: errorMsg, subscriptionId: subscription.id });
        }
        
        // Check if it's Elite
        if (subProductId === STRIPE_PRODUCTS.ELITE_MONTHLY || 
            subProductId === STRIPE_PRODUCTS.ELITE_ANNUAL) {
          planType = "elite";
          productId = subProductId;
          subscriptionEnd = subEndDate;
          break; // Elite is highest, no need to check further
        }
        
        // Check if it's Pro
        if (subProductId === STRIPE_PRODUCTS.PRO_MONTHLY || 
            subProductId === STRIPE_PRODUCTS.PRO_ANNUAL) {
          planType = "pro";
          productId = subProductId;
          subscriptionEnd = subEndDate;
          // Continue checking in case there's an Elite subscription
        }
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscriptions.data[0].id, 
        endDate: subscriptionEnd, 
        productId,
        planType 
      });
    } else {
      logStep("No active subscription found");
    }
    
    // Check for unlocked papers (per_paper purchases) - moved outside to fix scope
    const { data: profileData } = await supabaseClient
      .from("user_profiles")
      .select("unlocked_papers")
      .eq("user_id", user.id)
      .single();

    const unlockedPapers = profileData?.unlocked_papers || [];
    
    if (!hasActiveSub && unlockedPapers.length > 0) {
      planType = "per_paper";
    }

    // Update user profile with subscription status
    await supabaseClient
      .from("user_profiles")
      .update({
        plan_type: planType,
        stripe_customer_id: customerId,
        subscription_status: hasActiveSub ? "active" : null,
        subscription_product_id: productId,
        subscription_end_date: subscriptionEnd,
      })
      .eq("user_id", user.id);

    logStep("Profile updated with subscription data");

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_type: planType,
      product_id: productId,
      subscription_end: subscriptionEnd,
      unlocked_papers: unlockedPapers,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
