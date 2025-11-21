import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const tourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to Outcomeo! Let's take a quick tour to help you master your ACCA exam with our gamified study platform.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[href="/dashboard"]',
    content: "Your Dashboard is command central - see your progress overview, daily XP goals, study streak, and chat with your AI Coach for personalized guidance.",
    placement: "bottom",
  },
  {
    target: '[href="/study"]',
    content: "The Study section has everything you need to practice: Quiz Mode, Flashcards, Mock Exams, Spaced Repetition review, and Question Browser. All your learning tools in one place!",
    placement: "bottom",
  },
  {
    target: '[href="/analytics"]',
    content: "Analytics gives you deep insights: view question accuracy by topic, track performance trends over time, and see your improvement with detailed charts and graphs.",
    placement: "bottom",
  },
  {
    target: '[href="/planner"]',
    content: "The Planner helps you stay organized - schedule study sessions, set goals, and follow AI-generated study plans tailored to your exam date.",
    placement: "bottom",
  },
  {
    target: '[href="/badges"]',
    content: "Earn Badges for reaching milestones like study streaks, accuracy goals, and XP achievements. Collect them all as you progress!",
    placement: "bottom",
  },
  {
    target: '.sidebar-footer button',
    content: "Track your XP, level up as you study, and compare your rank with peers. Click your profile to upgrade to Pro or Elite for unlimited features!",
    placement: "top",
  },
  {
    target: "body",
    content: "That's it! You're ready to ace your ACCA exam. Start earning XP and climbing the leaderboard. You can restart this tour anytime from Settings. Good luck! 🚀",
    placement: "center",
  },
];

export default function GuidedTour() {
  const [runTour, setRunTour] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkTourStatus = () => {
      if (!user) return;

      // Check if user has completed the tour
      const tourCompleted = localStorage.getItem(`nav_tour_completed_${user.id}`);
      
      if (!tourCompleted) {
        // Small delay to ensure navigation is rendered
        setTimeout(() => setRunTour(true), 800);
      }
    };

    checkTourStatus();
  }, [user]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunTour(false);
      if (user) {
        localStorage.setItem(`nav_tour_completed_${user.id}`, "true");
        if (status === STATUS.FINISHED) {
          toast.success("Tour completed! Happy studying!");
        }
      }
    }
  };

  const restartTour = () => {
    setRunTour(true);
  };

  // Expose restart function globally for settings
  useEffect(() => {
    (window as any).restartNavigationTour = restartTour;
    return () => {
      delete (window as any).restartNavigationTour;
    };
  }, []);

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--background))",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          arrowColor: "hsl(var(--background))",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "12px",
          fontSize: "14px",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "8px",
          color: "hsl(var(--primary-foreground))",
          fontSize: "14px",
          padding: "8px 16px",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "14px",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "14px",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
}
