import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Target, Zap, Award, Lock, Crown } from "lucide-react";
import { PredictiveAnalytics } from "./PredictiveAnalytics";
import { PassProbabilityTracker } from "./PassProbabilityTracker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { FeaturePaywallModal } from "./FeaturePaywallModal";

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
  const [showPaywall, setShowPaywall] = useState(false);

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

      {/* Performance by Unit - Bar Chart */}
      {analytics.accuracy_by_unit && Object.keys(analytics.accuracy_by_unit).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Unit</CardTitle>
            <CardDescription>Your accuracy across different syllabus units (top 6 shown)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(analytics.accuracy_by_unit)
                  .map(([unit, stats]) => ({
                    unit,
                    accuracy: Number(stats.accuracy.toFixed(1)),
                    correct: stats.correct,
                    total: stats.total,
                  }))
                  .sort((a, b) => a.accuracy - b.accuracy)
                  .slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  dataKey="unit" 
                  type="category" 
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                          <p className="font-semibold text-sm">{data.unit}</p>
                          <p className="text-sm text-muted-foreground">
                            Accuracy: {data.accuracy}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.correct}/{data.total} correct
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {Object.entries(analytics.accuracy_by_unit)
                    .map(([unit, stats]) => ({
                      unit,
                      accuracy: Number(stats.accuracy.toFixed(1)),
                    }))
                    .sort((a, b) => a.accuracy - b.accuracy)
                    .slice(0, 6)
                    .map((entry, index) => {
                      let color = "hsl(var(--primary))";
                      if (entry.accuracy > 70) color = "#22c55e"; // green
                      else if (entry.accuracy >= 50) color = "#f59e0b"; // yellow/amber
                      else color = "#ef4444"; // red
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Premium Features */}
      {/* Predictive Analytics */}
      {hasFeature("predictiveAnalytics") ? (
        <Collapsible open={isPredictiveOpen} onOpenChange={setIsPredictiveOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Predictive Analytics
                      <Badge variant="secondary" className="ml-2">
                        <Crown className="h-3 w-3 mr-1" />
                        Elite
                      </Badge>
                    </CardTitle>
                    <CardDescription>AI-powered performance predictions</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isPredictiveOpen ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent className="transition-all duration-300">
              <CardContent>
                <PredictiveAnalytics />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Get AI-powered predictions of your future performance, identify weak areas before they become problems, and receive personalized study recommendations.
                </p>
                <Button onClick={() => setShowPaywall(true)} size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Elite
                </Button>
              </div>
            </div>
          </div>
          <CardHeader className="opacity-30">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Predictive Analytics
            </CardTitle>
            <CardDescription>AI-powered performance predictions</CardDescription>
          </CardHeader>
          <CardContent className="opacity-20">
            <div className="space-y-4">
              <div className="h-32 bg-muted/50 rounded-lg" />
              <div className="h-24 bg-muted/50 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pass Probability Tracker */}
      {hasFeature("passProbability") ? (
        <Collapsible open={isPassTrackerOpen} onOpenChange={setIsPassTrackerOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Pass Probability Tracker
                      <Badge variant="secondary" className="ml-2">
                        <Crown className="h-3 w-3 mr-1" />
                        Elite
                      </Badge>
                    </CardTitle>
                    <CardDescription>Real-time pass probability projections</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isPassTrackerOpen ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent className="transition-all duration-300">
              <CardContent>
                <PassProbabilityTracker />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Pass Probability Tracker</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Track your real-time likelihood of passing, see your study trajectory, and get personalized daily practice goals to maximize your chances of success.
                </p>
                <Button onClick={() => setShowPaywall(true)} size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Elite
                </Button>
              </div>
            </div>
          </div>
          <CardHeader className="opacity-30">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Pass Probability Tracker
            </CardTitle>
            <CardDescription>Real-time pass probability projections</CardDescription>
          </CardHeader>
          <CardContent className="opacity-20">
            <div className="space-y-4">
              <div className="h-40 bg-muted/50 rounded-lg" />
              <div className="h-24 bg-muted/50 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      )}

      <FeaturePaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        paywallType="predictive-insights"
      />
    </div>
  );
}
