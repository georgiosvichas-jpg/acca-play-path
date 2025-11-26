import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useTopicPerformance } from "@/hooks/useTopicPerformance";
import { useStudyPreferences } from "@/hooks/useStudyPreferences";
import { QuestionActions } from "@/components/QuestionActions";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Clock, AlertCircle, CheckCircle2, XCircle, Trophy, Lock, Flag, Grid3x3, BarChart3, Timer, History, TrendingUp } from "lucide-react";
import { FeaturePaywallModal } from "@/components/FeaturePaywallModal";
import { UpgradeNudge } from "@/components/UpgradeNudge";

interface Question {
  id: string;
  paper: string;
  unit_code: string | null;
  type: string;
  difficulty: string | null;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string | null;
  answer?: string;
  metadata?: any;
}

interface Section {
  name: string;
  questionRange: [number, number];
}

export default function MockExam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkAndAwardBadges } = useBadgeChecker();
  const { recordBatchReviews } = useSpacedRepetition();
  const { canUseMockExam, remainingMocks, incrementMockUsage, isLoading: usageLoading } = useUsageLimits();
  const { planType, getUpgradeMessage } = useFeatureAccess();
  const { trackBatchPerformance } = useTopicPerformance();
  const [showPaywall, setShowPaywall] = useState(false);
  const [requiredTier, setRequiredTier] = useState<"pro" | "elite">("pro");
  
  // Study preferences hook
  const {
    selectedPaper,
    setSelectedPaper,
    papers,
    loading: prefsLoading,
  } = useStudyPreferences();
  
  const [examLength, setExamLength] = useState<"quick" | "half" | "full">("full");
  const [showHistory, setShowHistory] = useState(false);
  const [examHistory, setExamHistory] = useState<any[]>([]);

  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(7200); // 2 hours in seconds
  const [initialTime, setInitialTime] = useState(7200);
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showNavigator, setShowNavigator] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Define sections (like real ACCA papers) - dynamically calculated based on total questions
  const getSections = (): Section[] => {
    if (totalQuestions === 15) {
      return [{ name: "Section A", questionRange: [0, 14] }];
    } else if (totalQuestions === 25) {
      return [
        { name: "Section A", questionRange: [0, 11] },
        { name: "Section B", questionRange: [12, 24] }
      ];
    } else {
      return [
        { name: "Section A", questionRange: [0, 14] },
        { name: "Section B", questionRange: [15, 34] },
        { name: "Section C", questionRange: [35, 49] }
      ];
    }
  };
  
  const sections = getSections();
  
  // No manual initialization needed - handled by useStudyPreferences hook

  // Fetch exam history
  useEffect(() => {
    if (user && selectedPaper) {
      fetchExamHistory();
    }
  }, [user, selectedPaper]);

  const fetchExamHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("sb_study_sessions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("session_type", "mock_exam")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setExamHistory(data || []);
    } catch (error) {
      console.error("Error fetching exam history:", error);
    }
  };

  // Keyboard navigation for review mode
  useEffect(() => {
    if (!reviewMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (reviewQuestionIndex > 0) {
          setReviewQuestionIndex(reviewQuestionIndex - 1);
        }
      } else if (e.key === "ArrowRight") {
        const incorrectQuestions = questions
          .map((q, idx) => ({ question: q, index: idx }))
          .filter(({ index }) => answers[index] !== questions[index].correct_option_index);
        const questionsToReview = showIncorrectOnly ? incorrectQuestions : questions.map((q, idx) => ({ question: q, index: idx }));
        
        if (reviewQuestionIndex < questionsToReview.length - 1) {
          setReviewQuestionIndex(reviewQuestionIndex + 1);
        }
      } else if (e.key === "Escape") {
        setReviewMode(false);
        setReviewQuestionIndex(0);
        setShowIncorrectOnly(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [reviewMode, reviewQuestionIndex, showIncorrectOnly, questions, answers]);

  // Timer effect
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examSubmitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startExam = async () => {
    if (!agreedToRules) {
      toast.error("Please agree to exam rules");
      return;
    }

    // Check usage limits
    if (!canUseMockExam) {
      const upgradeInfo = getUpgradeMessage("Timed Mock Exams");
      setRequiredTier(upgradeInfo.tier as "pro" | "elite");
      setShowPaywall(true);
      return;
    }

    // Determine exam parameters based on length
    const examConfig = {
      quick: { questions: 15, minutes: 36 },
      half: { questions: 25, minutes: 60 },
      full: { questions: 50, minutes: 120 }
    };
    
    const { questions: numQuestions, minutes } = examConfig[examLength];
    const timeInSeconds = minutes * 60;

    try {
      // Use content-batch to fetch questions (all types)
      const { data, error } = await supabase.functions.invoke("content-batch", {
        body: { 
          paper: selectedPaper, 
          size: numQuestions
        },
      });

      if (error) throw error;

      const shuffled = data || [];
      setQuestions(shuffled.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : []
      })));
      setAnswers(new Array(numQuestions).fill(null));
      setTimePerQuestion(new Array(numQuestions).fill(0));
      setTotalQuestions(numQuestions);
      setTimeRemaining(timeInSeconds);
      setInitialTime(timeInSeconds);
      setExamStarted(true);
      setQuestionStartTime(Date.now());
      
      // Increment usage counter
      await incrementMockUsage();
      
      toast.success(`Mock exam started! ${numQuestions} questions, ${minutes} minutes. Good luck!`);
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };
  
  const toggleFlag = (questionIndex: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };
  
  const navigateToQuestion = (index: number) => {
    // Save time spent on current question
    const timeSpent = Date.now() - questionStartTime;
    const newTimes = [...timePerQuestion];
    newTimes[currentQuestion] = (newTimes[currentQuestion] || 0) + timeSpent;
    setTimePerQuestion(newTimes);
    
    setCurrentQuestion(index);
    setQuestionStartTime(Date.now());
    
    // Scroll to question
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  const getQuestionStatus = (index: number) => {
    if (answers[index] !== null && answers[index] !== undefined) return 'answered';
    if (flaggedQuestions.has(index)) return 'flagged';
    return 'unanswered';
  };
  
  // Validate answer based on question type
  const validateAnswer = (question: Question, answer: any): boolean => {
    if (answer === null || answer === undefined) return false;
    
    const type = question.type;
    
    // MCQ Single
    if (type === "MCQ_SINGLE" || type === "mcq") {
      return answer === question.correct_option_index;
    }
    
    // MCQ Multi
    if (type === "MCQ_MULTI") {
      const correctAnswers = question.metadata?.correctAnswers || [];
      if (!Array.isArray(answer)) return false;
      return answer.length === correctAnswers.length && 
             answer.every((a: number) => correctAnswers.includes(a));
    }
    
    // Fill in the Blank
    if (type === "FILL_IN_BLANK") {
      const blanks = question.metadata?.blanks || [];
      if (typeof answer !== 'object') return false;
      return blanks.every((blank: any, idx: number) => 
        answer[idx]?.toLowerCase().trim() === blank.correctAnswer?.toLowerCase().trim()
      );
    }
    
    // Calculation
    if (type === "CALCULATION") {
      const correctAnswer = parseFloat(question.answer || "0");
      const tolerance = question.metadata?.tolerance || 0;
      const userAnswer = parseFloat(answer);
      return Math.abs(userAnswer - correctAnswer) <= tolerance;
    }
    
    // Matching
    if (type === "MATCHING") {
      const correctPairs = question.metadata?.correctPairs || [];
      if (typeof answer !== 'object') return false;
      return correctPairs.every(([left, right]: [number, number]) => 
        answer[left] === right
      );
    }
    
    // Scenario Based
    if (type === "SCENARIO_BASED") {
      const subQuestions = question.metadata?.subQuestions || [];
      if (typeof answer !== 'object') return false;
      return subQuestions.every((subQ: any, idx: number) => 
        answer[idx] === subQ.correctAnswer
      );
    }
    
    return false;
  };
  
  const getSectionStats = (section: Section) => {
    const [start, end] = section.questionRange;
    const sectionAnswers = answers.slice(start, end + 1);
    const answered = sectionAnswers.filter(a => a !== null).length;
    const flagged = Array.from(flaggedQuestions).filter(idx => idx >= start && idx <= end).length;
    return { answered, total: end - start + 1, flagged };
  };

  const handleSubmitExam = async () => {
    // Save time for current question
    const timeSpent = Date.now() - questionStartTime;
    const finalTimes = [...timePerQuestion];
    finalTimes[currentQuestion] = (finalTimes[currentQuestion] || 0) + timeSpent;
    setTimePerQuestion(finalTimes);
    
    try {
      // Calculate results
      let correctCount = 0;
      const rawLog: any[] = [];
      const sectionResults: any[] = [];

      questions.forEach((q, idx) => {
        const isCorrect = validateAnswer(q, answers[idx]);
        if (isCorrect) correctCount++;

        rawLog.push({
          question_id: q.id,
          unit_code: q.unit_code,
          difficulty: q.difficulty,
          correct: isCorrect,
          time_spent: Math.round(finalTimes[idx] / 1000), // Convert to seconds
        });
      });

      // Calculate section-wise results
      sections.forEach(section => {
        const [start, end] = section.questionRange;
        let sectionCorrect = 0;
        let sectionTotal = end - start + 1;
        let sectionTime = 0;
        
        for (let i = start; i <= end; i++) {
          if (validateAnswer(questions[i], answers[i])) sectionCorrect++;
          sectionTime += finalTimes[i] || 0;
        }
        
        sectionResults.push({
          name: section.name,
          correct: sectionCorrect,
          total: sectionTotal,
          accuracy: ((sectionCorrect / sectionTotal) * 100).toFixed(1),
          timeSpent: Math.round(sectionTime / 1000),
        });
      });

      const accuracy = (correctCount / totalQuestions) * 100;
      const totalTime = initialTime - timeRemaining;

      // Log session via edge function
      if (user) {
        // Track topic performance
        const performanceData = questions.map((q, idx) => ({
          paperCode: q.paper,
          unitCode: q.unit_code,
          topicName: q.unit_code || "General",
          isCorrect: answers[idx] === q.correct_option_index
        }));
        await trackBatchPerformance(performanceData);

        const { error: sessionError } = await supabase.functions.invoke("sessions-log", {
          body: {
            session_type: "mock_exam",
            total_questions: 50,
            correct_answers: correctCount,
            raw_log: rawLog,
          },
        });

        if (sessionError) {
          console.error("Error logging session:", sessionError);
        }

        // Record in spaced repetition system
        const reviewData = questions.map((q, idx) => ({
          questionId: q.id,
          isCorrect: answers[idx] === q.correct_option_index
        }));
        await recordBatchReviews(reviewData);

        // Check for badges
        await checkAndAwardBadges();
      }

      setResults({
        correct: correctCount,
        total: totalQuestions,
        accuracy: accuracy.toFixed(1),
        passed: accuracy >= 50,
        sectionResults,
        totalTime,
        timePerQuestion: finalTimes,
        flaggedCount: flaggedQuestions.size,
        unansweredCount: answers.filter(a => a === null).length,
        examLength: totalQuestions === 15 ? "Quick" : totalQuestions === 25 ? "Half" : "Full",
      });
      setExamSubmitted(true);
      
      toast.success(`Exam completed! Score: ${correctCount}/${totalQuestions} (${accuracy.toFixed(1)}%)`);
      
      // Refresh history
      fetchExamHistory();
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    }
  };

  if (!examStarted) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-6 h-6" />
                      ACCA {selectedPaper} Mock Exam
                    </CardTitle>
                    <CardDescription>
                      Simulated exam under real ACCA conditions
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    {showHistory ? "New Exam" : "View History"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showHistory ? (
                  /* Exam History View */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <History className="w-5 h-5" />
                      Exam History
                    </div>
                    
                    {examHistory.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No exam attempts yet</p>
                        <p className="text-sm mt-2">Complete your first mock exam to see your history</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {examHistory.map((exam: any, idx: number) => {
                          const accuracy = exam.total_questions > 0 
                            ? ((exam.correct_answers / exam.total_questions) * 100).toFixed(1)
                            : 0;
                          const passed = parseFloat(accuracy as string) >= 50;
                          
                          return (
                            <Card key={exam.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <Badge variant={passed ? "default" : "destructive"}>
                                      {passed ? "✓ PASSED" : "✗ FAILED"}
                                    </Badge>
                                    <span className="font-semibold text-lg">
                                      {exam.correct_answers}/{exam.total_questions} ({accuracy}%)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <span>{new Date(exam.created_at).toLocaleDateString()}</span>
                                    <span>{new Date(exam.created_at).toLocaleTimeString()}</span>
                                    <span className="capitalize">
                                      {exam.total_questions === 15 ? "Quick" : exam.total_questions === 25 ? "Half" : "Full"}
                                    </span>
                                  </div>
                                </div>
                                {idx === 0 && (
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* New Exam Setup */
                  <>
                    {/* Paper Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Paper</label>
                      <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose paper..." />
                        </SelectTrigger>
                        <SelectContent>
                          {papers.map((paper) => (
                            <SelectItem key={paper.id} value={paper.paper_code}>
                              {paper.paper_code} - {paper.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Exam Length Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Exam Length</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setExamLength("quick")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            examLength === "quick"
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="font-semibold">Quick</div>
                          <div className="text-sm text-muted-foreground">15 Questions</div>
                          <div className="text-xs text-muted-foreground">36 minutes</div>
                        </button>
                        <button
                          onClick={() => setExamLength("half")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            examLength === "half"
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="font-semibold">Half</div>
                          <div className="text-sm text-muted-foreground">25 Questions</div>
                          <div className="text-xs text-muted-foreground">60 minutes</div>
                        </button>
                        <button
                          onClick={() => setExamLength("full")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            examLength === "full"
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="font-semibold">Full</div>
                          <div className="text-sm text-muted-foreground">50 Questions</div>
                          <div className="text-xs text-muted-foreground">120 minutes</div>
                        </button>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Exam Rules:</strong>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                          <li>Various question types (MCQ, fill-in-the-blank, calculations, matching)</li>
                          <li>Once started, the timer cannot be paused</li>
                          <li>You can navigate between questions freely</li>
                          <li>Exam will auto-submit when time expires</li>
                          <li>Pass mark: 50%</li>
                          <li>All questions carry equal marks</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h3 className="font-semibold">What to expect:</h3>
                      <ul className="list-disc ml-6 space-y-1 text-sm">
                        <li>Questions cover all {selectedPaper} units</li>
                        <li>Mixed difficulty levels</li>
                        <li>Mixed question formats (MCQ, calculations, scenario questions)</li>
                        <li>Realistic exam format</li>
                        <li>Detailed results after submission</li>
                      </ul>
                    </div>
                  </>
                )}

                {!showHistory && !usageLoading && (
                  <>
                    {remainingMocks === 0 && planType === "pro" && (
                      <UpgradeNudge
                        type="mock-limit-ribbon"
                        message="Weekly limit reached. Go Elite for unlimited mocks."
                        tier="elite"
                        variant="banner"
                      />
                    )}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {planType === "free" && (
                          <div>
                            <strong>Free Plan:</strong> {remainingMocks === 0 ? "No mock exams remaining" : `${remainingMocks} mock exam available`}
                          </div>
                        )}
                        {planType === "pro" && (
                          <div>
                            <strong>Pro Plan:</strong> {remainingMocks} of 4 mock exams remaining this week
                            {remainingMocks === 0 && <div className="mt-2">Resets every Monday.</div>}
                          </div>
                        )}
                        {planType === "elite" && (
                          <div>
                            <strong>Elite Plan:</strong> Unlimited mock exams
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {!showHistory && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rules"
                        checked={agreedToRules}
                        onChange={(e) => setAgreedToRules(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="rules">
                        I understand the exam rules and am ready to begin
                      </Label>
                    </div>

                    <Button
                      onClick={startExam}
                      disabled={!agreedToRules || !canUseMockExam || !selectedPaper}
                      size="lg"
                      className="w-full"
                    >
                      {canUseMockExam ? "Start Mock Exam" : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Limit Reached - Upgrade Required
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <FeaturePaywallModal
          open={showPaywall}
          onOpenChange={setShowPaywall}
          paywallType={planType === "free" ? "mock-exam-limit" : "mock-weekly-limit"}
        />
      </>
    );
  }

  if (examSubmitted && results && !reviewMode) {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    };

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Exam Results - {selectedPaper} Mock ({results.examLength})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Overall Results */}
                <div className="text-center space-y-4 p-6 bg-muted/50 rounded-lg">
                  <div className={`text-6xl font-bold ${results.passed ? "text-green-600" : "text-red-600"}`}>
                    {results.accuracy}%
                  </div>
                  <div className="text-2xl font-semibold">
                    {results.correct} / {results.total} Correct
                  </div>
                  <div className={`text-lg font-medium ${results.passed ? "text-green-600" : "text-red-600"}`}>
                    {results.passed ? "✓ PASSED" : "✗ FAILED"}
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Total Time: {formatTime(results.totalTime)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Flagged: {results.flaggedCount}
                    </div>
                    {results.unansweredCount > 0 && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        Unanswered: {results.unansweredCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="w-5 h-5" />
                    Performance by Section
                  </div>
                  <div className="grid gap-4">
                    {results.sectionResults.map((section: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{section.name}</CardTitle>
                            <Badge variant={parseFloat(section.accuracy) >= 50 ? "default" : "destructive"}>
                              {section.accuracy}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {section.correct}/{section.total} correct
                            </span>
                            <span className="text-muted-foreground">
                              Time: {formatTime(section.timeSpent)}
                            </span>
                          </div>
                          <Progress value={parseFloat(section.accuracy)} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Time Analysis */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="w-5 h-5" />
                    Time Management
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Total Time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatTime(results.totalTime)}</div>
                        <p className="text-xs text-muted-foreground">of 120 minutes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Average per Question</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">
                            {formatTime(Math.round(results.totalTime / totalQuestions))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            recommended: {totalQuestions === 15 ? "2m 24s" : totalQuestions === 25 ? "2m 24s" : "2m 24s"}
                          </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Time Remaining</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatTime(initialTime - results.totalTime)}</div>
                        <p className="text-xs text-muted-foreground">unused time</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Action Buttons */}
                <Separator />
                <div className="space-y-2">
                  <Button onClick={() => setReviewMode(true)} className="w-full" size="lg">
                    <Flag className="w-4 h-4 mr-2" />
                    Review Answers with Explanations
                  </Button>
                  <Button onClick={() => navigate("/question-analytics")} variant="outline" className="w-full">
                    View Detailed Question Analytics
                  </Button>
                  <Button onClick={() => navigate("/practice-quiz")} variant="outline" className="w-full">
                    Practice More Questions
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                    Take Another Mock Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <UpgradeNudge
              type="mock-complete"
              message="See question-by-question review with explanations – unlock with Pro."
              tier="pro"
              variant="inline"
              className="mt-6"
            />
          </div>
        </div>
      </>
    );
  }

  // Review Mode
  if (examSubmitted && results && reviewMode) {
    const incorrectQuestions = questions
      .map((q, idx) => ({ question: q, index: idx }))
      .filter(({ index }) => answers[index] !== questions[index].correct_option_index);
    
    const questionsToReview = showIncorrectOnly ? incorrectQuestions : questions.map((q, idx) => ({ question: q, index: idx }));
    
    if (questionsToReview.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Review Mode</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
                <p className="text-lg">Perfect! You answered all questions correctly!</p>
                <Button onClick={() => setReviewMode(false)}>Back to Results</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    const currentReviewItem = questionsToReview[reviewQuestionIndex];
    const currentQ = currentReviewItem.question;
    const currentIdx = currentReviewItem.index;
    const userAnswer = answers[currentIdx];
    const correctAnswer = currentQ.correct_option_index;
    const isCorrect = userAnswer === correctAnswer;
    
    const goToPrevious = () => {
      if (reviewQuestionIndex > 0) {
        setReviewQuestionIndex(reviewQuestionIndex - 1);
      }
    };
    
    const goToNext = () => {
      if (reviewQuestionIndex < questionsToReview.length - 1) {
        setReviewQuestionIndex(reviewQuestionIndex + 1);
      }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
        {/* Header */}
        <div className="fixed top-16 left-0 right-0 bg-background border-b z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReviewMode(false);
                  setReviewQuestionIndex(0);
                  setShowIncorrectOnly(false);
                }}
              >
                ← Back to Results
              </Button>
              <span className="font-semibold">Review Mode</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="incorrectOnly"
                  checked={showIncorrectOnly}
                  onChange={(e) => {
                    setShowIncorrectOnly(e.target.checked);
                    setReviewQuestionIndex(0);
                  }}
                  className="w-4 h-4"
                />
                <Label htmlFor="incorrectOnly" className="text-sm cursor-pointer">
                  Show incorrect only ({incorrectQuestions.length})
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {reviewQuestionIndex + 1} / {questionsToReview.length}
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Question {currentIdx + 1} of 50
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">{currentQ.question}</CardDescription>
                </div>
                <Badge variant={isCorrect ? "default" : "destructive"} className="ml-4">
                  {isCorrect ? "Correct" : "Incorrect"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Answer Section */}
              <QuestionRenderer
                question={currentQ}
                selectedAnswer={userAnswer}
                onAnswerChange={() => {}}
                showFeedback={true}
                disabled={true}
              />

              {/* Explanation */}
              {currentQ.explanation && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                  <p className="text-blue-800">{currentQ.explanation}</p>
                </div>
              )}

              {!currentQ.explanation && (
                <div className="bg-muted/50 p-4 rounded">
                  <p className="text-muted-foreground text-sm">
                    No explanation available for this question.
                  </p>
                </div>
              )}

              {/* Question Actions */}
              <QuestionActions
                questionId={currentQ.id}
                sourceType="mock"
                question={currentQ.question}
                options={currentQ.options}
                correctAnswer={correctAnswer}
                userAnswer={userAnswer}
                explanation={currentQ.explanation}
              />

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                {currentQ.unit_code && (
                  <span>Unit: {currentQ.unit_code}</span>
                )}
                {currentQ.difficulty && (
                  <Badge variant="outline">{currentQ.difficulty}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={goToPrevious}
              disabled={reviewQuestionIndex === 0}
              variant="outline"
            >
              ← Previous Question
            </Button>
            <span className="text-sm text-muted-foreground">
              Question {reviewQuestionIndex + 1} of {questionsToReview.length}
            </span>
            <Button
              onClick={goToNext}
              disabled={reviewQuestionIndex === questionsToReview.length - 1}
              variant="outline"
            >
              Next Question →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
        {/* Timer Bar */}
        <div className="fixed top-16 left-0 right-0 bg-background border-b z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(timeRemaining)}
              </span>
              {timeRemaining < 600 && (
                <span className="text-red-600 text-sm font-medium animate-pulse">
                  (Less than 10 minutes!)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavigator(!showNavigator)}
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                {showNavigator ? 'Hide' : 'Show'} Navigator
              </Button>
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{totalQuestions} Answered
              </span>
              <Button onClick={handleSubmitExam} variant="default">
                Submit Exam
              </Button>
            </div>
          </div>
          <Progress value={progressPercent} className="h-1" />
        </div>

        <div className="container mx-auto px-4 py-8 mt-16 flex gap-6">
          {/* Question Navigator Panel */}
          {showNavigator && (
            <Card className="w-80 h-fit sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Question Navigator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span>Not answered</span>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-4">
                    {sections.map((section, sectionIdx) => {
                      const stats = getSectionStats(section);
                      return (
                        <div key={sectionIdx} className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>{section.name}</span>
                            <span>{stats.answered}/{stats.total}</span>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: section.questionRange[1] - section.questionRange[0] + 1 }, (_, i) => {
                              const qIndex = section.questionRange[0] + i;
                              const status = getQuestionStatus(qIndex);
                              return (
                                <button
                                  key={qIndex}
                                  onClick={() => navigateToQuestion(qIndex)}
                                  className={`
                                    relative w-10 h-10 rounded-md text-xs font-medium
                                    transition-all hover:scale-105
                                    ${currentQuestion === qIndex ? 'ring-2 ring-primary' : ''}
                                    ${status === 'answered' ? 'bg-green-500 text-white' : ''}
                                    ${status === 'flagged' ? 'bg-orange-500 text-white' : ''}
                                    ${status === 'unanswered' ? 'bg-muted hover:bg-muted/80' : ''}
                                  `}
                                >
                                  {qIndex + 1}
                                  {flaggedQuestions.has(qIndex) && (
                                    <Flag className="absolute -top-1 -right-1 w-3 h-3 fill-orange-500 text-orange-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {sectionIdx < sections.length - 1 && <Separator className="mt-4" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          <div className="flex-1 max-w-4xl">
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <Card 
                  key={q.id} 
                  id={`question-${idx}`}
                  ref={el => questionRefs.current[idx] = el}
                  className={currentQuestion === idx ? 'ring-2 ring-primary' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          Question {idx + 1} of {totalQuestions}
                          {sections.find(s => idx >= s.questionRange[0] && idx <= s.questionRange[1]) && (
                            <Badge variant="outline" className="text-xs">
                              {sections.find(s => idx >= s.questionRange[0] && idx <= s.questionRange[1])?.name}
                            </Badge>
                          )}
                          {q.unit_code && (
                            <span className="text-sm font-normal text-muted-foreground">
                              ({q.unit_code})
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">{q.question}</CardDescription>
                      </div>
                      <Button
                        variant={flaggedQuestions.has(idx) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFlag(idx)}
                        className="ml-4"
                      >
                        <Flag className={`w-4 h-4 ${flaggedQuestions.has(idx) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <QuestionRenderer
                      question={q}
                      selectedAnswer={answers[idx]}
                      onAnswerChange={(answer) => handleAnswerSelect(idx, answer)}
                      showFeedback={false}
                      disabled={false}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="mt-6 p-6 text-center">
              <Button onClick={handleSubmitExam} size="lg" className="w-full max-w-md">
                Submit Exam
              </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Make sure you've answered all questions. Flagged: {flaggedQuestions.size}
                </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
