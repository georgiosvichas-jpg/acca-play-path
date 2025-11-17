import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, AlertCircle, CheckCircle2, XCircle, Trophy } from "lucide-react";

interface Question {
  id: string;
  paper: string;
  unit_code: string | null;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string | null;
}

export default function MockExam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkAndAwardBadges } = useBadgeChecker();
  const { recordBatchReviews } = useSpacedRepetition();

  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(7200); // 2 hours in seconds
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);

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

    try {
      // Fetch 50 random BT questions
      const { data, error } = await supabase
        .from("sb_questions")
        .select("*")
        .eq("paper", "BT")
        .limit(1000);

      if (error) throw error;

      // Randomly select 50 questions
      const shuffled = data?.sort(() => Math.random() - 0.5).slice(0, 50) || [];
      setQuestions(shuffled.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : []
      })));
      setAnswers(new Array(50).fill(null));
      setExamStarted(true);
      toast.success("Mock exam started! Good luck!");
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
    try {
      // Calculate results
      let correctCount = 0;
      const rawLog: any[] = [];

      questions.forEach((q, idx) => {
        const isCorrect = answers[idx] === q.correct_option_index;
        if (isCorrect) correctCount++;

        rawLog.push({
          question_id: q.id,
          unit: q.unit_code,
          user_answer: answers[idx],
          correct_answer: q.correct_option_index,
          is_correct: isCorrect,
        });
      });

      const accuracy = (correctCount / 50) * 100;

      // Log session
      if (user) {
        await supabase.from("sb_study_sessions").insert({
          user_id: user.id,
          session_type: "mock_exam",
          total_questions: 50,
          correct_answers: correctCount,
          raw_log: rawLog,
        });

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
        total: 50,
        accuracy: accuracy.toFixed(1),
        passed: accuracy >= 50,
      });
      setExamSubmitted(true);
      
      toast.success(`Exam completed! Score: ${correctCount}/50 (${accuracy.toFixed(1)}%)`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    }
  };

  if (!examStarted) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  ACCA BT Mock Exam
                </CardTitle>
                <CardDescription>
                  Simulated exam under real ACCA conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Exam Rules:</strong>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>50 multiple choice questions</li>
                      <li>2 hours time limit (120 minutes)</li>
                      <li>Once started, the timer cannot be paused</li>
                      <li>You can navigate between questions freely</li>
                      <li>Exam will auto-submit when time expires</li>
                      <li>Pass mark: 50% (25/50 questions)</li>
                      <li>All questions carry equal marks</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">What to expect:</h3>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Questions cover all BT units</li>
                    <li>Mixed difficulty levels</li>
                    <li>Realistic exam format</li>
                    <li>Detailed results after submission</li>
                  </ul>
                </div>

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
                  disabled={!agreedToRules}
                  size="lg"
                  className="w-full"
                >
                  Start Mock Exam
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (examSubmitted && results) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Exam Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold ${results.passed ? "text-green-600" : "text-red-600"}`}>
                    {results.accuracy}%
                  </div>
                  <div className="text-2xl font-semibold">
                    {results.correct} / {results.total} Correct
                  </div>
                  <div className={`text-lg font-medium ${results.passed ? "text-green-600" : "text-red-600"}`}>
                    {results.passed ? "✓ PASSED" : "✗ FAILED"}
                  </div>
                  {results.passed && (
                    <p className="text-muted-foreground">
                      Congratulations! You've met the pass standard of 50%.
                    </p>
                  )}
                  {!results.passed && (
                    <p className="text-muted-foreground">
                      Keep practicing! You need 50% to pass the exam.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button onClick={() => navigate("/question-analytics")} className="w-full">
                    View Detailed Analytics
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
          </div>
        </div>
      </>
    );
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercent = (answeredCount / 50) * 100;

  return (
    <>
      <Navigation />
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
              <span className="text-sm text-muted-foreground">
                Answered: {answeredCount}/50
              </span>
              <Button onClick={handleSubmitExam} variant="default">
                Submit Exam
              </Button>
            </div>
          </div>
          <Progress value={progressPercent} className="h-1" />
        </div>

        {/* Questions */}
        <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <Card key={q.id} id={`question-${idx}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {idx + 1} of 50
                    {q.unit_code && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({q.unit_code})
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base">{q.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[idx]?.toString() || ""}
                    onValueChange={(value) => handleAnswerSelect(idx, parseInt(value))}
                  >
                    {q.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem value={optIdx.toString()} id={`q${idx}-opt${optIdx}`} />
                        <Label
                          htmlFor={`q${idx}-opt${optIdx}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button onClick={handleSubmitExam} size="lg" className="w-full max-w-md">
              Submit Exam ({answeredCount}/50 answered)
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
