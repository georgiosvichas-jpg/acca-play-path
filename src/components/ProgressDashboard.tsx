import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Target, Zap, Calendar, Award } from "lucide-react";
import { PredictiveAnalytics } from "./PredictiveAnalytics";
import { PassProbabilityTracker } from "./PassProbabilityTracker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface AnalyticsSummary {
  total_questions: number;
  correct_answers: number;
  overall_accuracy: number;
  sessions_count: number;
  last_activity: string | null;
  accuracy_by_unit: Record<string, { correct: number; total: number; accuracy: number }>;
}

export default function ProgressDashboard() {
  const { user } = useAuth();
  const { planType } = useSubscription();
  const { hasFeature } = useFeatureAccess();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPredictiveOpen, setIsPredictiveOpen] = useState(false);
  const [isPassTrackerOpen, setIsPassTrackerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("analytics-summary", {
        body: { user_id: user?.id },
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No data available yet. Start practicing to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  const studyStreak = 7; // This would come from user profile in real implementation
  const accuracyTrend = analytics.overall_accuracy > 70 ? "up" : "down";

  return (
    <div className="space-y-6">
      {/* Key Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Pass Probability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.overall_accuracy)}%
            </div>
            <p className="text-xs text-muted-foreground">Based on current performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyStreak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Questions Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_questions}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {accuracyTrend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              Accuracy Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {analytics.overall_accuracy.toFixed(1)}%
              {accuracyTrend === "up" ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {accuracyTrend === "up" ? "Improving" : "Needs focus"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Unit */}
      {analytics.accuracy_by_unit && Object.keys(analytics.accuracy_by_unit).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Unit</CardTitle>
            <CardDescription>Your accuracy across different syllabus units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.accuracy_by_unit)
                .slice(0, 6)
                .map(([unit, stats]) => (
                  <div key={unit} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{unit}</span>
                      <span className="text-muted-foreground">
                        {stats.accuracy.toFixed(1)}% ({stats.correct}/{stats.total})
                      </span>
                    </div>
                    <Progress value={stats.accuracy} className="h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Features */}
      {hasFeature("predictiveAnalytics") && (
        <Collapsible open={isPredictiveOpen} onOpenChange={setIsPredictiveOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Predictive Analytics
                    </CardTitle>
                    <CardDescription>AI-powered performance predictions</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isPredictiveOpen ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <PredictiveAnalytics />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {hasFeature("passProbability") && (
        <Collapsible open={isPassTrackerOpen} onOpenChange={setIsPassTrackerOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Pass Probability Tracker
                    </CardTitle>
                    <CardDescription>Real-time pass probability projections</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isPassTrackerOpen ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <PassProbabilityTracker />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
