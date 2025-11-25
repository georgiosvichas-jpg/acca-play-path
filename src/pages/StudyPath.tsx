import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Target, Loader2, CheckCircle2, Clock, BookOpen, AlertCircle, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { FeaturePaywallModal } from "@/components/FeaturePaywallModal";

interface DailyTask {
  day: string;
  tasks: string[];
  estimatedHours: number;
}

interface Week {
  weekNumber: number;
  title: string;
  focus: string;
  goals: string[];
  dailyTasks: DailyTask[];
}

interface StudyPath {
  title: string;
  description: string;
  weeks: Week[];
  tips: string[];
}

interface SavedPath {
  id: string;
  exam_date: string;
  weeks_duration: number;
  path_data: StudyPath;
  progress: Record<string, boolean>;
}

export default function StudyPath() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasFeature, planType, isLoading: featureLoading } = useFeatureAccess();
  
  const [loading, setLoading] = useState(false);
  const [savedPath, setSavedPath] = useState<SavedPath | null>(null);
  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Form state
  const [examDate, setExamDate] = useState("");
  const [weeksAvailable, setWeeksAvailable] = useState(8);
  const [error, setError] = useState<string | null>(null);

  const canAccessFullStudyPlan = hasFeature("studyPlanDays") && planType !== "free";

  useEffect(() => {
    if (user) {
      fetchSavedPath();
    }
  }, [user]);

  const fetchSavedPath = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_paths')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSavedPath(data as unknown as SavedPath);
        setStudyPath(data.path_data as unknown as StudyPath);
        setProgress((data.progress as unknown as Record<string, boolean>) || {});
      }
    } catch (err) {
      console.error("Error fetching saved path:", err);
    }
  };

  const generatePath = async () => {
    if (!examDate || weeksAvailable < 1) {
      toast.error("Please enter exam date and weeks available");
      return;
    }

    // Check if free user trying to generate plan beyond 1 week
    if (planType === "free" && weeksAvailable > 1) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-study-path', {
        body: { examDate, weeksAvailable }
      });

      if (functionError) throw functionError;

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }

      setStudyPath(data.studyPath);
      setSavedPath({
        id: data.savedPathId,
        exam_date: examDate,
        weeks_duration: weeksAvailable,
        path_data: data.studyPath,
        progress: {}
      });
      setProgress({});
      toast.success("Study path generated successfully!");
    } catch (err) {
      console.error("Error generating study path:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to generate study path";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const newProgress = { ...progress, [taskId]: !progress[taskId] };
    setProgress(newProgress);

    if (savedPath?.id) {
      try {
        await supabase
          .from('study_paths')
          .update({ progress: newProgress })
          .eq('id', savedPath.id);
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    }
  };

  const calculateProgress = () => {
    if (!studyPath) return 0;
    
    const totalTasks = studyPath.weeks.reduce((sum, week) => 
      sum + week.dailyTasks.reduce((daySum, day) => daySum + day.tasks.length, 0), 0
    );
    
    const completedTasks = Object.values(progress).filter(Boolean).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  if (!studyPath) {
    return (
      <>
        <div className="container max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle>AI Study Path Generator</CardTitle>
              </div>
              <CardDescription>
                Get a personalized multi-week study plan tailored to your exam date and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {planType === "free" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Free Plan:</strong> Generate a 1-week preview study plan. Upgrade to Pro for unlimited weeks.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Exam Date</Label>
                  <Input 
                    type="date" 
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weeks Available for Study</Label>
                  <Input 
                    type="number" 
                    value={weeksAvailable}
                    onChange={(e) => setWeeksAvailable(parseInt(e.target.value))}
                    min={1}
                    max={planType === "free" ? 1 : 24}
                  />
                  {planType === "free" ? (
                    <p className="text-xs text-muted-foreground">
                      Free plan limited to 1-week preview. Upgrade to Pro for full plans.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Recommended: 8-12 weeks for comprehensive preparation
                    </p>
                  )}
                </div>
              </div>

              <Button onClick={generatePath} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Personalized Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {planType === "free" && weeksAvailable > 1 ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Upgrade to Generate
                      </>
                    ) : (
                      "Generate Study Path"
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        <FeaturePaywallModal 
          open={showPaywall} 
          onOpenChange={setShowPaywall}
          paywallType="study-path"
        />
      </>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{studyPath.title}</h1>
          <p className="text-muted-foreground">{studyPath.description}</p>
        </div>
        <Button variant="outline" onClick={() => { setStudyPath(null); setSavedPath(null); }}>
          Create New Path
        </Button>
      </div>

      {savedPath && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Exam: {new Date(savedPath.exam_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{savedPath.weeks_duration} weeks</span>
                </div>
              </div>
              <span className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="week-1" className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          {studyPath.weeks.map((week) => (
            <TabsTrigger key={week.weekNumber} value={`week-${week.weekNumber}`}>
              Week {week.weekNumber}
            </TabsTrigger>
          ))}
          <TabsTrigger value="tips">
            <Target className="h-4 w-4 mr-2" />
            Tips
          </TabsTrigger>
        </TabsList>

        {studyPath.weeks.map((week) => (
          <TabsContent key={week.weekNumber} value={`week-${week.weekNumber}`} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{week.title}</CardTitle>
                    <CardDescription>Focus: {week.focus}</CardDescription>
                  </div>
                  <Badge>Week {week.weekNumber}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Weekly Goals</h3>
                  <ul className="space-y-2">
                    {week.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Daily Schedule</h3>
                  {week.dailyTasks.map((day, dayIdx) => {
                    const dayTasksCompleted = day.tasks.filter((_, taskIdx) => 
                      progress[`w${week.weekNumber}-d${dayIdx}-t${taskIdx}`]
                    ).length;
                    const dayProgress = (dayTasksCompleted / day.tasks.length) * 100;

                    return (
                      <Card key={dayIdx}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{day.day}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {day.estimatedHours}h
                              </span>
                            </div>
                          </div>
                          <Progress value={dayProgress} className="h-1" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {day.tasks.map((task, taskIdx) => {
                              const taskId = `w${week.weekNumber}-d${dayIdx}-t${taskIdx}`;
                              return (
                                <div key={taskIdx} className="flex items-start gap-3">
                                  <Checkbox 
                                    checked={progress[taskId] || false}
                                    onCheckedChange={() => toggleTask(taskId)}
                                    className="mt-1"
                                  />
                                  <span className={`text-sm ${progress[taskId] ? 'line-through text-muted-foreground' : ''}`}>
                                    {task}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="tips">
          <Card>
            <CardHeader>
              <CardTitle>Study Tips & Advice</CardTitle>
              <CardDescription>Expert recommendations for exam success</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {studyPath.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
