import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { useTopicPerformance } from "@/hooks/useTopicPerformance";
import { useStudyPreferences } from "@/hooks/useStudyPreferences";
import { QuestionActions } from "@/components/QuestionActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Lock,
  Flame,
  Grid3x3,
  LineChart,
  Lightbulb
} from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeaturePaywallModal } from "@/components/FeaturePaywallModal";

interface Question {
  id: string;
  paper: string;
  unit_code: string | null;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string | null;
  answer?: string | null;
  type: string;
}

export default function SpacedRepetition() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    recordReview, 
    getDueReviews, 
    getReviewStats, 
    getTopicMastery,
    getStreakData 
  } = useSpacedRepetition();
  const { checkAndAwardBadges } = useBadgeChecker();
  const { hasFeature, isLoading: featureLoading } = useFeatureAccess();
  const { trackPerformance } = useTopicPerformance();

  // Feature access state
  const canAccessSRS = hasFeature("spacedRepetition");
  const [showPaywall, setShowPaywall] = useState(false);

  // Study preferences hook (with URL param support for AI Path)
  const {
    selectedPaper,
    setSelectedPaper,
    papers,
    loading: prefsLoading,
  } = useStudyPreferences();

  // Dashboard state
  const [stats, setStats] = useState<any>(null);
  const [topicMastery, setTopicMastery] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any>(null);
  const [dueQuestionIds, setDueQuestionIds] = useState<string[]>([]);
  const [selectedView, setSelectedView] = useState<"dashboard" | "review">("dashboard");

  // Review session state
  const [reviewStarted, setReviewStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [retrievalAnswer, setRetrievalAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; correct: boolean }>>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewMode, setReviewMode] = useState<"mcq" | "retrieval">("mcq");
  const [focusMode, setFocusMode] = useState(false);
  
  // No manual initialization needed - handled by useStudyPreferences hook

  useEffect(() => {
    if (selectedPaper) {
      loadDashboardData();
    }
  }, [selectedPaper]);

  const loadDashboardData = async () => {
    const reviewStats = await getReviewStats();
    const dueIds = await getDueReviews();
    const mastery = await getTopicMastery(selectedPaper);
    const streak = await getStreakData();
    
    setStats(reviewStats);
    setDueQuestionIds(dueIds);
    setTopicMastery(mastery);
    setStreakData(streak);
  };

  const startReviewSession = async (mode: "mcq" | "retrieval" = "mcq") => {
    if (dueQuestionIds.length === 0) {
      toast.error("No questions due for review");
      return;
    }

    setReviewMode(mode);

    try {
      // Fetch questions by IDs
      let query = supabase
        .from("sb_questions")
        .select("*")
        .in("id", dueQuestionIds)
        .eq("paper", selectedPaper);
      
      const { data, error } = await query.limit(20); // Review max 20 at a time

      if (error) throw error;

      const formattedQuestions = data?.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : []
      })) || [];

      setQuestions(formattedQuestions);
      setReviewStarted(true);
      setSelectedView("review");
      toast.success(`${mode === "retrieval" ? "Retrieval" : "MCQ"} review started!`);
    } catch (error) {
      console.error("Error starting review:", error);
      toast.error("Failed to start review session");
    }
  };

  const handleAnswerSubmit = async () => {
    if (reviewMode === "mcq" && selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    if (reviewMode === "retrieval" && !retrievalAnswer.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    const currentQuestion = questions[currentIndex];
    let isCorrect = false;

    if (reviewMode === "mcq") {
      isCorrect = selectedAnswer === currentQuestion.correct_option_index;
    } else {
      // For retrieval mode, we just show the answer and let user self-assess
      setShowFeedback(true);
      return;
    }
    
    // Record this answer
    const newAnswers = [...answers, {
      questionId: currentQuestion.id,
      correct: isCorrect
    }];
    setAnswers(newAnswers);

    // Track topic performance
    if (user) {
      trackPerformance(
        currentQuestion.paper,
        currentQuestion.unit_code,
        currentQuestion.unit_code || "General",
        isCorrect
      );
    }

    // Record in spaced repetition system
    await recordReview(currentQuestion.id, isCorrect);

    setShowFeedback(true);
  };

  const handleRetrievalSelfAssess = async (isCorrect: boolean) => {
    const currentQuestion = questions[currentIndex];
    
    const newAnswers = [...answers, {
      questionId: currentQuestion.id,
      correct: isCorrect
    }];
    setAnswers(newAnswers);

    await recordReview(currentQuestion.id, isCorrect);
    
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setRetrievalAnswer("");
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
    await loadDashboardData();
  };

  const getMasteryColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-500 hover:bg-green-600';
      case 'learning': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'struggling': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-muted hover:bg-muted/80';
    }
  };

  const getMasteryBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'mastered': return 'default';
      case 'learning': return 'secondary';
      case 'struggling': return 'destructive';
      default: return 'secondary';
    }
  };

  if (sessionComplete) {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = (correctCount / answers.length) * 100;

    return (
      <div className="container max-w-4xl mx-auto p-6">
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
                  Questions rescheduled based on performance. Keep your streak going!
                </p>
              </div>

              <div className="space-y-2">
                <Button onClick={() => {
                  setSessionComplete(false);
                  setReviewStarted(false);
                  setSelectedView("dashboard");
                  setAnswers([]);
                  setCurrentIndex(0);
                }} className="w-full">
                  Back to Dashboard
                </Button>
                <Button onClick={() => navigate("/question-analytics")} variant="outline" className="w-full">
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    );
  }

  // Show locked preview for free users
  if (!featureLoading && !canAccessSRS) {
    return (
      <>
        <div className="container max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-sm bg-background/80 flex items-center justify-center z-10">
                  <div className="text-center space-y-4 p-8 max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Adaptive Mastery System</h3>
                    <p className="text-muted-foreground">
                      Master every topic with color-coded mastery tracking, retrieval practice, forgetting curve visualization, and daily streak targets.
                    </p>
                    <Button 
                      onClick={() => setShowPaywall(true)}
                      size="lg"
                      className="w-full"
                    >
                      Unlock with Pro
                    </Button>
                  </div>
                </div>

                {/* Blurred preview content */}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    Adaptive Mastery System
                  </CardTitle>
                  <CardDescription>
                    Track mastery, build streaks, and master every topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 opacity-40">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-sm text-muted-foreground">Due Today</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-3xl font-bold">87%</div>
                        <p className="text-sm text-muted-foreground">Avg Mastery</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-3xl font-bold flex items-center gap-1">
                          <Flame className="w-6 h-6 text-orange-500" />7
                        </div>
                        <p className="text-sm text-muted-foreground">Day Streak</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-3xl font-bold">8/10</div>
                        <p className="text-sm text-muted-foreground">Daily Target</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>

        <FeaturePaywallModal
          open={showPaywall} 
          onOpenChange={setShowPaywall}
          paywallType="spaced-repetition"
        />
      </>
    );
  }

  if (reviewStarted && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>
                  Question {currentIndex + 1} of {questions.length}
                </CardTitle>
                <Badge variant="outline">
                  {reviewMode === "retrieval" ? "Retrieval Practice" : "MCQ Mode"}
                </Badge>
              </div>
              <Progress value={progressPercent} className="mb-4" />
              {currentQuestion.unit_code && (
                <Badge className="mb-2">{currentQuestion.unit_code}</Badge>
              )}
              <CardDescription className="text-base">
                {currentQuestion.question}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviewMode === "mcq" ? (
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
              ) : (
                <div className="space-y-4">
                  {!showFeedback ? (
                    <>
                      <div className="space-y-2">
                        <Label>Your Answer</Label>
                        <Textarea
                          placeholder="Type your answer here..."
                          value={retrievalAnswer}
                          onChange={(e) => setRetrievalAnswer(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          Try to recall from memory without looking at options.
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Your Answer:</Label>
                        <div className="p-4 bg-muted rounded-lg">
                          {retrievalAnswer || "(No answer provided)"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Correct Answer:</Label>
                        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-500 rounded-lg">
                          {currentQuestion.options[currentQuestion.correct_option_index]}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleRetrievalSelfAssess(false)} 
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Incorrect
                        </Button>
                        <Button 
                          onClick={() => handleRetrievalSelfAssess(true)}
                          className="flex-1"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Correct
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {showFeedback && currentQuestion.explanation && reviewMode === "mcq" && (
                <Alert>
                  <AlertDescription>
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </AlertDescription>
                </Alert>
              )}

              {showFeedback && reviewMode === "mcq" && (
                <QuestionActions
                  questionId={currentQuestion.id}
                  sourceType="spaced_repetition"
                  question={currentQuestion.question}
                  options={currentQuestion.options}
                  correctAnswer={currentQuestion.correct_option_index}
                  userAnswer={selectedAnswer}
                  explanation={currentQuestion.explanation}
                />
              )}

              {reviewMode === "mcq" && (
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
              )}

              {reviewMode === "retrieval" && !showFeedback && (
                <div className="flex justify-end">
                  <Button onClick={handleAnswerSubmit}>Show Answer</Button>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <>
      <div className={`container max-w-4xl mx-auto p-6 ${focusMode ? "bg-black" : ""}`}>
        <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-6 h-6" />
                      Adaptive Mastery System
                    </CardTitle>
                    <CardDescription>
                      Track mastery, build streaks, and master every topic
                    </CardDescription>
                  </div>
                  <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {papers.map((paper) => (
                        <SelectItem key={paper.id} value={paper.paper_code}>
                          {paper.paper_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            <Tabs value={selectedView} onValueChange={(v: any) => setSelectedView(v)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Mastery Dashboard
                </TabsTrigger>
                <TabsTrigger value="review">
                  <Target className="w-4 h-4 mr-2" />
                  Start Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                {/* Quick Stats */}
                {stats && streakData && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Due Today
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">{stats.dueCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ready to review</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Avg Mastery
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{stats.avgAccuracy}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all topics</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          Streak
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-1">
                          {streakData.currentStreak}
                          <span className="text-lg text-muted-foreground">days</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Daily Target</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {streakData.reviewedToday}/{streakData.dailyTarget}
                        </div>
                        <Progress 
                          value={(streakData.reviewedToday / streakData.dailyTarget) * 100} 
                          className="mt-2 h-2"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Topic Mastery Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3x3 className="w-5 h-5" />
                      Topic Mastery Grid
                    </CardTitle>
                    <CardDescription>
                      Color-coded by mastery level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-red-500" />
                          <span>Struggling (&lt;40%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-yellow-500" />
                          <span>Learning (40-70%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-500" />
                          <span>Mastered (&gt;70%)</span>
                        </div>
                      </div>

                      {topicMastery.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {topicMastery.map((topic) => (
                            <button
                              key={topic.unitCode}
                              className={`p-4 rounded-lg text-white transition-all hover:scale-105 ${getMasteryColor(topic.status)}`}
                            >
                              <div className="text-sm font-medium mb-1 truncate">
                                {topic.unitCode}
                              </div>
                              <div className="text-2xl font-bold">{topic.mastery}%</div>
                              <div className="text-xs opacity-90 mt-1">
                                {topic.dueCount > 0 ? `${topic.dueCount} due` : 'Up to date'}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Start reviewing questions to see mastery data</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Forgetting Curve Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Your Learning Curve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Questions are scheduled using the SM-2 algorithm. Review intervals increase with mastery:
                      </p>
                      <div className="grid md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 border rounded-lg">
                          <div className="font-bold text-lg">1 day</div>
                          <div className="text-xs text-muted-foreground">First review</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-bold text-lg">6 days</div>
                          <div className="text-xs text-muted-foreground">Second review</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-bold text-lg">2-4 weeks</div>
                          <div className="text-xs text-muted-foreground">Well-known</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-bold text-lg">1-3 months</div>
                          <div className="text-xs text-muted-foreground">Mastered</div>
                        </div>
                      </div>
                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          Incorrect answers reset intervals. Consistent reviews build long-term memory.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="review" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Review Mode</CardTitle>
                    <CardDescription>
                      Select how you want to review your due questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats && (
                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          You have <strong>{stats.dueCount}</strong> questions due for review
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => startReviewSession("mcq")}>
                        <CardHeader>
                          <CardTitle className="text-lg">MCQ Mode</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Answer multiple choice questions with instant feedback
                          </p>
                          <Button className="w-full" disabled={!stats || stats.dueCount === 0}>
                            Start MCQ Review
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => startReviewSession("retrieval")}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Retrieval Practice
                            <Badge variant="secondary">Advanced</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Recall answers from memory for deeper learning
                          </p>
                          <Button className="w-full" disabled={!stats || stats.dueCount === 0}>
                            Start Retrieval Practice
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {(!stats || stats.dueCount === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No questions due for review right now!</p>
                        <p className="text-sm mt-2">Complete practice quizzes to add more questions to your review queue.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
    </>
  );
}