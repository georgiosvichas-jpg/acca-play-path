import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from "react-joyride";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GuidedTourProps {
  onComplete?: () => void;
}

export default function GuidedTour({ onComplete }: GuidedTourProps) {
  const [run, setRun] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { profile, updateProfile } = useUserProfile();
  const { width, height } = useWindowSize();

  const steps: Step[] = [
    {
      target: '[data-tour="planner"]',
      content: (
        <div className="p-2">
          <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
            Build your personalized schedule
          </h3>
          <p className="text-[#475569] leading-relaxed mb-4">
            Your AI-driven study planner automatically adapts to your available time and exam goals.
            You can rearrange, add, or skip sessions anytime – we'll keep you on track.
          </p>
          <div className="text-sm text-[#64748B]">Step 1 of 3</div>
        </div>
      ),
      disableBeacon: true,
      placement: "right",
      spotlightClicks: false,
    },
    {
      target: '[data-tour="flashcards"]',
      content: (
        <div className="p-2">
          <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
            Turn theory into action
          </h3>
          <p className="text-[#475569] leading-relaxed mb-4">
            Practice smarter with interactive flashcards and mini-problems based on your selected papers.
            Earn XP for consistency and retention.
          </p>
          <div className="text-sm text-[#64748B]">Step 2 of 3</div>
        </div>
      ),
      placement: "right",
      spotlightClicks: false,
    },
    {
      target: '[data-tour="analytics"]',
      content: (
        <div className="p-2">
          <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
            Track your readiness score
          </h3>
          <p className="text-[#475569] leading-relaxed mb-4">
            Your dashboard visualizes progress, XP, and readiness over time so you know exactly when you're exam-ready.
            Stay motivated by seeing how far you've come.
          </p>
          <div className="text-sm text-[#64748B]">Step 3 of 3</div>
        </div>
      ),
      placement: "right",
      spotlightClicks: false,
    },
  ];

  useEffect(() => {
    // Start tour automatically if user hasn't completed it
    if (profile && !profile.tour_completed) {
      // Small delay to ensure DOM elements are ready
      setTimeout(() => {
        setRun(true);
      }, 500);
    }
  }, [profile]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, type } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Continue to next step
    } else if (status === STATUS.FINISHED) {
      // Tour completed
      setRun(false);
      await completeTour();
    } else if (status === STATUS.SKIPPED) {
      // User clicked skip
      setShowSkipDialog(true);
    }
  };

  const completeTour = async () => {
    try {
      // Award XP and mark tour as completed
      const newXP = (profile?.total_xp || 0) + 10;
      await updateProfile({
        total_xp: newXP,
        tour_completed: true,
      });

      // Show success modal and confetti
      setShowSuccessModal(true);
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
        setShowSuccessModal(false);
        onComplete?.();
      }, 4000);
    } catch (error) {
      console.error("Error completing tour:", error);
      toast.error("Failed to save tour progress");
    }
  };

  const handleSkipConfirm = async () => {
    setRun(false);
    setShowSkipDialog(false);
    
    try {
      await updateProfile({
        tour_skipped: true,
      });
      toast.info("You can restart the tour anytime from the help menu");
    } catch (error) {
      console.error("Error skipping tour:", error);
    }
  };

  const handleSkipCancel = () => {
    setShowSkipDialog(false);
    setRun(true);
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />}

      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#00A67E",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 16,
            padding: 20,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.15)",
          },
          tooltipContent: {
            padding: 0,
          },
          buttonNext: {
            backgroundColor: "#00A67E",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 24px",
          },
          buttonBack: {
            color: "#00A67E",
            fontSize: 14,
            fontWeight: 600,
            marginRight: 8,
          },
          buttonSkip: {
            color: "#64748B",
            fontSize: 14,
          },
          spotlight: {
            borderRadius: 8,
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish Tour",
          next: "Next →",
          skip: "Skip tour",
        }}
        disableScrolling
        disableOverlayClose
        hideCloseButton
      />

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0F172A] text-2xl">
              Skip tour and jump in?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#475569] text-base">
              You can always restart the tour later from the help menu if you need guidance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipCancel} className="rounded-xl">
              Continue Tour
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSkipConfirm}
              className="bg-[#00A67E] hover:bg-[#009D73] rounded-xl"
            >
              Skip Tour
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="rounded-2xl text-center">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00A67E] to-[#009D73] flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <AlertDialogTitle className="text-[#0F172A] text-3xl">
              You're all set!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#475569] text-base space-y-3 pt-2">
              <p>You've completed your tour – your ACCA journey starts now.</p>
              <p className="font-semibold text-[#00A67E]">+10 XP earned!</p>
              <p className="text-sm">Keep up your daily streak and earn your first badge today.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
