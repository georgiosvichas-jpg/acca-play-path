import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePapers } from "@/hooks/usePapers";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

const STUDY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PostSignupOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [examDate, setExamDate] = useState<Date>();
  const [weeklyHours, setWeeklyHours] = useState([5]);
  const [studyDays, setStudyDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const navigate = useNavigate();
  const { papers, loading } = usePapers();
  const { updateProfile } = useUserProfile();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  const togglePaper = (paperCode: string) => {
    setSelectedPapers(prev =>
      prev.includes(paperCode)
        ? prev.filter(p => p !== paperCode)
        : [...prev, paperCode]
    );
  };

  const toggleStudyDay = (day: string) => {
    setStudyDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedPapers.length === 0) {
        toast({
          title: "Please select at least one paper",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!examDate) {
        toast({
          title: "Please select your exam date",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleFinish = async () => {
    try {
      await updateProfile({
        selected_paper: selectedPapers[0],
      });

      setShowConfetti(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#EAF8F4] to-[#F9FAFB]">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      {/* Progress Indicator */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              step === currentStep ? "w-12 bg-[#00A67E]" : "w-8 bg-gray-300",
              step < currentStep && "bg-[#00A67E]"
            )}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg animate-fade-in text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00A67E] to-[#009D73] flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0F172A]">
              Welcome to Study Buddy 🎓
            </h1>
            <p className="text-lg text-[#475569] mb-8 max-w-md mx-auto">
              Let's set up your personal ACCA journey — it takes less than 1 minute.
            </p>
            <Button
              onClick={handleNext}
              className="bg-[#00A67E] hover:bg-[#009D73] text-white px-8 py-6 text-lg rounded-xl"
              size="lg"
            >
              Let's get started
            </Button>
          </div>
        )}

        {/* Step 2: Choose Papers */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#0F172A] text-center">
              Which ACCA papers are you preparing for?
            </h2>
            <p className="text-[#475569] mb-6 text-center">
              Select one or more papers to start building your smart study plan.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="col-span-full text-center py-8">Loading papers...</div>
              ) : (
                papers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => togglePaper(paper.paper_code)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left relative",
                      selectedPapers.includes(paper.paper_code)
                        ? "border-[#00A67E] bg-[#EAF8F4] shadow-md"
                        : "border-gray-200 hover:border-[#00A67E]/50"
                    )}
                  >
                    {selectedPapers.includes(paper.paper_code) && (
                      <CheckCircle2 className="w-5 h-5 text-[#00A67E] absolute top-2 right-2" />
                    )}
                    <div className="font-bold text-[#0F172A] mb-1">{paper.paper_code}</div>
                    <div className="text-sm text-[#475569] line-clamp-2">{paper.title}</div>
                    <div className={cn(
                      "text-xs mt-2 inline-block px-2 py-1 rounded",
                      paper.level === "Applied Skills" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {paper.level}
                    </div>
                  </button>
                ))
              )}
            </div>

            <p className="text-sm text-[#64748B] text-center mb-6">
              You can add or remove papers anytime.
            </p>

            <Button
              onClick={handleNext}
              disabled={selectedPapers.length === 0}
              className="w-full bg-[#00A67E] hover:bg-[#009D73] text-white py-6 rounded-xl"
              size="lg"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Set Exam Goal */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#0F172A] text-center">
              When's your next exam?
            </h2>
            <p className="text-[#475569] mb-6 text-center">
              We'll use this to create your personalized schedule.
            </p>

            <div className="space-y-6 mb-6">
              {/* Exam Date */}
              <div>
                <Label className="text-[#0F172A] font-semibold mb-2 block">Exam Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Weekly Hours */}
              <div>
                <Label className="text-[#0F172A] font-semibold mb-2 block">
                  Weekly Study Hours: {weeklyHours[0]} hours
                </Label>
                <Slider
                  value={weeklyHours}
                  onValueChange={setWeeklyHours}
                  max={15}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Study Days */}
              <div>
                <Label className="text-[#0F172A] font-semibold mb-3 block">Study Days</Label>
                <div className="flex flex-wrap gap-2">
                  {STUDY_DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleStudyDay(day)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all",
                        studyDays.includes(day)
                          ? "bg-[#00A67E] text-white"
                          : "bg-gray-100 text-[#475569] hover:bg-gray-200"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-[#64748B] text-center mb-6">
              Your plan adapts automatically if you fall behind.
            </p>

            <Button
              onClick={handleNext}
              className="w-full bg-[#00A67E] hover:bg-[#009D73] text-white py-6 rounded-xl"
              size="lg"
            >
              Generate my plan
            </Button>
          </div>
        )}

        {/* Step 4: Your Personalized Plan */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg animate-fade-in text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00A67E] to-[#009D73] flex items-center justify-center">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#0F172A]">
              Your smart plan is ready
            </h2>
            <p className="text-[#475569] mb-6">
              Here's how we'll get you exam-ready:
            </p>

            <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00A67E] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[#0F172A]">Dynamic schedule</div>
                  <div className="text-sm text-[#475569]">Based on your time and exam date</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00A67E] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[#0F172A]">Flashcards and mini-problems</div>
                  <div className="text-sm text-[#475569]">For each topic you need to master</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00A67E] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[#0F172A]">Readiness analytics and XP rewards</div>
                  <div className="text-sm text-[#475569]">Track your progress and stay motivated</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleFinish}
              className="w-full bg-[#00A67E] hover:bg-[#009D73] text-white py-6 rounded-xl mb-4"
              size="lg"
            >
              Go to My Dashboard
            </Button>

            <p className="text-sm text-[#64748B]">
              Trusted by 5,000+ ACCA candidates worldwide
            </p>

            <p className="text-lg font-semibold text-[#00A67E] mt-6">
              Welcome aboard — let's ace this together 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
