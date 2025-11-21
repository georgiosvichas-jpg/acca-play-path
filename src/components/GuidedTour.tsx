import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const tourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to Outcomeo! Let's take a quick tour of all the features to help you ace your exam.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[href="/dashboard"]',
    content: "Your Dashboard shows an overview of your study progress, daily goals, and performance metrics.",
    placement: "bottom",
  },
  {
    target: '[href="/coach"]',
    content: "The AI Coach provides personalized guidance, answers questions, and helps you understand difficult concepts.",
    placement: "bottom",
  },
  {
    target: '[href="/practice-quiz"]',
    content: "Practice with questions and get immediate feedback to reinforce your learning.",
    placement: "bottom",
  },
  {
    target: '[href="/spaced-repetition"]',
    content: "Review uses spaced repetition to help you master questions you got wrong at optimal intervals.",
    placement: "bottom",
  },
  {
    target: '[href="/mock-exam"]',
    content: "Take full 2-hour timed mock exams with 50 questions to simulate real ACCA exam conditions.",
    placement: "bottom",
  },
  {
    target: '[href="/question-browser"]',
    content: "Browse and filter the complete question bank by topic, difficulty, and more.",
    placement: "bottom",
  },
  {
    target: '[href="/question-analytics"]',
    content: "View detailed analytics showing your accuracy trends and performance over time.",
    placement: "bottom",
  },
  {
    target: '[href="/badges"]',
    content: "Earn achievement badges for reaching study milestones like streaks and accuracy goals.",
    placement: "bottom",
  },
  {
    target: '[href="/study-path"]',
    content: "Follow AI-generated personalized study plans tailored to your exam date and weak areas.",
    placement: "bottom",
  },
  {
    target: '[href="/progress-tracking"]',
    content: "Visualize your performance trends and improvements with detailed charts and graphs.",
    placement: "bottom",
  },
  {
    target: '[href="/planner"]',
    content: "Schedule and track your study sessions to stay organized and on target.",
    placement: "bottom",
  },
  {
    target: '[href="/flashcards"]',
    content: "Study with flashcards for quick review and reinforcement of key concepts.",
    placement: "bottom",
  },
  {
    target: "body",
    content: "That's it! You're all set to start your ACCA journey. You can restart this tour anytime from your settings.",
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
