import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, Star } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/10">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <Badge variant="secondary" className="mb-2">
            <Star className="h-3 w-3 mr-1" />
            Pricing Plans
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Choose Your Path to{" "}
            <span className="text-primary">ACCA Success</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade anytime. Unlock powerful AI-driven features to ace your exams.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-8 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
            <Label 
              htmlFor="billing-switch" 
              className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </Label>
            <Switch
              id="billing-switch"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label 
              htmlFor="billing-switch" 
              className={`text-lg font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Annual
              <Badge variant="default" className="ml-2 bg-primary/20 text-primary hover:bg-primary/30">
                Save up to 31%
              </Badge>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Free Tier */}
          <Card className="relative p-8 border-2 hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-muted">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">Free</h3>
                </div>
                <p className="text-sm text-muted-foreground">Perfect to get started</p>
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">€0</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Forever free</p>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/auth")}
                disabled={planType === "free"}
              >
                {planType === "free" ? "Current Plan" : "Get Started"}
              </Button>

              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-semibold">What's included:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">10% of each question bank</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">10 daily flashcards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">1 timed mock exam/week</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">Basic analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">1-week study plan preview</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Pro Tier - Featured */}
          <Card className="relative p-8 border-2 border-primary shadow-xl hover:shadow-2xl transition-all scale-105 md:scale-110 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4 py-1">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Pro</h3>
                </div>
                <p className="text-sm text-muted-foreground">For serious students</p>
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-primary">
                    €{isAnnual ? "69" : "9.99"}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Just €5.75/month, save 28%
                  </p>
                )}
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleCheckout("pro")}
                disabled={loading === "pro" || planType === "pro"}
              >
                {loading === "pro" ? "Loading..." : planType === "pro" ? "Current Plan" : "Upgrade to Pro"}
              </Button>

              {planType === "pro" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={openCustomerPortal}
                >
                  Manage Subscription
                </Button>
              )}

              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-semibold">Everything in Free, plus:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Full question banks (100%)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Unlimited flashcards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">4 timed mocks/week</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">AI explanations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Full analytics + heatmaps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Unlimited study planner</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Spaced repetition engine</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">AI study path generator</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Elite Tier */}
          <Card className="relative p-8 border-2 border-accent/50 hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}>
            <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent/20 text-accent px-4 py-1">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Crown className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Elite</h3>
                </div>
                <p className="text-sm text-muted-foreground">Maximum exam preparation</p>
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">
                    €{isAnnual ? "99" : "14.99"}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Just €8.25/month, save 31%
                  </p>
                )}
              </div>

              <Button 
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleCheckout("elite")}
                disabled={loading === "elite" || planType === "elite"}
              >
                {loading === "elite" ? "Loading..." : planType === "elite" ? "Current Plan" : "Upgrade to Elite"}
              </Button>

              {planType === "elite" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={openCustomerPortal}
                >
                  Manage Subscription
                </Button>
              )}

              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-semibold">Everything in Pro, plus:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Unlimited timed mocks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Unlimited AI tutor chat</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Advanced spaced repetition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Predictive analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Pass probability tracker</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Performance benchmarking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Exam-week mode</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Multi-paper dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">AI Copilot with dynamic plans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Early access to new features</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ or Trust Indicators */}
        <div className="mt-20 text-center space-y-4 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
