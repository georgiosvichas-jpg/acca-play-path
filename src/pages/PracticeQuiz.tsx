import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { usePapers } from "@/hooks/usePapers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowRight, BarChart3 } from "lucide-react";
import { UpgradeNudge } from "@/components/UpgradeNudge";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

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
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  byUnit: Record<string, { correct: number; total: number }>;
  byDifficulty: Record<string, { correct: number; total: number }>;
}

export default function PracticeQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkAndAwardBadges } = useBadgeChecker();
  const { recordBatchReviews } = useSpacedRepetition();
  const { papers, loading: papersLoading } = usePapers();
  
  // Setup state
  const [paper, setPaper] = useState<string>("");
  const [unitCode, setUnitCode] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [availableUnits, setAvailableUnits] = useState<Array<{ code: string; title: string }>>([]);
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; correct: boolean; unitCode: string | null; difficulty: string | null }>>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Set first paper when papers load
  useEffect(() => {
    if (papers.length > 0 && !paper) {
      setPaper(papers[0].paper_code);
    }
  }, [papers, paper]);

  // Fetch available units on mount
  useEffect(() => {
    if (paper) {
      fetchAvailableUnits();
    }
  }, [paper]);

  const fetchAvailableUnits = async () => {
    // Get unique unit codes from questions
    const { data: questionData, error: questionsError } = await supabase
      .from("sb_questions")
      .select("unit_code")
      .eq("paper", paper)
      .not("unit_code", "is", null);

    if (questionsError || !questionData) return;

    const uniqueCodes = [...new Set(questionData.map(d => d.unit_code).filter(Boolean))] as string[];

    // Fetch unit titles from syllabus_units
    const { data: syllabusData, error: syllabusError } = await supabase
      .from("syllabus_units")
      .select("unit_code, unit_title")
      .eq("paper_code", paper)
      .in("unit_code", uniqueCodes);

    if (!syllabusError && syllabusData) {
      const unitsWithTitles = uniqueCodes.map(code => {
        const syllabusUnit = syllabusData.find(s => s.unit_code === code);
        return {
          code,
          title: syllabusUnit?.unit_title || code
        };
      }).sort((a, b) => a.code.localeCompare(b.code));
      
      setAvailableUnits(unitsWithTitles);
    }
  };

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

      const { data, error } = await query.limit(numQuestions * 3);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("No questions found with selected criteria");
        setLoading(false);
        return;
      }

      // Shuffle and take requested number
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, Math.min(numQuestions, data.length));
      setQuestions(shuffled as Question[]);
      setQuizStarted(true);
      setCurrentIndex(0);
      setAnswers([]);
      setQuizCompleted(false);
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_option_index;

    setAnswers([...answers, {
      questionId: currentQuestion.id,
      correct: isCorrect,
      unitCode: currentQuestion.unit_code,
      difficulty: currentQuestion.difficulty
    }]);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const totalQuestions = answers.length + 1;
    const correctAnswers = answers.filter(a => a.correct).length + (selectedAnswer === questions[currentIndex].correct_option_index ? 1 : 0);
    const accuracy = (correctAnswers / totalQuestions) * 100;

    // Calculate by unit
    const byUnit: Record<string, { correct: number; total: number }> = {};
    [...answers, { 
      questionId: questions[currentIndex].id, 
      correct: selectedAnswer === questions[currentIndex].correct_option_index,
      unitCode: questions[currentIndex].unit_code,
      difficulty: questions[currentIndex].difficulty
    }].forEach(ans => {
      const unit = ans.unitCode || "Unknown";
      if (!byUnit[unit]) byUnit[unit] = { correct: 0, total: 0 };
      byUnit[unit].total++;
      if (ans.correct) byUnit[unit].correct++;
    });

    // Calculate by difficulty
    const byDifficulty: Record<string, { correct: number; total: number }> = {};
    [...answers, {
      questionId: questions[currentIndex].id,
      correct: selectedAnswer === questions[currentIndex].correct_option_index,
      unitCode: questions[currentIndex].unit_code,
      difficulty: questions[currentIndex].difficulty
    }].forEach(ans => {
      const diff = ans.difficulty || "Unknown";
      if (!byDifficulty[diff]) byDifficulty[diff] = { correct: 0, total: 0 };
      byDifficulty[diff].total++;
      if (ans.correct) byDifficulty[diff].correct++;
    });

    const quizResult = {
      totalQuestions,
      correctAnswers,
      accuracy,
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
          correct: idx < answers.length ? answers[idx].correct : selectedAnswer === q.correct_option_index
        }));

        await supabase.functions.invoke("sessions-log", {
          body: {
            userId: user.id,
            session_type: "quick_drill",
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            raw_log: rawLog
          }
        });

        // Record in spaced repetition system
        const reviewData = questions.map((q, idx) => ({
          questionId: q.id,
          isCorrect: idx < answers.length ? answers[idx].correct : selectedAnswer === q.correct_option_index
        }));
        await recordBatchReviews(reviewData);

        // Check for badge achievements
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
  };

  if (!quizStarted) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice Quiz</CardTitle>
            <CardDescription>Test your knowledge with custom quizzes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Paper</Label>
              <Select value={paper} onValueChange={setPaper} disabled={papersLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={papersLoading ? "Loading papers..." : "Select a paper"} />
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
                    <SelectItem key={unit.code} value={unit.code}>
                      {unit.code} - {unit.title}
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
      <div className="container max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Complete! 🎉</CardTitle>
            <CardDescription>Here's how you performed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-primary">
                {result.accuracy.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">
                {result.correctAnswers} / {result.totalQuestions} correct
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">By Unit</h3>
              {Object.entries(result.byUnit).map(([unit, stats]) => (
                <div key={unit} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{unit}</span>
                    <span>{stats.correct} / {stats.total}</span>
                  </div>
                  <Progress value={(stats.correct / stats.total) * 100} />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">By Difficulty</h3>
              {Object.entries(result.byDifficulty).map(([diff, stats]) => (
                <div key={diff} className="space-y-1">
                  <div className="flex justify-between text-sm capitalize">
                    <span>{diff}</span>
                    <span>{stats.correct} / {stats.total}</span>
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
          message="Strengthen your weak areas faster – unlock full analytics in Pro."
          tier="pro"
          variant="inline"
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardDescription className="mb-2">
                {currentQuestion.unit_code} • {currentQuestion.difficulty}
              </CardDescription>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            key={currentQuestion.id} 
            value={selectedAnswer?.toString()} 
            onValueChange={(val) => setSelectedAnswer(parseInt(val))}
          >
            {currentQuestion.options.map((option, idx) => (
              <div 
                key={idx} 
                className={`flex items-center space-x-2 p-4 rounded-lg border cursor-pointer ${
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
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-1">Explanation:</p>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!showFeedback ? (
              <Button onClick={handleAnswer} disabled={selectedAnswer === null} className="w-full">
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full">
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Finish Quiz"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
