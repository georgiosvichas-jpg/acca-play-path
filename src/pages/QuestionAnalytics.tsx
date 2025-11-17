import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Target, TrendingUp, Award } from "lucide-react";
import { StudyRecommendations } from "@/components/StudyRecommendations";
import { UpgradeNudge } from "@/components/UpgradeNudge";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface AnalyticsData {
  totalQuestions: number;
  overallAccuracy: number;
  byUnit: Record<string, { correct: number; total: number; accuracy: number }>;
  byDifficulty: Record<string, { correct: number; total: number; accuracy: number }>;
}

export default function QuestionAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch all sessions for this user
      const { data: sessions, error } = await supabase
        .from("sb_study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .not("raw_log", "is", null);

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        setAnalytics({
          totalQuestions: 0,
          overallAccuracy: 0,
          byUnit: {},
          byDifficulty: {}
        });
        setLoading(false);
        return;
      }

      // Aggregate data
      let totalQuestions = 0;
      let totalCorrect = 0;
      const byUnit: Record<string, { correct: number; total: number; accuracy: number }> = {};
      const byDifficulty: Record<string, { correct: number; total: number; accuracy: number }> = {};

      sessions.forEach(session => {
        totalQuestions += session.total_questions || 0;
        totalCorrect += session.correct_answers || 0;

        if (session.raw_log && Array.isArray(session.raw_log)) {
          session.raw_log.forEach((entry: any) => {
            // By unit
            const unit = entry.unit_code || "Unknown";
            if (!byUnit[unit]) byUnit[unit] = { correct: 0, total: 0, accuracy: 0 };
            byUnit[unit].total++;
            if (entry.correct) byUnit[unit].correct++;

            // By difficulty
            const diff = entry.difficulty || "Unknown";
            if (!byDifficulty[diff]) byDifficulty[diff] = { correct: 0, total: 0, accuracy: 0 };
            byDifficulty[diff].total++;
            if (entry.correct) byDifficulty[diff].correct++;
          });
        }
      });

      // Calculate accuracies
      Object.keys(byUnit).forEach(unit => {
        byUnit[unit].accuracy = (byUnit[unit].correct / byUnit[unit].total) * 100;
      });

      Object.keys(byDifficulty).forEach(diff => {
        byDifficulty[diff].accuracy = (byDifficulty[diff].correct / byDifficulty[diff].total) * 100;
      });

      setAnalytics({
        totalQuestions,
        overallAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
        byUnit,
        byDifficulty
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-muted-foreground">No analytics data available</div>
      </div>
    );
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "hard": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Question Analytics</h1>
        <p className="text-muted-foreground">Track your progress and performance</p>
      </div>

      {/* AI Study Recommendations */}
      {analytics && analytics.totalQuestions > 0 && <StudyRecommendations />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Attempted so far</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overallAccuracy.toFixed(1)}%</div>
            <Progress value={analytics.overallAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overallAccuracy >= 80 ? "Excellent" : analytics.overallAccuracy >= 60 ? "Good" : "Keep Practicing"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.overallAccuracy >= 80 ? "Keep up the great work!" : "You're making progress!"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accuracy by Unit</CardTitle>
          <CardDescription>Performance breakdown by study unit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(analytics.byUnit).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available yet. Start practicing to see your progress!</p>
          ) : (
            Object.entries(analytics.byUnit)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([unit, stats]) => (
                <div key={unit} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-medium">{unit}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.correct} / {stats.total} correct
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress value={stats.accuracy} />
                </div>
              ))
          )}
        </CardContent>
      </Card>

      <UpgradeNudge
        type="weak-areas"
        message="Fix these topics twice as fast – spaced repetition in Pro."
        tier="pro"
        variant="inline"
      />

      <Card>
        <CardHeader>
          <CardTitle>Accuracy by Difficulty</CardTitle>
          <CardDescription>How you perform across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(analytics.byDifficulty).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available yet. Start practicing to see your progress!</p>
          ) : (
            ["easy", "medium", "hard"].map((diff) => {
              const stats = analytics.byDifficulty[diff];
              if (!stats) return null;
              
              return (
                <div key={diff} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className={`font-medium capitalize ${getDifficultyColor(diff)}`}>
                        {diff}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.correct} / {stats.total} correct
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress value={stats.accuracy} />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
