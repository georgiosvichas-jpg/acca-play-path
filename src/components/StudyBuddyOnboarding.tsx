import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { studyBuddyAPI } from "@/lib/studybuddy-api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const ACCA_PAPERS = [
  { code: "BT", name: "Business & Technology" },
  { code: "MA", name: "Management Accounting" },
  { code: "FA", name: "Financial Accounting" },
  { code: "LW", name: "Corporate & Business Law" },
  { code: "PM", name: "Performance Management" },
  { code: "TX", name: "Taxation" },
  { code: "FR", name: "Financial Reporting" },
  { code: "FM", name: "Financial Management" },
  { code: "AA", name: "Audit & Assurance" },
  { code: "AAA", name: "Advanced Audit & Assurance" },
];

export default function StudyBuddyOnboarding() {
  const [step, setStep] = useState(1);
  const [selectedPaper, setSelectedPaper] = useState("");
  const [examDate, setExamDate] = useState<Date>();
  const [weeklyHours, setWeeklyHours] = useState([5]);
  const [email, setEmail] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { user } = useAuth();

  const handleNext = () => {
    if (step === 1 && !selectedPaper) {
      toast.error("Please select a paper");
      return;
    }
    if (step === 2 && !examDate) {
      toast.error("Please select your exam date");
      return;
    }
    if (step === 3 && weeklyHours[0] < 1) {
      toast.error("Please select at least 1 hour per week");
      return;
    }
    if (step === 4 && !email) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (step === 4) {
      handleFinish();
    } else {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Call the StudyBuddy API to create/update user
      const emailToUse = email || user?.email;
      if (!emailToUse) {
        toast.error("Email is required");
        setIsSubmitting(false);
        return;
      }

      await studyBuddyAPI.getUserOrCreate(
        emailToUse,
        selectedPaper,
        examDate ? format(examDate, "yyyy-MM-dd") : undefined,
        weeklyHours[0]
      );

      setShowConfetti(true);
      setStep(5);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error("Failed to save your preferences. Please try again.");
      setIsSubmitting(false);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      {/* Progress Indicator */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              s === step ? "w-12 bg-primary" : "w-8 bg-muted",
              s < step && "bg-primary"
            )}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl">
        <Card className="p-8 md:p-12 shadow-2xl border-border/50">
          {/* Step 1: Select Paper */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Which ACCA paper are you preparing for?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Select the paper you're currently studying
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                {ACCA_PAPERS.map((paper) => (
                  <button
                    key={paper.code}
                    onClick={() => setSelectedPaper(paper.code)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all duration-200 hover:scale-105",
                      selectedPaper === paper.code
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="font-semibold text-lg text-foreground">{paper.code}</div>
                    <div className="text-sm text-muted-foreground">{paper.name}</div>
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleNext} 
                size="lg" 
                className="w-full mt-8"
                disabled={!selectedPaper}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Exam Date */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  When is your exam date?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Help us create your personalized study timeline
                </p>
              </div>

              <div className="flex justify-center mt-8">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full max-w-md justify-start text-left font-normal h-14 text-lg",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {examDate ? format(examDate, "PPP") : "Select exam date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-3 mt-8">
                <Button 
                  onClick={() => setStep(1)} 
                  variant="outline" 
                  size="lg"
                  className="w-full"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  size="lg"
                  className="w-full"
                  disabled={!examDate}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Weekly Hours */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  How many hours per week can you study?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Be realistic - consistency matters more than volume
                </p>
              </div>

              <div className="mt-12 space-y-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {weeklyHours[0]}
                  </div>
                  <div className="text-xl text-muted-foreground">
                    hours per week
                  </div>
                </div>

                <Slider
                  value={weeklyHours}
                  onValueChange={setWeeklyHours}
                  max={40}
                  min={1}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 hour</span>
                  <span>40 hours</span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button 
                  onClick={() => setStep(2)} 
                  variant="outline" 
                  size="lg"
                  className="w-full"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  size="lg"
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Email */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  What's your email address?
                </h2>
                <p className="text-muted-foreground text-lg">
                  We'll use this to save your progress and send you study reminders
                </p>
              </div>

              <div className="space-y-4 mt-8">
                <Label htmlFor="email" className="text-lg">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email || user?.email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-lg"
                  disabled={!!user?.email}
                />
                {user?.email && (
                  <p className="text-sm text-muted-foreground">
                    Using your account email: {user.email}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <Button 
                  onClick={() => setStep(3)} 
                  variant="outline" 
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || (!email && !user?.email)}
                >
                  {isSubmitting ? "Setting up..." : "Create My Study Plan"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in duration-500 text-center py-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Your personalized study plan is ready!
                </h2>
                <p className="text-muted-foreground text-lg">
                  Let's start your journey to ACCA success
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
                <div className="p-6 rounded-lg border border-border bg-muted/50">
                  <Sparkles className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Smart Daily Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalized study sessions based on your schedule
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-muted/50">
                  <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your improvement across all topics
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground animate-pulse">
                Redirecting to your dashboard...
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  );
}
