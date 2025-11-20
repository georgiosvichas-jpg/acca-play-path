import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Target, Activity } from "lucide-react";
import QuestionAnalytics from "./QuestionAnalytics";
import ProgressTracking from "./ProgressTracking";
import ProgressPage from "@/components/ProgressPage";
import { UpgradeNudge } from "@/components/UpgradeNudge";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

export default function Analytics() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Analytics & Insights</h1>
            <p className="text-muted-foreground">Track your performance and progress over time</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
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
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tips
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

            <TabsContent value="recommendations">
              <UpgradeNudge
                type="elite-insights"
                message="Want pass probability and projections? Go Elite."
                tier="elite"
                variant="inline"
              />
              <div className="text-center py-12 text-muted-foreground">
                AI-powered recommendations coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
