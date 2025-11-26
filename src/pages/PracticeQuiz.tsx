import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useXP } from "@/hooks/useXP";
import { useTopicPerformance } from "@/hooks/useTopicPerformance";
import { useStudyPreferences } from "@/hooks/useStudyPreferences";
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
  TrendingUp
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
  byUnit: Record<string, { correct: number; total: number }>;
  byDifficulty: Record<string, { correct: number; total: number }>;
}

function generateHint(question: Question): string {
  // Use unit name for safe topical context
  if (question.unit_name) {
    return `This question is about ${question.unit_name}. Try to recall the key concepts you learned in this area.`;
  }

  // Topic-specific safe hints that guide thinking without revealing answers
  const topicHints: Record<string, string> = {
    'FA01': 'Think about the purpose and users of financial accounting.',
    'FA02': 'Consider how debits and credits maintain the accounting equation.',
    'FA03': 'Think about how transactions flow through the ledger system.',
    'FA04': 'Consider the key differences between capital and revenue items.',
    'FA05': 'Think about how assets are recorded at their cost.',
    'FA06': 'Consider depreciation methods and their impacts.',
    'FA07': 'Think about how errors affect different sides of the ledger.',
    'FA08': 'Consider the purpose of control accounts and reconciliations.',
    'FA09': 'Think about what adjustments are needed at year-end.',
    'FA10': 'Consider the components of published financial statements.',
  };

  if (question.unit_code && topicHints[question.unit_code]) {
    return topicHints[question.unit_code];
  }

  if (question.unit_code) {
    return `This tests a concept from ${question.unit_code}. Focus on the core principles of this topic.`;
  }

  return "Focus on the fundamental concept being tested. Eliminate obviously wrong answers first.";
}

export default function PracticeQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkAndAwardBadges } = useBadgeChecker();
  const { recordBatchReviews } = useSpacedRepetition();
  const { awardXP, currentXP, ConfettiComponent } = useXP();
  const { trackPerformance } = useTopicPerformance();
  
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
    difficulty: string | null;
    timeSpent: number;
    confidence: number;
  }>>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Gamification state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [confidence, setConfidence] = useState(3);
  const [showConfidence, setShowConfidence] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [hintRevealed, setHintRevealed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

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

  const startQuiz = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("sb_questions")
        .select("*")
        .eq("paper", paper)
        .eq("type", "mcq");

      if (unitCode !== "all") {
        query = query.eq("unit_code", unitCode);
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

      // Shuffle and take requested number, adding unit names
      const shuffled = data
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(questionCount, data.length))
        .map(q => ({
          ...q,
          unit_name: q.unit_code ? unitMap.get(q.unit_code) : undefined
        }));
      setQuestions(shuffled as Question[]);
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
      difficulty: currentQuestion.difficulty,
      timeSpent,
      confidence: 0
    }]);

    setCurrentStreak(0);
    setShowFeedback(true);
  };

  const unlockHint = () => {
    if (gamificationEnabled) {
      const hintCost = 5;
      if (currentXP < hintCost) {
        toast.error(`Need ${hintCost} XP to unlock hint`);
        return;
      }
      awardXP("hint_used", -hintCost);
      toast.success("Hint revealed! (-5 XP)");
    } else {
      // Free hint when gamification is off
      toast.success("Hint revealed!");
    }
    
    setHintRevealed(true);
    setHintsUsed(hintsUsed + 1);
  };

  const handleConfidenceSubmit = () => {
    setShowConfidence(false);
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    if (gamificationEnabled && !showConfidence && !timerEnabled) {
      setShowConfidence(true);
      return;
    }

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
      difficulty: currentQuestion.difficulty,
      timeSpent,
      confidence: showConfidence ? confidence : 3
    }]);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowConfidence(false);
      setConfidence(3);
      setHintRevealed(false);
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
      difficulty: currentQuestion.difficulty,
      timeSpent,
      confidence: showConfidence ? confidence : 3
    }];

    const correctAnswers = finalAnswers.filter(a => a.correct).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const avgTime = finalAnswers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions;

    // Calculate by unit
    const byUnit: Record<string, { correct: number; total: number }> = {};
    finalAnswers.forEach(ans => {
      const unit = ans.unitCode || "Unknown";
      if (!byUnit[unit]) byUnit[unit] = { correct: 0, total: 0 };
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

            <Button onClick={startQuiz} disabled={loading} className="w-full">
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
                      <span>{unit}</span>
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
                  return (
                    <div className="p-4 border border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-orange-900 dark:text-orange-100">Focus Area Identified</h4>
                          <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                            <strong>{weakestUnit.unit}</strong> needs attention ({weakestUnit.accuracy.toFixed(0)}% accuracy). 
                            Consider reviewing this topic before your next session.
                          </p>
                        </div>
                      </div>
                    </div>
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
          <div className="grid grid-cols-4 gap-3 mb-6">
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
                  <div className="text-2xl font-bold">+{earnedXP}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
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

        {/* Confidence Meter Modal - Only show if gamification enabled */}
        {showConfidence && gamificationEnabled && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">How confident are you?</CardTitle>
              <CardDescription>Rate your confidence before seeing the result</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <Badge 
                    key={level}
                    variant={confidence === level ? "default" : "outline"}
                    className="cursor-pointer text-lg px-4 py-2"
                    onClick={() => setConfidence(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
              <Button onClick={handleConfidenceSubmit} className="w-full">
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
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
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hintRevealed && !showFeedback && (
              <Button
                variant="outline"
                size="sm"
                onClick={unlockHint}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {gamificationEnabled ? "Reveal Hint (-5 XP)" : "Reveal Hint"}
              </Button>
            )}

            {hintRevealed && !showFeedback && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <strong>Hint:</strong> {generateHint(currentQuestion)}
                  </div>
                </div>
              </div>
            )}

            <RadioGroup 
              key={currentQuestion.id} 
              value={selectedAnswer?.toString()} 
              onValueChange={(val) => setSelectedAnswer(parseInt(val))}
              disabled={showConfidence}
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
                  onClick={() => !showFeedback && !showConfidence && setSelectedAnswer(idx)}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} disabled={showFeedback || showConfidence} />
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