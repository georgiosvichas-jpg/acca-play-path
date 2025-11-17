import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Lock, TrendingUp, Brain, LineChart, Target, Calendar, Sparkles, Crown, Timer, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export type PaywallType = 
  | "mock-exam-limit"
  | "analytics"
  | "spaced-repetition"
  | "ai-explanations"
  | "ai-tutor"
  | "study-path"
  | "mock-weekly-limit"
  | "predictive-insights";

interface PaywallConfig {
  title: string;
  subtitle: string;
  primaryCTA: string;
  secondaryCTA?: string;
  primaryTier: "pro" | "elite";
  icon: React.ReactNode;
  features: string[];
}

const PAYWALL_CONFIGS: Record<PaywallType, PaywallConfig> = {
  "mock-exam-limit": {
    title: "Unlock the full exam simulator",
    subtitle: "Practice under real ACCA conditions – unlimited mocks with countdown timer.",
    primaryCTA: "Unlock with Pro",
    secondaryCTA: "Go Elite for unlimited mocks",
    primaryTier: "pro",
    icon: <Timer className="h-8 w-8 text-primary" />,
    features: [
      "4 timed mock exams per week",
      "Full exam simulation with countdown",
      "Detailed performance analytics",
      "Question-by-question review",
    ],
  },
  "analytics": {
    title: "See where you're losing marks",
    subtitle: "Unlock topic mastery, difficulty heatmaps, and trends.",
    primaryCTA: "Upgrade to Pro",
    primaryTier: "pro",
    icon: <LineChart className="h-8 w-8 text-primary" />,
    features: [
      "Topic mastery breakdown",
      "Difficulty heatmaps",
      "Performance trends over time",
      "Weak area identification",
      "Question accuracy by chapter",
    ],
  },
  "spaced-repetition": {
    title: "Boost your memory with spaced repetition",
    subtitle: "Review questions at the perfect time using forgetting curves.",
    primaryCTA: "Unlock SRS",
    secondaryCTA: "Go Elite for advanced settings",
    primaryTier: "pro",
    icon: <Brain className="h-8 w-8 text-primary" />,
    features: [
      "Automatic spaced repetition scheduling",
      "Forgetting curve algorithm",
      "Personalized review timing",
      "Priority weak areas",
    ],
  },
  "ai-explanations": {
    title: "Understand every question instantly",
    subtitle: "Get step-by-step reasoning and applied logic.",
    primaryCTA: "Unlock with Pro",
    primaryTier: "pro",
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    features: [
      "Unlimited AI explanations",
      "Step-by-step reasoning",
      "Applied logic breakdowns",
      "Concept clarification",
      "Multiple solution approaches",
    ],
  },
  "ai-tutor": {
    title: "Meet your personal ACCA tutor",
    subtitle: "Ask anything. Topics, strategies, explanations.",
    primaryCTA: "Go Elite",
    primaryTier: "elite",
    icon: <Crown className="h-8 w-8 text-primary" />,
    features: [
      "Unlimited AI tutor conversations",
      "Ask about any topic or strategy",
      "Personalized study advice",
      "Exam technique guidance",
      "24/7 availability",
    ],
  },
  "study-path": {
    title: "Get your personalised study plan",
    subtitle: "AI builds a full plan tailored to your exam date and weak areas.",
    primaryCTA: "Unlock with Pro",
    secondaryCTA: "Elite adapts your plan automatically",
    primaryTier: "pro",
    icon: <Target className="h-8 w-8 text-primary" />,
    features: [
      "Full AI-generated study path",
      "Tailored to your exam date",
      "Adapts to weak areas",
      "Daily task breakdown",
      "Progress tracking",
    ],
  },
  "mock-weekly-limit": {
    title: "Go unlimited with mocks",
    subtitle: "Elite gives you unlimited timed mocks and scoring predictions.",
    primaryCTA: "Go Elite",
    primaryTier: "elite",
    icon: <Zap className="h-8 w-8 text-primary" />,
    features: [
      "Unlimited timed mock exams",
      "No weekly restrictions",
      "Advanced scoring predictions",
      "Performance projections",
      "Unlimited practice",
    ],
  },
  "predictive-insights": {
    title: "Predict your success",
    subtitle: "Unlock pass probability and score projections.",
    primaryCTA: "Upgrade to Elite",
    primaryTier: "elite",
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    features: [
      "Pass probability calculator",
      "Score projections",
      "Performance forecasting",
      "Readiness assessment",
      "Confidence metrics",
    ],
  },
};

interface FeaturePaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paywallType: PaywallType;
}

export function FeaturePaywallModal({ open, onOpenChange, paywallType }: FeaturePaywallModalProps) {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const config = PAYWALL_CONFIGS[paywallType];

  const handleUpgrade = (tier: "pro" | "elite") => {
    navigate(`/checkout?tier=${tier}&billing=${isAnnual ? "annual" : "monthly"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4 text-center">
          <div className="flex justify-center">{config.icon}</div>
          <DialogTitle className="text-3xl font-bold">{config.title}</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            {config.subtitle}
          </DialogDescription>
        </DialogHeader>

        <Card className="p-6 bg-muted/30 border-2 border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Lock className="h-4 w-4" />
              <span>Unlock with {config.primaryTier === "pro" ? "Pro" : "Elite"}</span>
            </div>
            
            <ul className="space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => handleUpgrade(config.primaryTier)}
                className="w-full h-12 text-base"
                size="lg"
              >
                {config.primaryCTA}
              </Button>

              {config.secondaryCTA && (
                <Button
                  onClick={() => handleUpgrade("elite")}
                  variant="outline"
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {config.secondaryCTA}
                </Button>
              )}

              <button
                onClick={() => onOpenChange(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Maybe later
              </button>
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            {config.primaryTier === "pro" ? (
              <>Pro starts at €9.99/month or €69/year</>
            ) : (
              <>Elite starts at €29.99/month or €249/year</>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
