import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { TrendingUp, Target, Calendar, Award } from "lucide-react";

interface AnalyticsSummary {
  questions_answered: number;
  overall_accuracy: number;
  accuracy_by_unit: Array<{ unit_code: string; accuracy: number; total: number }>;
  accuracy_by_difficulty: Array<{ difficulty: string; accuracy: number; total: number }>;
  last_activity_date: string | null;
  exam_date: string | null;
  total_sessions: number;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { planType } = useSubscription();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const isPremium = planType === "pro" || planType === "elite";

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.functions.invoke("analytics-summary", {
          body: { userId: user.id },
        });

        if (error) throw error;
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading your progress...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No progress data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground mt-2">Track your study journey</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.questions_answered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overall_accuracy.toFixed(1)}%</div>
            <Progress value={analytics.overall_accuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_sessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.last_activity_date
                ? new Date(analytics.last_activity_date).toLocaleDateString()
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy by Unit */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Unit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.accuracy_by_unit.length > 0 ? (
            analytics.accuracy_by_unit
              .sort((a, b) => a.unit_code.localeCompare(b.unit_code))
              .map((unit) => (
                <div key={unit.unit_code} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{unit.unit_code}</span>
                    <span className="text-sm text-muted-foreground">
                      {unit.accuracy.toFixed(1)}% ({unit.total} questions)
                    </span>
                  </div>
                  <Progress value={unit.accuracy} />
                </div>
              ))
          ) : (
            <p className="text-muted-foreground">No unit data available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Accuracy by Difficulty - Premium Only */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.accuracy_by_difficulty.length > 0 ? (
              analytics.accuracy_by_difficulty
                .sort((a, b) => {
                  const order = { easy: 0, medium: 1, hard: 2 };
                  return order[a.difficulty as keyof typeof order] - order[b.difficulty as keyof typeof order];
                })
                .map((diff) => (
                  <div key={diff.difficulty} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{diff.difficulty}</span>
                      <span className="text-sm text-muted-foreground">
                        {diff.accuracy.toFixed(1)}% ({diff.total} questions)
                      </span>
                    </div>
                    <Progress value={diff.accuracy} />
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground">No difficulty data available yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {!isPremium && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-2">Unlock Premium Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Premium to see detailed performance breakdowns by difficulty, trends over
              time, and personalized insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}