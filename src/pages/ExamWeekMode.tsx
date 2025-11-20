import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Target, TrendingUp, Calendar, AlertTriangle, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradeNudge } from "@/components/UpgradeNudge";

interface ExamWeekTask {
  id: string;
  title: string;
  type: "practice" | "review" | "flashcards" | "mock";
  target: number;
  completed: number;
  priority: "high" | "medium" | "low";
}

export default function ExamWeekMode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasFeature } = useFeatureAccess();
  const [isActive, setIsActive] = useState(false);
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null);
  const [tasks, setTasks] = useState<ExamWeekTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkExamWeekStatus();
    }
  }, [user]);

  const checkExamWeekStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("exam_session")
        .eq("user_id", user.id)
        .single();

      if (!profile?.exam_session) {
        setLoading(false);
        return;
      }

      const [month, year] = profile.exam_session.split(" ");
      const monthMap: Record<string, number> = {
        March: 2, June: 5, September: 8, December: 11
      };
      const examDate = new Date(parseInt(year), monthMap[month], 1);
      const daysLeft = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      setDaysUntilExam(daysLeft);
      setIsActive(daysLeft > 0 && daysLeft <= 14);

      if (daysLeft > 0 && daysLeft <= 14) {
        await generateExamWeekTasks(daysLeft);
      }
    } catch (error) {
      console.error("Error checking exam week status:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateExamWeekTasks = async (daysLeft: number) => {
    const { data: todaysSessions } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user?.id)
      .gte("session_date", new Date().toISOString().split("T")[0]);

    const questionsToday = todaysSessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;

    const dailyTarget = daysLeft <= 7 ? 50 : 30;

    const examTasks: ExamWeekTask[] = [
      {
        id: "daily-practice",
        title: "Daily Practice Questions",
        type: "practice",
        target: dailyTarget,
        completed: questionsToday,
        priority: "high",
      },
      {
        id: "weak-areas",
        title: "Review Weak Areas",
        type: "review",
        target: 20,
        completed: 0,
        priority: "high",
      },
      {
        id: "flashcards",
        title: "Flashcard Review",
        type: "flashcards",
        target: 30,
        completed: 0,
        priority: "medium",
      },
      {
        id: "mock-exam",
        title: daysLeft <= 3 ? "Final Mock Exam" : "Practice Mock",
        type: "mock",
        target: 1,
        completed: 0,
        priority: daysLeft <= 3 ? "high" : "medium",
      },
    ];

    setTasks(examTasks);
  };

  if (!hasFeature("examWeekMode")) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <UpgradeNudge
            type="exam-week-mode"
            message="Activate Exam Week Mode with intensive preparation features - Elite only"
            tier="elite"
            variant="banner"
          />
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isActive) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Exam Week Mode Not Active</h2>
              <p className="text-muted-foreground mb-4">
                {daysUntilExam === null
                  ? "Set your exam date in settings to activate this feature."
                  : daysUntilExam > 14
                  ? `Exam Week Mode activates 14 days before your exam. ${daysUntilExam} days remaining.`
                  : "Your exam has passed. Update your exam date in settings."}
              </p>
              <Button onClick={() => navigate("/settings")}>Go to Settings</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const overallProgress = tasks.reduce((sum, t) => sum + (t.completed / t.target) * 100, 0) / tasks.length;

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <Alert className="border-orange-500 bg-orange-50">
          <Zap className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>Exam Week Mode Active!</strong> You're {daysUntilExam} days away from your exam. 
            Complete your daily targets to maximize your preparation.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Until Exam</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{daysUntilExam}</div>
              <p className="text-xs text-muted-foreground">Stay focused!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overallProgress.toFixed(0)}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {tasks.filter(t => t.completed >= t.target).length} / {tasks.length}
              </div>
              <p className="text-xs text-muted-foreground">Today's goals</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Today's Intensive Tasks</h2>
          {tasks.map((task) => {
            const progress = (task.completed / task.target) * 100;
            const isComplete = task.completed >= task.target;

            return (
              <Card key={task.id} className={isComplete ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Target className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription>
                          {task.completed} / {task.target} {task.type === "mock" ? "completed" : "completed"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      task.priority === "high" 
                        ? "bg-red-100 text-red-700" 
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {task.priority.toUpperCase()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="mb-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {progress.toFixed(0)}% complete
                    </span>
                    {!isComplete && (
                      <Button
                        onClick={() => {
                          if (task.type === "practice") navigate("/study");
                          else if (task.type === "flashcards") navigate("/study");
                          else if (task.type === "mock") navigate("/mock-exam");
                          else if (task.type === "review") navigate("/analytics");
                        }}
                      >
                        Start Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
