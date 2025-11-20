import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Target, Activity, Zap } from "lucide-react";
import QuestionAnalytics from "./QuestionAnalytics";
import ProgressTracking from "./ProgressTracking";
import ProgressPage from "@/components/ProgressPage";
import { UpgradeNudge } from "@/components/UpgradeNudge";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";
import { PassProbabilityTracker } from "@/components/PassProbabilityTracker";

export default function Analytics() {
  const { hasFeature } = useFeatureAccess();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Analytics & Insights</h1>
            <p className="text-muted-foreground">Track your performance and get AI-powered predictions</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="predictive" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Predictive
              </TabsTrigger>
              <TabsTrigger value="pass-tracker" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Pass Tracker
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <QuestionAnalytics />
            </TabsContent>

            <TabsContent value="progress">
              <ProgressPage />
            </TabsContent>

            <TabsContent value="trends">
              <ProgressTracking />
            </TabsContent>

            <TabsContent value="predictive">
              {hasFeature("predictiveAnalytics") ? (
                <PredictiveAnalytics />
              ) : (
                <UpgradeNudge
                  type="predictive-analytics"
                  message="Get AI-powered predictions and insights with Elite plan"
                  tier="elite"
                  variant="banner"
                />
              )}
            </TabsContent>

            <TabsContent value="pass-tracker">
              {hasFeature("predictiveAnalytics") ? (
                <PassProbabilityTracker />
              ) : (
                <UpgradeNudge
                  type="pass-probability"
                  message="Track your pass probability with Elite plan"
                  tier="elite"
                  variant="banner"
                />
              )}
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
