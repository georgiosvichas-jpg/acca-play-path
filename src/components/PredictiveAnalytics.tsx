import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PredictiveInsight {
  weakAreas: string[];
  strongAreas: string[];
  recommendedFocus: string[];
  projectedImprovement: number;
  studyStreakImpact: number;
}

export function PredictiveAnalytics() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<PredictiveInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user]);

  const generateInsights = async () => {
    if (!user) return;

    try {
      const { data: sessions, error } = await supabase
        .from("sb_study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .not("raw_log", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const unitPerformance: Record<string, { correct: number; total: number }> = {};
      let totalAccuracy = 0;
      let sessionCount = 0;

      sessions?.forEach((session) => {
        if (session.raw_log && Array.isArray(session.raw_log)) {
          session.raw_log.forEach((entry: any) => {
            const unit = entry.unit_code || "Unknown";
            if (!unitPerformance[unit]) {
              unitPerformance[unit] = { correct: 0, total: 0 };
            }
            unitPerformance[unit].total++;
            if (entry.correct) unitPerformance[unit].correct++;
          });
        }
        if (session.total_questions && session.total_questions > 0) {
          totalAccuracy += (session.correct_answers || 0) / session.total_questions;
          sessionCount++;
        }
      });

      const avgAccuracy = sessionCount > 0 ? (totalAccuracy / sessionCount) * 100 : 0;

      const sortedUnits = Object.entries(unitPerformance)
        .map(([unit, stats]) => ({
          unit,
          accuracy: (stats.correct / stats.total) * 100,
          total: stats.total,
        }))
        .sort((a, b) => a.accuracy - b.accuracy);

      const weakAreas = sortedUnits.slice(0, 3).map((u) => u.unit);
      const strongAreas = sortedUnits.slice(-3).reverse().map((u) => u.unit);
      const recommendedFocus = sortedUnits
        .filter((u) => u.accuracy < 70 && u.total > 5)
        .slice(0, 3)
        .map((u) => u.unit);

      const projectedImprovement = Math.min(
        15,
        Math.max(5, 20 - avgAccuracy / 5)
      );

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("study_streak")
        .eq("user_id", user.id)
        .single();

      const studyStreakImpact = profile?.study_streak 
        ? Math.min(10, profile.study_streak * 0.5)
        : 0;

      setInsights({
        weakAreas,
        strongAreas,
        recommendedFocus,
        projectedImprovement,
        studyStreakImpact,
      });
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Analyzing your performance...
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Not enough data to generate predictions. Keep studying!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Predictive Insights
          </CardTitle>
          <CardDescription>AI-powered predictions based on your study patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Projected Improvement</div>
              <div className="text-3xl font-bold text-primary">
                +{insights.projectedImprovement.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expected accuracy increase in next 2 weeks
              </p>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Study Streak Impact</div>
              <div className="text-3xl font-bold text-green-600">
                +{insights.studyStreakImpact.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Performance boost from consistency
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Areas Needing Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.recommendedFocus.length > 0 ? (
            <div className="space-y-3">
              {insights.recommendedFocus.map((area, idx) => (
                <Alert key={idx} variant="destructive">
                  <AlertDescription>
                    <strong>{area}</strong> - Practice 15-20 more questions to improve
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Great job! All areas are performing well. Keep up the consistency.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Target className="h-5 w-5" />
              Weak Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.weakAreas.map((area, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.strongAreas.map((area, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
