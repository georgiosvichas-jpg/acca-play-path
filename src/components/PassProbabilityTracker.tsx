import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Calendar, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PassProbability {
  probability: number;
  confidence: string;
  daysUntilExam: number | null;
  recommendedDailyQuestions: number;
  currentTrajectory: "on-track" | "needs-improvement" | "excellent";
}

export function PassProbabilityTracker() {
  const { user } = useAuth();
  const [passProbability, setPassProbability] = useState<PassProbability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateProbability();
    }
  }, [user]);

  const calculateProbability = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("exam_session, study_streak, total_xp")
        .eq("user_id", user.id)
        .single();

      const { data: sessions, error } = await supabase
        .from("sb_study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .not("raw_log", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      let totalQuestions = 0;
      let correctAnswers = 0;
      let recentSessions = 0;

      sessions?.forEach((session) => {
        totalQuestions += session.total_questions || 0;
        correctAnswers += session.correct_answers || 0;
        recentSessions++;
      });

      const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      let examDate: Date | null = null;
      if (profile?.exam_session) {
        const [month, year] = profile.exam_session.split(" ");
        const monthMap: Record<string, number> = {
          March: 2, June: 5, September: 8, December: 11
        };
        examDate = new Date(parseInt(year), monthMap[month], 1);
      }

      const daysUntilExam = examDate 
        ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      const studyStreakBonus = Math.min(15, (profile?.study_streak || 0) * 1.5);
      const volumeBonus = Math.min(10, totalQuestions / 50);
      const consistencyBonus = recentSessions >= 10 ? 5 : 0;

      let baseProbability = overallAccuracy * 0.7;
      baseProbability += studyStreakBonus;
      baseProbability += volumeBonus;
      baseProbability += consistencyBonus;

      if (daysUntilExam && daysUntilExam < 30) {
        baseProbability *= 0.9;
      }

      const probability = Math.min(95, Math.max(10, baseProbability));

      let confidence: string;
      if (totalQuestions > 200) confidence = "High";
      else if (totalQuestions > 100) confidence = "Medium";
      else confidence = "Low";

      let trajectory: "on-track" | "needs-improvement" | "excellent";
      if (probability >= 70) trajectory = "excellent";
      else if (probability >= 50) trajectory = "on-track";
      else trajectory = "needs-improvement";

      const recommendedDailyQuestions = trajectory === "needs-improvement" ? 50 : 30;

      setPassProbability({
        probability,
        confidence,
        daysUntilExam,
        recommendedDailyQuestions,
        currentTrajectory: trajectory,
      });
    } catch (error) {
      console.error("Error calculating pass probability:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Calculating pass probability...
        </CardContent>
      </Card>
    );
  }

  if (!passProbability) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Not enough data. Complete more practice sessions to see your pass probability.
        </CardContent>
      </Card>
    );
  }

  const getColorClass = () => {
    if (passProbability.probability >= 70) return "text-green-600";
    if (passProbability.probability >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrajectoryMessage = () => {
    switch (passProbability.currentTrajectory) {
      case "excellent":
        return "You're on an excellent trajectory! Keep up the great work.";
      case "on-track":
        return "You're on track. Maintain consistency to improve your chances.";
      case "needs-improvement":
        return "More practice needed. Focus on weak areas to boost your probability.";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Pass Probability
          </CardTitle>
          <CardDescription>AI-calculated likelihood of passing based on your performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getColorClass()}`}>
              {passProbability.probability.toFixed(0)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Confidence: {passProbability.confidence}
            </p>
            <Progress value={passProbability.probability} className="mt-4" />
          </div>

          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>{getTrajectoryMessage()}</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {passProbability.daysUntilExam && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm font-medium">Days Until Exam</div>
                  </div>
                  <div className="text-2xl font-bold">{passProbability.daysUntilExam}</div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Daily Goal</div>
                </div>
                <div className="text-2xl font-bold">
                  {passProbability.recommendedDailyQuestions} questions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Status</div>
                </div>
                <div className="text-2xl font-bold capitalize">
                  {passProbability.currentTrajectory.replace("-", " ")}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
