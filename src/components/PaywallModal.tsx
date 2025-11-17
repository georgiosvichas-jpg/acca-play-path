import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Crown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STRIPE_PRICES, type PlanType } from "@/lib/stripe-config";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  requiredTier: PlanType;
}

export function PaywallModal({ open, onOpenChange, feature, requiredTier }: PaywallModalProps) {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleUpgrade = (tier: "pro" | "elite") => {
    navigate(`/checkout?tier=${tier}&billing=${isAnnual ? "annual" : "monthly"}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Unlock {feature}</DialogTitle>
          <DialogDescription>
            Upgrade your plan to access this feature and more
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 my-4">
          <Label htmlFor="billing-toggle">Monthly</Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="billing-toggle">Annual <span className="text-primary">(Save up to 31%)</span></Label>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pro Plan */}
          <Card className="p-6 border-2 hover:border-primary transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Pro</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">
                €{isAnnual ? "69" : "9.99"}
                <span className="text-base font-normal text-muted-foreground">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-muted-foreground">€5.75/month billed annually</p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Full question banks (100%)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Unlimited flashcards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>4 timed mock exams per week</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>AI explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Full analytics with heatmaps</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Spaced repetition engine</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>AI-generated study paths</span>
              </li>
            </ul>

            <Button 
              className="w-full" 
              onClick={() => handleUpgrade("pro")}
              variant={requiredTier === "pro" ? "default" : "outline"}
            >
              Upgrade to Pro
            </Button>
          </Card>

          {/* Elite Plan */}
          <Card className="p-6 border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
              BEST VALUE
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Elite</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">
                €{isAnnual ? "99" : "14.99"}
                <span className="text-base font-normal text-muted-foreground">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-muted-foreground">€8.25/month billed annually</p>
              )}
            </div>

            <p className="text-sm font-semibold mb-3">Everything in Pro, plus:</p>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Unlimited timed mock exams</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Unlimited AI tutor chat</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Advanced spaced repetition</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Predictive analytics & pass probability</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Performance benchmarking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Exam-week mode</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Multi-paper dashboards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>AI Copilot with dynamic adjustments</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Early access to new features</span>
              </li>
            </ul>

            <Button 
              className="w-full" 
              onClick={() => handleUpgrade("elite")}
            >
              Upgrade to Elite
            </Button>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
