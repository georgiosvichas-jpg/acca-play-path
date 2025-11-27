import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useXP } from "@/hooks/useXP";
import { useTopicPerformance } from "@/hooks/useTopicPerformance";
import { useStudyPreferences } from "@/hooks/useStudyPreferences";
import { useSubscription } from "@/hooks/useSubscription";
import { QuestionActions } from "@/components/QuestionActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  BarChart3, 
  Zap, 
  Flame, 
  Timer, 
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen
} from "lucide-react";
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
  unit_name?: string;
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  streak: number;
  maxStreak: number;
  totalXP: number;
  avgTimePerQuestion: number;
  byUnit: Record<string, { correct: number; total: number; unitName?: string }>;
  byDifficulty: Record<string, { correct: number; total: number }>;
}

// Helper function to shuffle options and update correct index
function shuffleOptions(options: string[], correctIndex: number) {
  // Create array of {option, originalIndex} pairs
  const pairs = options.map((opt, idx) => ({ 
    option: opt, 
    originalIndex: idx 
  }));
  
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  
  // Find new correct index
  const newCorrectIndex = pairs.findIndex(p => p.originalIndex === correctIndex);
  
  return {
    shuffledOptions: pairs.map(p => p.option),
    newCorrectIndex
  };
}

// AI-powered hint generation
async function generateAIHint(
  question: Question,
  setHintLoading: (loading: boolean) => void,
  setGeneratedHint: (hint: string) => void,
  setHintRevealed: (revealed: boolean) => void
): Promise<void> {
  setHintLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('ai-hint', {
      body: {
        question: question.question,
        options: question.options,
        unit_code: question.unit_code,
        unit_name: question.unit_name,
        difficulty: question.difficulty
      }
    });

    if (error) {
      console.error('Error generating hint:', error);
      toast.error(error.message || 'Failed to generate hint');
      setHintRevealed(false);
      return;
    }

    if (data?.hint) {
      setGeneratedHint(data.hint);
    } else {
      toast.error('No hint could be generated');
      setHintRevealed(false);
    }
  } catch (error) {
    console.error('Error generating hint:', error);
    toast.error('Failed to generate hint. Please try again.');
    setHintRevealed(false);
  } finally {
    setHintLoading(false);
  }
}

// Legacy function - kept for reference but unused
function generateHint(question: Question): string {
  return "Generating AI-powered hint...";
}

export default function PracticeQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkAndAwardBadges } = useBadgeChecker();
  const { recordBatchReviews } = useSpacedRepetition();
  const { awardXP, currentXP, ConfettiComponent } = useXP();
  const { trackPerformance } = useTopicPerformance();
  const { refetchProfile } = useUserProfile();
  const { planType } = useSubscription();
  
  // Study preferences hook
  const {
    selectedPaper: paper,
    selectedUnit: unitCode,
    selectedDifficulty: difficulty,
    setSelectedPaper: setPaper,
    setSelectedUnit: setUnitCode,
    setSelectedDifficulty: setDifficulty,
    papers,
    availableUnits,
    loading: prefsLoading,
  } = useStudyPreferences();
  
  // Setup state
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Array<{ 
    questionId: string; 
    correct: boolean; 
    unitCode: string | null; 
    unitName?: string;
    difficulty: string | null;
    timeSpent: number;
  }>>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Gamification state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [hintRevealed, setHintRevealed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintLoading, setHintLoading] = useState(false);
  const [generatedHint, setGeneratedHint] = useState<string>("");

  // No manual initialization needed - handled by useStudyPreferences hook

  useEffect(() => {
    if (!quizStarted || showFeedback || !timerEnabled) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, showFeedback, timerEnabled]);

  const startQuiz = async (overridePaper?: string, overrideUnit?: string) => {
    // Use override values if provided, otherwise use hook values
    const quizPaper = overridePaper || paper;
    const quizUnit = overrideUnit || unitCode;
    
    // Refresh profile to get latest XP balance
    await refetchProfile();
    
    setLoading(true);
    try {
      let query = supabase
        .from("sb_questions")
        .select("*")
        .eq("paper", quizPaper)
        .in("type", ["mcq", "MCQ_SINGLE", "MCQ_MULTI"]);

      if (quizUnit !== "all") {
        query = query.eq("unit_code", quizUnit);
      }
      
      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const questionCount = numQuestions;
      const { data, error } = await query.limit(questionCount * 3);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("No questions found with selected criteria");
        setLoading(false);
        return;
      }

      // Fetch unit names for this paper
      const { data: unitsData, error: unitsError } = await supabase
        .from("syllabus_units")
        .select("unit_code, unit_name, unit_title")
        .eq("paper_code", paper);

      if (unitsError) {
        console.error("Failed to fetch syllabus units for practice quiz", unitsError);
      }

      const unitMap = new Map(
        (unitsData ?? []).map((u) => [u.unit_code, u.unit_name || u.unit_title])
      );

      // Shuffle questions and take requested number, adding unit names
      const shuffled = data
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(questionCount, data.length))
        .map(q => ({
          ...q,
          unit_name: q.unit_code ? unitMap.get(q.unit_code) : undefined
        }));

      // Shuffle options for each question to randomize correct answer positions
      const shuffledQuestions = shuffled.map(q => {
        if (q.options && Array.isArray(q.options) && q.correct_option_index !== null) {
          const { shuffledOptions, newCorrectIndex } = shuffleOptions(
            q.options as string[], 
            q.correct_option_index
          );
          return {
            ...q,
            options: shuffledOptions,
            correct_option_index: newCorrectIndex
          };
        }
        return q;
      });

      setQuestions(shuffledQuestions as Question[]);
      setQuizStarted(true);
      setCurrentIndex(0);
      setAnswers([]);
      setQuizCompleted(false);
      setCurrentStreak(0);
      setMaxStreak(0);
      setEarnedXP(0);
      setHintsUsed(0);
      setQuestionStartTime(Date.now());
      setTimeRemaining(30);
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeOut = () => {
    if (showFeedback) return;
    
    toast.error("Time's up!");
    
    const currentQuestion = questions[currentIndex];
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    
      setAnswers([...answers, {
        questionId: currentQuestion.id,
        correct: false,
        unitCode: currentQuestion.unit_code,
        unitName: currentQuestion.unit_name,
        difficulty: currentQuestion.difficulty,
        timeSpent
      }]);

    setCurrentStreak(0);
    setShowFeedback(true);
  };

  const unlockHint = async () => {
    if (gamificationEnabled) {
      const hintCost = 5;
      if (currentXP < hintCost) {
        toast.error(`Not enough XP! You need 5 XP but only have ${currentXP} XP.`);
        return;
      }
      awardXP("hint_used", -hintCost);
      toast.success("Generating hint... (-5 XP)");
    }
    
    setHintRevealed(true);
    setHintsUsed(hintsUsed + 1);
    
    // Generate AI hint
    await generateAIHint(
      questions[currentIndex],
      setHintLoading,
      setGeneratedHint,
      setHintRevealed
    );
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_option_index;
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    // Update streak and XP (only if gamification enabled)
    if (gamificationEnabled) {
      if (isCorrect) {
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        setMaxStreak(Math.max(maxStreak, newStreak));

        // Calculate XP with streak bonus
        let xp = 5; // Base XP
        if (timerEnabled) xp += 3; // Timer bonus
        if (newStreak >= 3) xp += Math.floor(newStreak / 3) * 2; // Combo multiplier
        if (!hintRevealed) xp += 2; // No hint bonus
        
        setEarnedXP(earnedXP + xp);
        
        // Show streak toast
        if (newStreak >= 3) {
          toast.success(`${newStreak}x Streak! +${xp} XP (${Math.floor(newStreak / 3)}x combo bonus!)`, {
            icon: <Flame className="w-4 h-4 text-orange-500" />,
          });
        } else {
          toast.success(`Correct! +${xp} XP`);
        }
      } else {
        setCurrentStreak(0);
        toast.error("Incorrect. Streak reset!");
      }
    } else {
      // Simple feedback without gamification
      if (isCorrect) {
        toast.success("Correct!");
      } else {
        toast.error("Incorrect");
      }
    }

    // Track topic performance
    if (user) {
      trackPerformance(
        currentQuestion.paper,
        currentQuestion.unit_code,
        currentQuestion.unit_code || "General",
        isCorrect
      );
    }

    setAnswers([...answers, {
      questionId: currentQuestion.id,
      correct: isCorrect,
      unitCode: currentQuestion.unit_code,
      unitName: currentQuestion.unit_name,
      difficulty: currentQuestion.difficulty,
      timeSpent
    }]);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setHintRevealed(false);
      setGeneratedHint("");
      setQuestionStartTime(Date.now());
      setTimeRemaining(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const totalQuestions = answers.length + 1;
    const currentQuestion = questions[currentIndex];
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const isCorrect = selectedAnswer === currentQuestion.correct_option_index;
    
    const finalAnswers = [...answers, {
      questionId: currentQuestion.id,
      correct: isCorrect,
      unitCode: currentQuestion.unit_code,
      unitName: currentQuestion.unit_name,
      difficulty: currentQuestion.difficulty,
      timeSpent
    }];

    const correctAnswers = finalAnswers.filter(a => a.correct).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const avgTime = finalAnswers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions;

    // Calculate by unit
    const byUnit: Record<string, { correct: number; total: number; unitName?: string }> = {};
    finalAnswers.forEach(ans => {
      const unit = ans.unitCode || "Unknown";
      if (!byUnit[unit]) byUnit[unit] = { correct: 0, total: 0, unitName: ans.unitName };
      byUnit[unit].total++;
      if (ans.correct) byUnit[unit].correct++;
    });

    // Calculate by difficulty
    const byDifficulty: Record<string, { correct: number; total: number }> = {};
    finalAnswers.forEach(ans => {
      const diff = ans.difficulty || "Unknown";
      if (!byDifficulty[diff]) byDifficulty[diff] = { correct: 0, total: 0 };
      byDifficulty[diff].total++;
      if (ans.correct) byDifficulty[diff].correct++;
    });

    // Award final XP (only if gamification enabled)
    if (gamificationEnabled) {
      await awardXP("quiz_complete", earnedXP);
    }

    const quizResult = {
      totalQuestions,
      correctAnswers,
      accuracy,
      streak: currentStreak,
      maxStreak,
      totalXP: earnedXP,
      avgTimePerQuestion: avgTime,
      byUnit,
      byDifficulty
    };

    setResult(quizResult);
    setQuizCompleted(true);

    // Log session
    if (user) {
      try {
        const rawLog = questions.map((q, idx) => ({
          question_id: q.id,
          unit_code: q.unit_code,
          difficulty: q.difficulty,
          correct: idx < finalAnswers.length ? finalAnswers[idx].correct : isCorrect
        }));

        await supabase.functions.invoke("sessions-log", {
          body: {
            userId: user.id,
            session_type: timerEnabled ? "sprint_drill" : "quick_drill",
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            raw_log: rawLog
          }
        });

        // Record in spaced repetition system
        const reviewData = questions.map((q, idx) => ({
          questionId: q.id,
          isCorrect: idx < finalAnswers.length ? finalAnswers[idx].correct : isCorrect
        }));
        await recordBatchReviews(reviewData);

        await checkAndAwardBadges();
      } catch (error) {
        console.error("Error logging session:", error);
      }
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
    setQuizCompleted(false);
    setResult(null);
    setCurrentStreak(0);
    setMaxStreak(0);
    setEarnedXP(0);
    setHintsUsed(0);
  };

  const getStreakColor = () => {
    if (currentStreak >= 10) return "text-purple-600";
    if (currentStreak >= 5) return "text-orange-600";
    if (currentStreak >= 3) return "text-yellow-600";
    return "text-muted-foreground";
  };

  if (!quizStarted) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice Quiz</CardTitle>
            <CardDescription>Customize your practice session with the options below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="timer-toggle">Timer Mode</Label>
                  <p className="text-sm text-muted-foreground">30 seconds per question</p>
                </div>
                <Switch
                  id="timer-toggle"
                  checked={timerEnabled}
                  onCheckedChange={setTimerEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="gamification-toggle">Gamification</Label>
                  <p className="text-sm text-muted-foreground">Enable XP, streaks, and bonus rewards</p>
                </div>
                <Switch
                  id="gamification-toggle"
                  checked={gamificationEnabled}
                  onCheckedChange={setGamificationEnabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Paper</Label>
              <Select value={paper} onValueChange={setPaper} disabled={prefsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={prefsLoading ? "Loading papers..." : "Select a paper"} />
                </SelectTrigger>
                <SelectContent>
                  {papers.map((p) => (
                    <SelectItem key={p.id} value={p.paper_code}>
                      {p.title} ({p.paper_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unit (Optional)</Label>
              <Select value={unitCode} onValueChange={setUnitCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.unit_code}>
                      {unit.unit_code} - {unit.unit_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty (Optional)</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Select value={numQuestions.toString()} onValueChange={(val) => setNumQuestions(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => startQuiz()} disabled={loading} className="w-full">
              {loading ? "Loading..." : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted && result) {
    return (
      <>
        {ConfettiComponent}
        <div className="container max-w-3xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.accuracy >= 80 ? "🔥 Amazing!" : result.accuracy >= 60 ? "✅ Well Done!" : "💪 Keep Going!"}
              </CardTitle>
              <CardDescription>Here's your performance breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {gamificationEnabled && (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-4xl font-bold text-primary">
                        {result.accuracy.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Accuracy</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-4xl font-bold flex items-center justify-center gap-2">
                        <Flame className="w-8 h-8 text-orange-500" />
                        {result.maxStreak}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Max Streak</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-4xl font-bold text-green-600">
                        +{result.totalXP}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">XP Earned</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score</span>
                      <span>{result.correctAnswers} / {result.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Hints Used</span>
                      <span>{hintsUsed}</span>
                    </div>
                  </div>
                </>
              )}

              {!gamificationEnabled && (
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {result.correctAnswers} / {result.totalQuestions}
                  </div>
                  <p className="text-lg text-muted-foreground">{result.accuracy.toFixed(1)}% Accuracy</p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Performance by Unit</h3>
                {Object.entries(result.byUnit).map(([unit, stats]) => (
                  <div key={unit} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{stats.unitName || unit}</span>
                      <span>{stats.correct} / {stats.total} ({((stats.correct / stats.total) * 100).toFixed(0)}%)</span>
                    </div>
                    <Progress value={(stats.correct / stats.total) * 100} />
                  </div>
                ))}
              </div>

              {(() => {
                const weakestUnit = Object.entries(result.byUnit).reduce((min, [unit, stats]) => {
                  const accuracy = (stats.correct / stats.total) * 100;
                  return accuracy < (min.accuracy || 100) ? { unit, accuracy, ...stats } : min;
                }, {} as any);

                if (weakestUnit.unit && weakestUnit.accuracy < 70) {
                  const unitDisplay = weakestUnit.unitName || weakestUnit.unit;
                  return (
                    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                          <CardTitle className="text-lg">Focus Area Identified</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/40 border-orange-300 text-orange-900 dark:text-orange-100 mb-3">
                            {unitDisplay}
                            {weakestUnit.unitName && (
                              <span className="ml-1 text-xs opacity-60">({weakestUnit.unit})</span>
                            )}
                          </Badge>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Your accuracy</span>
                              <span className="font-medium">{weakestUnit.accuracy.toFixed(0)}%</span>
                            </div>
                            <Progress 
                              value={weakestUnit.accuracy} 
                              className="h-2"
                              indicatorClassName={weakestUnit.accuracy < 40 ? "bg-red-500" : "bg-orange-500"}
                            />
                            <p className="text-xs text-muted-foreground">
                              {weakestUnit.correct} of {weakestUnit.total} questions correct
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>💡 Tip:</strong> Review this topic's core concepts to strengthen your understanding before retrying.
                          </p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={async () => {
                              // Reset quiz state and start a new quiz with the weak unit
                              setQuizStarted(false);
                              setQuizCompleted(false);
                              setResult(null);
                              setAnswers([]);
                              setCurrentIndex(0);
                              setEarnedXP(0);
                              setCurrentStreak(0);
                              setMaxStreak(0);
                              
                              // Start quiz with specific filters
                              await startQuiz(paper, weakestUnit.unit);
                            }}
                            size="sm"
                            className="flex-1"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Practice This Topic
                          </Button>
                          <Button
                            onClick={() => navigate(`/learn?paper=${paper}&unit=${weakestUnit.unit}`)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Review Flashcards
                          </Button>
                        </div>

                        {/* Upgrade nudges based on plan tier */}
                        {planType === "free" && (
                          <UpgradeNudge
                            type="elite-insights"
                            message="Get deeper insights and advanced drill modes – upgrade to Pro."
                            tier="pro"
                            variant="inline"
                            className="mt-2"
                          />
                        )}
                        {planType === "pro" && (
                          <UpgradeNudge
                            type="elite-insights"
                            message="Unlock Elite insights and predictive analytics – upgrade to Elite."
                            tier="elite"
                            variant="inline"
                            className="mt-2"
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              })()}

              <div className="space-y-4">
                <h3 className="font-semibold">By Difficulty</h3>
                {Object.entries(result.byDifficulty).map(([diff, stats]) => (
                  <div key={diff} className="space-y-1">
                    <div className="flex justify-between text-sm capitalize">
                      <span>{diff}</span>
                      <span>{stats.correct} / {stats.total} ({((stats.correct / stats.total) * 100).toFixed(0)}%)</span>
                    </div>
                    <Progress value={(stats.correct / stats.total) * 100} />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={resetQuiz} variant="outline" className="flex-1">
                  New Quiz
                </Button>
                <Button onClick={() => navigate("/analytics")} className="flex-1">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <UpgradeNudge
            type="practice-footer"
            message="Get deeper insights and advanced drill modes – upgrade to Pro."
            tier="pro"
            variant="inline"
          />
        </div>
      </>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      {ConfettiComponent}
      <div className="container max-w-3xl mx-auto p-6">
        {/* Stats Bar - Only show if gamification enabled */}
        {gamificationEnabled && (
          <div className={`grid ${timerEnabled ? 'grid-cols-4' : 'grid-cols-3'} gap-3 mb-6`}>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 ${getStreakColor()}`} />
                <div>
                  <div className="text-2xl font-bold">{currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{currentXP}</div>
                  <div className="text-xs text-muted-foreground">
                    XP Balance {earnedXP > 0 && <span className="text-green-600">(+{earnedXP})</span>}
                  </div>
                </div>
              </div>
            </Card>
            {timerEnabled && (
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Timer className={`w-5 h-5 ${timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-primary'}`} />
                  <div>
                    <div className="text-2xl font-bold">{timeRemaining}s</div>
                    <div className="text-xs text-muted-foreground">Left</div>
                  </div>
                </div>
              </Card>
            )}
            <Card className="p-3">
              <div>
                <div className="text-2xl font-bold">{currentIndex + 1}/{questions.length}</div>
                <div className="text-xs text-muted-foreground">Question</div>
              </div>
            </Card>
          </div>
        )}

        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {currentQuestion.unit_code && (
                    <Badge variant="outline">{currentQuestion.unit_code}</Badge>
                  )}
                  {currentQuestion.difficulty && (
                    <Badge variant="secondary" className="capitalize">{currentQuestion.difficulty}</Badge>
                  )}
                  {timerEnabled && (
                    <Badge variant="default">
                      <Timer className="w-3 h-3 mr-1" />
                      Timed
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              </div>
              {showFeedback && (
                <QuestionActions
                  questionId={currentQuestion.id}
                  sourceType="practice"
                  question={currentQuestion.question}
                  options={currentQuestion.options}
                  correctAnswer={currentQuestion.correct_option_index}
                  userAnswer={selectedAnswer}
                  explanation={currentQuestion.explanation}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hintRevealed && !showFeedback && (
              <Button
                variant="outline"
                size="sm"
                onClick={unlockHint}
                disabled={hintLoading || (gamificationEnabled && currentXP < 5)}
              >
                {hintLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {gamificationEnabled ? "Reveal Hint (Costs 5 XP)" : "Reveal Hint"}
                  </>
                )}
              </Button>
            )}

            {hintRevealed && !showFeedback && generatedHint && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <strong>Strategic Hint:</strong> {generatedHint}
                  </div>
                </div>
              </div>
            )}

            <RadioGroup 
              key={currentQuestion.id} 
              value={selectedAnswer?.toString()} 
              onValueChange={(val) => setSelectedAnswer(parseInt(val))}
            >
              {currentQuestion.options.map((option, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center space-x-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    showFeedback
                      ? idx === currentQuestion.correct_option_index
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : idx === selectedAnswer
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : "border-border"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => !showFeedback && setSelectedAnswer(idx)}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} disabled={showFeedback} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                    {showFeedback && idx === currentQuestion.correct_option_index && (
                      <CheckCircle2 className="inline ml-2 h-5 w-5 text-green-600" />
                    )}
                    {showFeedback && idx === selectedAnswer && idx !== currentQuestion.correct_option_index && (
                      <XCircle className="inline ml-2 h-5 w-5 text-red-600" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {showFeedback && currentQuestion.explanation && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!showFeedback && (
                <Button 
                  onClick={handleAnswer} 
                  disabled={selectedAnswer === null} 
                  className="flex-1"
                >
                  Submit Answer
                </Button>
              )}
              {showFeedback && currentIndex < questions.length - 1 && (
                <Button onClick={handleNext} className="flex-1">
                  Next Question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {showFeedback && currentIndex === questions.length - 1 && (
                <Button onClick={handleNext} className="flex-1">
                  Finish Quiz
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}