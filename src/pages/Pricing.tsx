import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { STRIPE_PRICES } from "@/lib/stripe-config";

export default function Pricing() {
  const navigate = useNavigate();
  const { planType, openCustomerPortal } = useSubscription();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (tier: "pro" | "elite") => {
    setLoading(tier);
    try {
      const priceId = isAnnual 
        ? (tier === "pro" ? STRIPE_PRICES.PRO_ANNUAL : STRIPE_PRICES.ELITE_ANNUAL)
        : (tier === "pro" ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.ELITE_MONTHLY);

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId, mode: "subscription" },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Path to ACCA Success
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock powerful features to ace your exams
          </p>

          <div className="flex items-center justify-center gap-4">
            <Label htmlFor="billing-switch" className="text-lg">Monthly</Label>
            <Switch
              id="billing-switch"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-switch" className="text-lg">
              Annual <span className="text-primary font-semibold">(Save up to 31%)</span>
            </Label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Free Tier */}
          <Card className="p-8 border-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-2xl font-bold">Free</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold">€0</div>
              <p className="text-muted-foreground">Forever free</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">10% of each question bank</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">10 daily flashcards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">1 timed mock exam per week</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">Basic analytics (accuracy only)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">1-week study plan preview</span>
              </li>
            </ul>

            <Button 
              variant="outline" 
              className="w-full"
              disabled={planType === "free"}
            >
              {planType === "free" ? "Current Plan" : "Downgrade"}
            </Button>
          </Card>

          {/* Pro Tier */}
          <Card className="p-8 border-2 border-primary relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
              POPULAR
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Pro</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold">
                €{isAnnual ? "69" : "9.99"}
                <span className="text-lg font-normal text-muted-foreground">
                  /{isAnnual ? "year" : "mo"}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-primary">€5.75/month billed annually</p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Full question banks (100%)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Unlimited flashcards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">4 mock exams per week</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">AI explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Full analytics + heatmaps</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Spaced repetition engine</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">AI study paths</span>
              </li>
            </ul>

            <Button 
              className="w-full"
              onClick={() => planType === "pro" ? openCustomerPortal() : handleCheckout("pro")}
              disabled={loading === "pro"}
            >
              {loading === "pro" ? "Loading..." : planType === "pro" ? "Manage Subscription" : "Upgrade to Pro"}
            </Button>
          </Card>

          {/* Elite Tier */}
          <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/20 relative">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
              BEST VALUE
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Elite</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold">
                €{isAnnual ? "99" : "14.99"}
                <span className="text-lg font-normal text-muted-foreground">
                  /{isAnnual ? "year" : "mo"}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-primary">€8.25/month billed annually</p>
              )}
            </div>

            <p className="text-sm font-semibold mb-3">Everything in Pro, plus:</p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Unlimited mock exams</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Unlimited AI tutor chat</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Advanced spaced repetition</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Predictive analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Performance benchmarking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Exam-week mode</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Multi-paper dashboards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">AI Copilot</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Early access features</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => planType === "elite" ? openCustomerPortal() : handleCheckout("elite")}
              disabled={loading === "elite"}
            >
              {loading === "elite" ? "Loading..." : planType === "elite" ? "Manage Subscription" : "Upgrade to Elite"}
            </Button>
          </Card>
        </div>

        <div className="text-center mt-12 text-muted-foreground">
          <p>All plans include access to all ACCA papers • Cancel anytime • Secure payment via Stripe</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
