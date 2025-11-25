import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Target, Activity, Zap, Lock } from "lucide-react";
import QuestionAnalytics from "./QuestionAnalytics";
import ProgressTracking from "./ProgressTracking";
import ProgressPage from "@/components/ProgressPage";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";
import { PassProbabilityTracker } from "@/components/PassProbabilityTracker";
import { FeaturePaywallModal } from "@/components/FeaturePaywallModal";

function LockedFeaturePreview({ 
  title, 
  description, 
  paywallType 
}: { 
  title: string; 
  description: string; 
  paywallType: "predictive-insights"; 
}) {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 flex items-center justify-center z-10">
          <div className="text-center space-y-4 p-8 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
            <Button 
              onClick={() => setShowPaywall(true)}
              size="lg"
              className="w-full"
            >
              Unlock with Elite
            </Button>
          </div>
        </div>

        {/* Blurred preview */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>AI-powered insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-40">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-3xl font-bold">+12.5%</div>
                <p className="text-sm text-muted-foreground">Projected Improvement</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-3xl font-bold">87%</div>
                <p className="text-sm text-muted-foreground">Pass Probability</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FeaturePaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        paywallType={paywallType}
      />
    </>
  );
}

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
                <LockedFeaturePreview 
                  title="Predictive Analytics"
                  description="Get AI-powered performance predictions, improvement forecasts, and personalized recommendations based on your study patterns."
                  paywallType="predictive-insights"
                />
              )}
            </TabsContent>

            <TabsContent value="pass-tracker">
              {hasFeature("passProbability") ? (
                <PassProbabilityTracker />
              ) : (
                <LockedFeaturePreview 
                  title="Pass Probability Tracker"
                  description="Track your real-time pass probability with data-driven projections and confidence metrics for your upcoming exam."
                  paywallType="predictive-insights"
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
