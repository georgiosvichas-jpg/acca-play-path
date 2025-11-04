import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useXP } from "@/hooks/useXP";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

const ACCA_PAPERS = [
  { code: "BT", name: "Business & Technology", level: "Applied" },
  { code: "MA", name: "Management Accounting", level: "Applied" },
  { code: "FA", name: "Financial Accounting", level: "Applied" },
  { code: "LW", name: "Corporate & Business Law", level: "Applied" },
  { code: "PM", name: "Performance Management", level: "Strategic" },
  { code: "TX", name: "Taxation", level: "Strategic" },
  { code: "FR", name: "Financial Reporting", level: "Strategic" },
  { code: "AA", name: "Audit & Assurance", level: "Strategic" },
  { code: "FM", name: "Financial Management", level: "Strategic" },
  { code: "SBL", name: "Strategic Business Leader", level: "Professional" },
  { code: "SBR", name: "Strategic Business Reporting", level: "Professional" },
  { code: "AFM", name: "Advanced Financial Management", level: "Professional" },
  { code: "APM", name: "Advanced Performance Management", level: "Professional" },
  { code: "ATX", name: "Advanced Taxation", level: "Professional" },
  { code: "AAA", name: "Advanced Audit & Assurance", level: "Professional" },
];

const EXAM_SESSIONS = [
  "March 2025",
  "June 2025",
  "September 2025",
  "December 2025",
  "March 2026",
  "June 2026",
  "September 2026",
  "December 2026",
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [examSession, setExamSession] = useState("");
  const [studyHours, setStudyHours] = useState(6);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useUserProfile();
  const { awardXP } = useXP();
  const { width, height } = useWindowSize();

  const progress = ((step + 1) / 4) * 100;

  const togglePaper = (code: string) => {
    setSelectedPapers(prev =>
      prev.includes(code) ? prev.filter(p => p !== code) : [...prev, code]
    );
  };

  const toggleDay = (day: string) => {
    setStudyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleFinish = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save all onboarding data to user profile
      await updateProfile({
        selected_paper: selectedPapers[0] || null,
        ...(selectedPapers.length > 0 && { selected_papers: selectedPapers } as any),
        ...(examSession && { exam_session: examSession } as any),
        ...(studyHours && { study_hours: studyHours } as any),
        ...(studyDays.length > 0 && { study_days: studyDays } as any),
      });

      // Award XP for completing onboarding
      await awardXP("onboarding_complete");

      setShowConfetti(true);
      toast.success("Your personalized plan is ready!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error("Failed to save your preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinueStep2 = selectedPapers.length > 0;
  const canContinueStep3 = examSession !== "";

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4]">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-3xl p-10 shadow-elegant text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow">
                <BookOpen className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[#0F172A] mb-4">
              Welcome to Study Buddy
            </h1>

            <p className="text-base text-[#475569] mb-8 leading-relaxed">
              Let's personalize your ACCA study experience — it only takes a minute.
            </p>

            <Button
              onClick={() => setStep(1)}
              className="w-full sm:w-[220px] h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
            >
              Get Started
            </Button>

            <p className="mt-6 text-sm text-[#94A3B8]">
              Your study plan will be ready instantly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Choose Papers
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4]">
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full max-w-4xl animate-fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-elegant">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] mb-3">
                Which ACCA papers are you preparing for?
              </h1>
              <p className="text-base text-[#475569]">
                Select one or more papers to personalize your smart study plan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {ACCA_PAPERS.map((paper) => (
                <button
                  key={paper.code}
                  onClick={() => togglePaper(paper.code)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedPapers.includes(paper.code)
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-[#0F172A] text-lg">
                      {paper.code}
                    </div>
                    {selectedPapers.includes(paper.code) && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="text-sm text-[#475569] mb-1">{paper.name}</div>
                  <div className="text-xs text-[#94A3B8]">{paper.level}</div>
                </button>
              ))}
            </div>

            <p className="text-sm text-[#94A3B8] text-center mb-6">
              You can always add or remove papers anytime.
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setStep(2)}
                disabled={!canContinueStep2}
                className="w-full sm:w-[220px] h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <button
              onClick={() => {
                setSelectedPapers([]);
                setStep(2);
              }}
              className="mt-4 text-sm text-[#94A3B8] hover:text-[#475569] transition-colors mx-auto block"
            >
              Not sure yet? Choose later.
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Exam & Study Goals
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4]">
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full max-w-2xl animate-fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-elegant">
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-primary" strokeWidth={2} />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-3">
                When's your next ACCA exam?
              </h1>
              <p className="text-base text-[#475569]">
                We'll use this info to create your personalized study schedule.
              </p>
            </div>

            <div className="space-y-8 mb-8">
              {/* Exam Session */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                  Exam Session
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EXAM_SESSIONS.map((session) => (
                    <button
                      key={session}
                      onClick={() => setExamSession(session)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        examSession === session
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-[#475569] hover:border-gray-300"
                      }`}
                    >
                      {session}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Study Hours */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                  Weekly Study Time
                </label>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-lg font-bold text-[#0F172A] min-w-[80px]">
                    {studyHours} hrs/week
                  </span>
                </div>
              </div>

              {/* Preferred Study Days */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                  Preferred Study Days
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        studyDays.includes(day)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-[#475569] hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-[#94A3B8] text-center mb-6">
              Your plan adapts automatically if your schedule changes.
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-auto px-6 h-12 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canContinueStep3}
                className="w-full sm:w-[220px] h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                Generate My Plan
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <button
              onClick={() => setStep(3)}
              className="mt-4 text-sm text-[#94A3B8] hover:text-[#475569] transition-colors mx-auto block"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Plan Ready
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4]">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="w-full max-w-2xl animate-fade-in">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-elegant text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#0F172A] mb-4">
            Your personalized plan is ready.
          </h1>

          <p className="text-base text-[#475569] mb-8 leading-relaxed">
            We've built a smart study schedule based on your goals, time, and exam papers.
          </p>

          <div className="bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4] rounded-2xl p-6 mb-8 text-left">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-[#0F172A] mb-1">
                    AI-driven planner built from your inputs
                  </div>
                  <div className="text-sm text-[#475569]">
                    Adaptive scheduling based on your exam date and availability
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-[#0F172A] mb-1">
                    Flashcards and mini-problems linked to your topics
                  </div>
                  <div className="text-sm text-[#475569]">
                    Practice materials tailored to your selected papers
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-[#0F172A] mb-1">
                    Progress analytics and XP tracking
                  </div>
                  <div className="text-sm text-[#475569]">
                    Real-time insights into your study momentum
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className="w-auto px-6 h-12 rounded-xl"
            >
              Edit my plan
            </Button>
            <Button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="w-full sm:w-[220px] h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmitting ? "Setting up..." : "Go to Dashboard"}
            </Button>
          </div>

          <p className="text-sm text-[#94A3B8]">
            Your first 10 XP have been added for completing setup.
          </p>
        </div>
      </div>
    </div>
  );
}
