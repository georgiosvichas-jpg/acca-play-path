import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Brain, CheckCircle2, XCircle, ArrowRight, Calendar, TrendingUp } from "lucide-react";

interface Question {
  id: string;
  paper: string;
  unit_code: string | null;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string | null;
}

export default function SpacedRepetition() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recordReview, getDueReviews, getReviewStats } = useSpacedRepetition();
  const { checkAndAwardBadges } = useBadgeChecker();

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [dueQuestionIds, setDueQuestionIds] = useState<string[]>([]);

  // Review session state
  const [reviewStarted, setReviewStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; correct: boolean }>>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const reviewStats = await getReviewStats();
    const dueIds = await getDueReviews();
    setStats(reviewStats);
    setDueQuestionIds(dueIds);
  };

  const startReviewSession = async () => {
    if (dueQuestionIds.length === 0) {
      toast.error("No questions due for review");
      return;
    }

    try {
      // Fetch questions by IDs
      const { data, error } = await supabase
        .from("sb_questions")
        .select("*")
        .in("id", dueQuestionIds)
        .limit(20); // Review max 20 at a time

      if (error) throw error;

      const formattedQuestions = data?.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : []
      })) || [];

      setQuestions(formattedQuestions);
      setReviewStarted(true);
      toast.success("Review session started!");
    } catch (error) {
      console.error("Error starting review:", error);
      toast.error("Failed to start review session");
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    const isCorrect = selectedAnswer === questions[currentIndex].correct_option_index;
    
    // Record this answer
    const newAnswers = [...answers, {
      questionId: questions[currentIndex].id,
      correct: isCorrect
    }];
    setAnswers(newAnswers);

    // Record in spaced repetition system
    await recordReview(questions[currentIndex].id, isCorrect);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = (correctCount / answers.length) * 100;

    // Log session
    if (user) {
      try {
        await supabase.from("sb_study_sessions").insert({
          user_id: user.id,
          session_type: "spaced_repetition",
          total_questions: answers.length,
          correct_answers: correctCount,
          raw_log: answers.map(a => ({
            question_id: a.questionId,
            is_correct: a.correct
          }))
        });

        await checkAndAwardBadges();
      } catch (error) {
        console.error("Error logging session:", error);
      }
    }

    setSessionComplete(true);
    toast.success(`Review complete! Score: ${correctCount}/${answers.length} (${accuracy.toFixed(1)}%)`);
    
    // Reload stats
    await loadStats();
  };

  if (sessionComplete) {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = (correctCount / answers.length) * 100;

    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Review Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">
                    {accuracy.toFixed(1)}%
                  </div>
                  <div className="text-2xl font-semibold">
                    {correctCount} / {answers.length} Correct
                  </div>
                  <p className="text-muted-foreground">
                    Questions will be rescheduled based on your performance
                  </p>
                </div>

                <div className="space-y-2">
                  <Button onClick={() => window.location.reload()} className="w-full">
                    Review More Questions
                  </Button>
                  <Button onClick={() => navigate("/question-analytics")} variant="outline" className="w-full">
                    View Analytics
                  </Button>
                  <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (reviewStarted && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>
                    Question {currentIndex + 1} of {questions.length}
                  </CardTitle>
                  {currentQuestion.unit_code && (
                    <span className="text-sm text-muted-foreground">
                      {currentQuestion.unit_code}
                    </span>
                  )}
                </div>
                <Progress value={progressPercent} className="mb-4" />
                <CardDescription className="text-base">
                  {currentQuestion.question}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={selectedAnswer?.toString() || ""}
                  onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                  disabled={showFeedback}
                >
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correct_option_index;
                    const showResult = showFeedback && (isSelected || isCorrect);

                    return (
                      <div
                        key={idx}
                        className={`flex items-center space-x-2 p-3 rounded-lg border ${
                          showResult
                            ? isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-950"
                              : "border-red-500 bg-red-50 dark:bg-red-950"
                            : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                        <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {showResult && !isCorrect && isSelected && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                    );
                  })}
                </RadioGroup>

                {showFeedback && currentQuestion.explanation && (
                  <Alert>
                    <AlertDescription>
                      <strong>Explanation:</strong> {currentQuestion.explanation}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  {!showFeedback ? (
                    <Button onClick={handleAnswerSubmit}>Submit Answer</Button>
                  ) : (
                    <Button onClick={handleNext}>
                      {currentIndex < questions.length - 1 ? (
                        <>Next Question <ArrowRight className="ml-2 w-4 h-4" /></>
                      ) : (
                        "Complete Review"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Spaced Repetition Review
                </CardTitle>
                <CardDescription>
                  Master questions using scientifically-proven spaced repetition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Questions you've answered incorrectly are scheduled for review at optimal intervals
                  to maximize long-term retention. The system adapts to your performance.
                </p>
              </CardContent>
            </Card>

            {/* Stats */}
            {stats && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{stats.dueCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Questions ready now
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalReviewed}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Questions in system
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.avgAccuracy}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all reviews
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle>Start Review Session</CardTitle>
                <CardDescription>
                  {dueQuestionIds.length > 0
                    ? `You have ${dueQuestionIds.length} question${dueQuestionIds.length !== 1 ? 's' : ''} ready for review`
                    : "No questions due for review yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dueQuestionIds.length > 0 ? (
                  <>
                    <Alert>
                      <Calendar className="h-4 w-4" />
                      <AlertDescription>
                        Review up to 20 questions at a time. Questions will be rescheduled based on your performance.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={startReviewSession} size="lg" className="w-full">
                      Start Review ({Math.min(dueQuestionIds.length, 20)} Questions)
                    </Button>
                  </>
                ) : (
                  <>
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        Complete practice quizzes or mock exams to add questions to your review queue. 
                        Incorrect answers will be automatically scheduled for review.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Button onClick={() => navigate("/practice-quiz")} variant="outline" className="w-full">
                        Take Practice Quiz
                      </Button>
                      <Button onClick={() => navigate("/mock-exam")} variant="outline" className="w-full">
                        Take Mock Exam
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
