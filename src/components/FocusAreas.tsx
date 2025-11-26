import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePapers } from "@/hooks/usePapers";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Target, Play, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TopicPerformance {
  id: string;
  paper_code: string;
  unit_code: string | null;
  topic_name: string;
  questions_attempted: number;
  questions_correct: number;
  accuracy_percentage: number;
  last_practiced_at: string;
}

interface SpacedRepetitionStats {
  due_count: number;
  overdue_count: number;
}

export default function FocusAreas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { papers } = usePapers();
  const [selectedPaper, setSelectedPaper] = useState<string>("");
  const [weakTopics, setWeakTopics] = useState<TopicPerformance[]>([]);
  const [spacedStats, setSpacedStats] = useState<SpacedRepetitionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (papers.length > 0 && !selectedPaper) {
      setSelectedPaper(papers[0].paper_code);
    }
  }, [papers, selectedPaper]);

  useEffect(() => {
    if (selectedPaper && user) {
      fetchFocusData();
    }
  }, [selectedPaper, user]);

  const fetchFocusData = async () => {
    setLoading(true);
    try {
      // Fetch weak topics
      const { data: weakData, error: weakError } = await supabase
        .from("topic_performance")
        .select("*")
        .eq("user_id", user!.id)
        .eq("paper_code", selectedPaper)
        .gte("questions_attempted", 3)
        .lte("accuracy_percentage", 70)
        .order("accuracy_percentage", { ascending: true })
        .limit(5);

      if (weakError) throw weakError;
      setWeakTopics(weakData || []);

      // Fetch spaced repetition stats
      const now = new Date().toISOString();
      const { data: spacedData, error: spacedError } = await supabase
        .from("question_reviews")
        .select("id, next_review_at")
        .eq("user_id", user!.id)
        .lte("next_review_at", now);

      if (spacedError) throw spacedError;
      
      const due_count = spacedData?.length || 0;
      const overdue_count = spacedData?.filter(
        (r) => new Date(r.next_review_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      setSpacedStats({ due_count, overdue_count });
    } catch (error) {
      console.error("Error fetching focus data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 40) return "text-destructive";
    if (accuracy < 60) return "text-orange-500";
    return "text-yellow-500";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const hasAnyFocusItems = weakTopics.length > 0 || (spacedStats && spacedStats.due_count > 0);

  return (
    <div className="space-y-6">
      {/* Paper Selection */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Focus Areas</h2>
          <p className="text-muted-foreground">Prioritized practice suggestions</p>
        </div>
        <Select value={selectedPaper} onValueChange={setSelectedPaper}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select paper" />
          </SelectTrigger>
          <SelectContent>
            {papers.map((paper) => (
              <SelectItem key={paper.paper_code} value={paper.paper_code}>
                {paper.paper_code} - {paper.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hasAnyFocusItems ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground mb-4">
              No urgent focus areas. Keep up the great work!
            </p>
            <Button onClick={() => navigate("/practice")}>Continue Practicing</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Spaced Repetition Due */}
          {spacedStats && spacedStats.due_count > 0 && (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="bg-primary">Urgent</Badge>
                      <h3 className="font-semibold flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Spaced Review Due
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {spacedStats.due_count} question{spacedStats.due_count !== 1 ? "s" : ""} ready for review
                      {spacedStats.overdue_count > 0 && ` (${spacedStats.overdue_count} overdue)`}
                    </p>
                  </div>
                  <Button onClick={() => navigate("/review?tab=spaced")} size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Start Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weak Topics */}
          {weakTopics.length > 0 && (
            <>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      {weakTopics.length} topic{weakTopics.length !== 1 ? "s" : ""} need attention
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Topics with accuracy ≤70% and 3+ attempts
                    </p>
                  </div>
                </div>
              </div>

              {weakTopics.map((topic, index) => (
                <Card key={topic.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <h3 className="font-semibold">{topic.topic_name}</h3>
                        </div>
                        {topic.unit_code && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Unit: {topic.unit_code}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className={getAccuracyColor(topic.accuracy_percentage)}>
                            Accuracy: {topic.accuracy_percentage.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground">
                            {topic.questions_correct}/{topic.questions_attempted} correct
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          navigate(`/practice?tab=quiz&paper=${selectedPaper}&unit=${topic.unit_code || ""}`)
                        }
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Practice
                      </Button>
                    </div>
                    <Progress value={topic.accuracy_percentage} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
