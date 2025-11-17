import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { STRIPE_PRICES } from "@/lib/stripe-config";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Checkout() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  const handleCheckout = async (priceId: string, mode: "subscription" | "payment") => {
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId, mode },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock your full potential with premium features designed for ACCA success
            </p>
          </div>

          {/* Toggle for Pro Plans */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm ${!isAnnual ? "font-semibold" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isAnnual ? "font-semibold" : "text-muted-foreground"}`}>
              Annual <span className="text-primary">(save 20%)</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Per Paper Plan */}
            <Card
              className={`p-8 shadow-card card-float animate-slide-up ${
                selectedPlan === "paper" ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">Per Paper</h3>
                  <Badge variant="secondary">One-time</Badge>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">€9</span>
                  <span className="text-muted-foreground">per paper</span>
                </div>
                <p className="text-muted-foreground">
                  Perfect if you're focusing on specific papers
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Full access to one paper's content</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited flashcards & mini-problems</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Progress tracking for that paper</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Lifetime access (no expiry)</span>
                </li>
              </ul>

              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90"
                onClick={() => handleCheckout(STRIPE_PRICES.PRO_MONTHLY, "subscription")}
                disabled={loading === STRIPE_PRICES.PRO_MONTHLY}
              >
                {loading === STRIPE_PRICES.PRO_MONTHLY ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Unlock One Paper
                  </>
                )}
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card
              className={`p-8 shadow-card card-float animate-slide-up relative overflow-hidden ${
                selectedPlan === "pro" ? "ring-2 ring-primary" : ""
              }`}
              style={{ animationDelay: "0.1s" }}
            >
              {/* Popular Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">
                    €{isAnnual ? "180" : "19"}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-primary font-medium mb-2">
                    Save €48/year compared to monthly
                  </p>
                )}
                <p className="text-muted-foreground">
                  Complete access to all papers and premium features
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">
                    Unlimited access to ALL papers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Full syllabus, flashcards & mini-problems</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Study planner & streak tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>

              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90"
                onClick={() =>
                  handleCheckout(
                    isAnnual ? STRIPE_PRICES.PRO_ANNUAL : STRIPE_PRICES.PRO_MONTHLY,
                    "subscription"
                  )
                }
                disabled={
                  loading === STRIPE_PRICES.PRO_ANNUAL ||
                  loading === STRIPE_PRICES.PRO_MONTHLY
                }
              >
                {(loading === STRIPE_PRICES.PRO_ANNUAL ||
                  loading === STRIPE_PRICES.PRO_MONTHLY) ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Go Pro Now
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-sm text-muted-foreground animate-fade-in">
            <p>✓ Secure payment powered by Stripe</p>
            <p>✓ Cancel anytime • No hidden fees • Your progress stays saved</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
