import { Calendar, BookOpen, TrendingUp, Trophy, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EmptyStateProps {
  type: "planner" | "flashcards" | "analytics" | "leaderboard" | "no-results";
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

export function EmptyState({ type, onAction, onSecondaryAction }: EmptyStateProps) {
  const states = {
    planner: {
      icon: Calendar,
      title: "Your study planner is waiting to get started.",
      description:
        "Create your first study session to start tracking your ACCA progress. Your schedule will adapt automatically to your goals and available time.",
      primaryCTA: "Add My First Session",
      secondaryCTA: "Need help setting up?" as string | null,
      tip: "Tip: Add a few sessions now, and your personalized plan will instantly appear here." as string | null,
      footer: null as string | null,
    },
    flashcards: {
      icon: BookOpen,
      title: "Ready to turn knowledge into action?",
      description:
        "You haven't practiced yet. Start your first 5-minute flashcard session and begin earning XP.",
      primaryCTA: "Start Flashcards",
      secondaryCTA: "See how flashcards work" as string | null,
      tip: "Consistency matters. Practice daily to boost your retention rate." as string | null,
      footer: null as string | null,
    },
    analytics: {
      icon: TrendingUp,
      title: "Your progress insights will appear here.",
      description:
        "Once you complete sessions and quizzes, we'll show your readiness, XP, and trends.",
      primaryCTA: "Go to Planner",
      secondaryCTA: null as string | null,
      tip: "The more you study, the smarter your insights become." as string | null,
      footer: "Data updates automatically every time you study — no manual input required." as string | null,
    },
    leaderboard: {
      icon: Trophy,
      title: "You're about to enter the leaderboard!",
      description:
        "Earn XP by completing flashcards and planner sessions. Climb the ranks, unlock badges, and show your progress to the world.",
      primaryCTA: "Earn XP Now",
      secondaryCTA: "Learn how XP works" as string | null,
      tip: "Everyone starts from zero. Your first 10 XP are waiting!" as string | null,
      footer: null as string | null,
    },
    "no-results": {
      icon: Search,
      title: "No results found.",
      description: "Try adjusting your filters or keywords — or explore a different paper.",
      primaryCTA: "Clear Filters",
      secondaryCTA: null as string | null,
      tip: null as string | null,
      footer: null as string | null,
    },
  };

  const state = states[type];
  const Icon = state.icon;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8 animate-fade-in">
      <Card className="max-w-md w-full p-8 text-center bg-background border-border">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-3 text-foreground">{state.title}</h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {state.description}
        </p>

        <div className="space-y-3">
          <Button
            onClick={onAction}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02]"
            size="lg"
          >
            {state.primaryCTA}
          </Button>

          {state.secondaryCTA && (
            <button
              onClick={onSecondaryAction}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              {state.secondaryCTA}
            </button>
          )}
        </div>

        {state.tip && (
          <p className="text-xs text-muted-foreground mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
            💡 {state.tip}
          </p>
        )}

        {state.footer && (
          <p className="text-xs text-muted-foreground mt-4 italic">
            {state.footer}
          </p>
        )}
      </Card>
    </div>
  );
}
