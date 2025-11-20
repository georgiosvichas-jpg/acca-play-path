import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BookOpen, Target, TrendingUp, Award } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradeNudge } from "@/components/UpgradeNudge";

interface PaperProgress {
  paperCode: string;
  paperName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  studySessions: number;
  lastStudied: string | null;
}

export default function MultiPaperDashboard() {
  const { user } = useAuth();
  const { planType, hasFeature } = useFeatureAccess();
  const [papers, setPapers] = useState<PaperProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMultiPaperProgress();
    }
  }, [user]);

  const fetchMultiPaperProgress = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("selected_papers")
        .eq("user_id", user.id)
        .single();

      const selectedPapers = profile?.selected_papers || [];

      if (selectedPapers.length === 0) {
        setLoading(false);
        return;
      }

      const { data: allPapers } = await supabase
        .from("papers")
        .select("paper_code, title")
        .in("paper_code", selectedPapers);

      const paperProgressData: PaperProgress[] = [];

      for (const paper of allPapers || []) {
        const { data: sessions } = await supabase
          .from("study_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("paper_code", paper.paper_code)
          .order("session_date", { ascending: false });

        const totalQuestions = sessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;
        const correctAnswers = sessions?.reduce((sum, s) => sum + (s.correct_answers || 0), 0) || 0;
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        paperProgressData.push({
          paperCode: paper.paper_code,
          paperName: paper.title,
          totalQuestions,
          correctAnswers,
          accuracy,
          studySessions: sessions?.length || 0,
          lastStudied: sessions?.[0]?.session_date || null,
        });
      }

      setPapers(paperProgressData);
    } catch (error) {
      console.error("Error fetching multi-paper progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasFeature("multiPaperDashboard")) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <UpgradeNudge
            type="multi-paper-dashboard"
            message="Track multiple papers simultaneously with Elite plan"
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
          <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>
        </div>
      </ProtectedRoute>
    );
  }

  const totalQuestionsAllPapers = papers.reduce((sum, p) => sum + p.totalQuestions, 0);
  const totalCorrectAllPapers = papers.reduce((sum, p) => sum + p.correctAnswers, 0);
  const overallAccuracy = totalQuestionsAllPapers > 0 
    ? (totalCorrectAllPapers / totalQuestionsAllPapers) * 100 
    : 0;

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Multi-Paper Dashboard</h1>
          <p className="text-muted-foreground">Track your progress across all selected ACCA papers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Papers Tracking</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{papers.length}</div>
              <p className="text-xs text-muted-foreground">Active papers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestionsAllPapers}</div>
              <p className="text-xs text-muted-foreground">Across all papers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAccuracy.toFixed(1)}%</div>
              <Progress value={overallAccuracy} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallAccuracy >= 70 ? "Strong" : overallAccuracy >= 50 ? "Good" : "Building"}
              </div>
              <p className="text-xs text-muted-foreground">Across all papers</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paper Comparison</CardTitle>
            <CardDescription>Compare your performance across different papers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={papers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="paperCode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                <Bar dataKey="totalQuestions" fill="#10b981" name="Questions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Tabs defaultValue={papers[0]?.paperCode || ""} className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            {papers.map((paper) => (
              <TabsTrigger key={paper.paperCode} value={paper.paperCode}>
                {paper.paperCode}
              </TabsTrigger>
            ))}
          </TabsList>

          {papers.map((paper) => (
            <TabsContent key={paper.paperCode} value={paper.paperCode}>
              <Card>
                <CardHeader>
                  <CardTitle>{paper.paperName}</CardTitle>
                  <CardDescription>Detailed progress for {paper.paperCode}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Questions Attempted</div>
                      <div className="text-2xl font-bold">{paper.totalQuestions}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Accuracy</div>
                      <div className="text-2xl font-bold">{paper.accuracy.toFixed(1)}%</div>
                      <Progress value={paper.accuracy} className="mt-2" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Study Sessions</div>
                      <div className="text-2xl font-bold">{paper.studySessions}</div>
                    </div>
                  </div>
                  {paper.lastStudied && (
                    <div className="text-sm text-muted-foreground">
                      Last studied: {new Date(paper.lastStudied).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
