import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route?: string;
}

export default function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Check if checklist is dismissed
    const isDismissed = localStorage.getItem(`checklist_dismissed_${user.id}`);
    if (isDismissed === "true") {
      setDismissed(true);
    }

    checkProgress();
  }, [user, profile]);

  const checkProgress = async () => {
    if (!user) return;

    // Check if papers are selected
    const hasSelectedPapers = profile?.selected_papers && profile.selected_papers.length > 0;

    // Check if user has completed a practice quiz
    const { data: sessions } = await supabase
      .from("sb_study_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("session_type", "practice")
      .limit(1);
    const hasCompletedPractice = sessions && sessions.length > 0;

    // Check if user has scheduled a study session
    const { data: studySessions } = await supabase
      .from("study_sessions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);
    const hasScheduledSession = studySessions && studySessions.length > 0;

    // Check if user has used the AI coach
    const hasUsedCoach = localStorage.getItem(`coach_used_${user.id}`) === "true";

    setChecklist([
      {
        id: "select-papers",
        title: "Select Your Papers",
        description: "Choose which ACCA papers you're studying",
        completed: hasSelectedPapers || false,
        route: "/settings",
      },
      {
        id: "first-practice",
        title: "Complete First Practice Quiz",
        description: "Try your first practice questions",
        completed: hasCompletedPractice || false,
        route: "/practice-quiz",
      },
      {
        id: "schedule-session",
        title: "Schedule a Study Session",
        description: "Plan your study time in the planner",
        completed: hasScheduledSession || false,
        route: "/planner",
      },
      {
        id: "use-coach",
        title: "Meet Your AI Coach",
        description: "Ask a question to your study assistant",
        completed: hasUsedCoach || false,
        route: "/coach",
      },
    ]);
  };

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`checklist_dismissed_${user.id}`, "true");
      setDismissed(true);
    }
  };

  const handleReopen = () => {
    setDismissed(false);
  };

  const handleItemClick = (route?: string) => {
    if (route) {
      navigate(route);
    }
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;
  const allCompleted = completedCount === checklist.length;

  // Expose reopen function for settings
  useEffect(() => {
    (window as any).reopenOnboardingChecklist = handleReopen;
    return () => {
      delete (window as any).reopenOnboardingChecklist;
    };
  }, []);

  if (dismissed && !allCompleted) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleReopen}
        className="fixed bottom-4 right-4 z-40 shadow-lg"
      >
        Show Checklist
      </Button>
    );
  }

  if (dismissed || allCompleted) {
    return null;
  }

  return (
    <Card className="relative border-primary/20 shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={handleDismiss}
      >
        <X className="w-4 h-4" />
      </Button>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Getting Started
        </CardTitle>
        <CardDescription>
          Complete these steps to get the most out of ACCA Master
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {completedCount} of {checklist.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50",
                item.completed ? "bg-muted/50" : "bg-background"
              )}
              onClick={() => !item.completed && handleItemClick(item.route)}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium text-sm",
                    item.completed ? "text-muted-foreground line-through" : "text-foreground"
                  )}
                >
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
              {!item.completed && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
            </div>
          ))}
        </div>

        {allCompleted && (
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">
              🎉 Great job! You've completed all the essential steps!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
