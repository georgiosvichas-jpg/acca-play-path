import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export type NudgeType = 
  | "practice-footer"
  | "mock-complete"
  | "flashcard-limit"
  | "planner-locked"
  | "srs-section"
  | "weak-areas"
  | "streak-popup"
  | "elite-insights"
  | "mock-limit-ribbon"
  | "dashboard-footer"
  | "multi-paper-dashboard"
  | "exam-week-mode"
  | "predictive-analytics"
  | "pass-probability"
  | "study-tips";

interface UpgradeNudgeProps {
  type: NudgeType;
  message: string;
  tier?: "pro" | "elite";
  variant?: "default" | "banner" | "inline";
  className?: string;
}

const NUDGE_STORAGE_KEY = "dismissed_nudges";

export function UpgradeNudge({ 
  type, 
  message, 
  tier = "pro", 
  variant = "default",
  className 
}: UpgradeNudgeProps) {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(NUDGE_STORAGE_KEY);
    if (dismissed) {
      const dismissedList = JSON.parse(dismissed);
      if (dismissedList.includes(type)) {
        setIsDismissed(true);
      }
    }
  }, [type]);

  const handleDismiss = () => {
    const dismissed = localStorage.getItem(NUDGE_STORAGE_KEY);
    const dismissedList = dismissed ? JSON.parse(dismissed) : [];
    dismissedList.push(type);
    localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify(dismissedList));
    setIsDismissed(true);
  };

  const handleUpgrade = () => {
    navigate(`/checkout?tier=${tier}&billing=monthly`);
  };

  if (isDismissed) return null;

  const Icon = tier === "elite" ? Crown : Sparkles;

  if (variant === "banner") {
    return (
      <div className={cn(
        "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary p-4 rounded-r-lg",
        className
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="shrink-0"
            >
              Upgrade to {tier === "elite" ? "Elite" : "Pro"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <Alert className={cn("border-primary/20 bg-primary/5", className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="link"
              onClick={handleUpgrade}
              className="h-auto p-0 text-primary"
            >
              Upgrade
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className={cn("border-primary/20", className)}>
      <Icon className="h-4 w-4 text-primary" />
      <div className="flex items-center justify-between gap-4 flex-1">
        <AlertDescription className="flex-1">{message}</AlertDescription>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleUpgrade}>
            Upgrade
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
