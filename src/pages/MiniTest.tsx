import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface Question {
  id: string;
  paper: string;
  unit_code: string | null;
  type: string;
  difficulty: string | null;
  question: string;
  options: any[];
  correct_option_index: number;
  explanation: string | null;
}

interface QuestionLog {
  question_id: string;
  unit_code: string | null;
  difficulty: string | null;
  correct: boolean;
  time_spent: number;
}

export default function MiniTest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTimes, setStartTimes] = useState<number[]>([]);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (testStarted && currentIndex < questions.length) {
      const newStartTimes = [...startTimes];
      newStartTimes[currentIndex] = Date.now();
      setStartTimes(newStartTimes);
    }
  }, [currentIndex, testStarted]);

  const startTest = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("content-batch", {
        body: { 
          paper: "BT", 
          type: "mcq",
          size: 10 
        },
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("No questions available");
        return;
      }

      setQuestions(data);
      setAnswers(new Array(data.length).fill(null));
      setStartTimes(new Array(data.length).fill(0));
      setTestStarted(true);
      toast.success("Mini test started!");
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error("Failed to load questions");
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (answers.some(a => a === null)) {
      const confirm = window.confirm("You have unanswered questions. Submit anyway?");
      if (!confirm) return;
    }

    try {
      // Calculate results
      let correctCount = 0;
      const rawLog: QuestionLog[] = [];

      questions.forEach((q, idx) => {
        const correct = answers[idx] === q.correct_option_index;
        if (correct) correctCount++;

        const timeSpent = startTimes[idx] ? Math.floor((Date.now() - startTimes[idx]) / 1000) : 0;
        
        rawLog.push({
          question_id: q.id,
          unit_code: q.unit_code,
          difficulty: q.difficulty,
          correct,
          time_spent: timeSpent,
        });
      });

      // Log session
      const { error: sessionError } = await supabase.functions.invoke("sessions-log", {
        body: {
          session_type: "mini_test",
          total_questions: questions.length,
          correct_answers: correctCount,
          raw_log: rawLog,
        },
      });

      if (sessionError) throw sessionError;

      // Fetch analytics
      const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke("analytics-summary");
      
      setResults({
        score: ((correctCount / questions.length) * 100).toFixed(1),
        correctCount,
        totalQuestions: questions.length,
        analytics: analyticsData || null,
        rawLog,
      });

      setTestSubmitted(true);
      toast.success("Mini test completed!");
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test");
    }
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pt-20 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Please log in</CardTitle>
              <CardDescription>You must be logged in to take a mini test</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  if (testSubmitted && results) {
    const unitBreakdown = results.rawLog.reduce((acc: any, log: QuestionLog) => {
      const unit = log.unit_code || "Unknown";
      if (!acc[unit]) {
        acc[unit] = { correct: 0, total: 0 };
      }
      acc[unit].total++;
      if (log.correct) acc[unit].correct++;
      return acc;
    }, {});

    const weakestUnit = Object.entries(unitBreakdown)
      .map(([unit, stats]: [string, any]) => ({
        unit,
        accuracy: (stats.correct / stats.total) * 100,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)[0];

    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pt-20 px-4 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Mini Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {results.score}%
                  </div>
                  <p className="text-muted-foreground">
                    {results.correctCount} / {results.totalQuestions} correct
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Accuracy by Unit</h3>
                  {Object.entries(unitBreakdown).map(([unit, stats]: [string, any]) => (
                    <div key={unit} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{unit}</span>
                        <span>{stats.correct}/{stats.total} ({((stats.correct / stats.total) * 100).toFixed(0)}%)</span>
                      </div>
                      <Progress value={(stats.correct / stats.total) * 100} />
                    </div>
                  ))}
                </div>

                {weakestUnit && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Recommendation</h4>
                        <p className="text-sm text-muted-foreground">
                          Focus on {weakestUnit.unit} (accuracy: {weakestUnit.accuracy.toFixed(0)}%). 
                          Review your notes and practice more questions in this area.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={() => navigate("/analytics")} variant="outline" className="flex-1">
                    View Full Analytics
                  </Button>
                  <Button onClick={() => window.location.reload()} className="flex-1">
                    Take Another Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (!testStarted) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pt-20 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Mini Test - BT</CardTitle>
              <CardDescription>Quick 10-question practice test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Test Format:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>10 multiple choice questions</li>
                  <li>Mixed difficulty levels</li>
                  <li>Navigate between questions freely</li>
                  <li>Review your performance by unit</li>
                </ul>
              </div>

              <Button onClick={startTest} className="w-full" size="lg">
                Start Mini Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {currentIndex + 1} of {questions.length}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{currentQuestion.unit_code}</span>
                </div>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-lg font-medium">{currentQuestion.question}</p>
              </div>

              <RadioGroup
                value={answers[currentIndex]?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between gap-4 pt-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                
                {currentIndex === questions.length - 1 ? (
                  <Button onClick={handleSubmitTest} className="ml-auto">
                    Submit Test
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="ml-auto">
                    Next
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
