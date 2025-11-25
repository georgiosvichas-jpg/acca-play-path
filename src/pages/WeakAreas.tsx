import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePapers } from "@/hooks/usePapers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingDown, BookOpen, Play } from "lucide-react";
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

export default function WeakAreas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { papers } = usePapers();
  const [selectedPaper, setSelectedPaper] = useState<string>("");
  const [weakTopics, setWeakTopics] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (papers.length > 0 && !selectedPaper) {
      setSelectedPaper(papers[0].paper_code);
    }
  }, [user, papers, selectedPaper, navigate]);

  useEffect(() => {
    if (selectedPaper) {
      fetchWeakAreas();
    }
  }, [selectedPaper]);

  const fetchWeakAreas = async () => {
    if (!user || !selectedPaper) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("topic_performance")
        .select("*")
        .eq("user_id", user.id)
        .eq("paper_code", selectedPaper)
        .gte("questions_attempted", 3) // Only show topics with at least 3 attempts
        .lte("accuracy_percentage", 70) // Topics with 70% or less accuracy
        .order("accuracy_percentage", { ascending: true })
        .limit(10);

      if (error) throw error;
      setWeakTopics(data || []);
    } catch (error) {
      console.error("Error fetching weak areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const startFocusedPractice = async (topicName: string, unitCode: string | null) => {
    setGeneratingQuiz(true);
    // Navigate to Practice Quiz with topic filter
    navigate(`/practice-quiz?paper=${selectedPaper}&unit=${unitCode || ""}&focus=weak`);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 40) return "text-destructive";
    if (accuracy < 60) return "text-orange-500";
    return "text-yellow-500";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-6 w-6" />
              Weak Areas Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-6 w-6" />
                Weak Areas Analysis
              </CardTitle>
              <CardDescription>
                Topics where you need more practice (accuracy ≤70% with 3+ attempts)
              </CardDescription>
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
        </CardHeader>
        <CardContent>
          {weakTopics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Weak Areas Detected</h3>
              <p className="text-muted-foreground mb-4">
                {selectedPaper
                  ? "Great job! Keep practicing to maintain your performance."
                  : "Start practicing to track your weak areas"}
              </p>
              <Button onClick={() => navigate("/practice-quiz")}>
                Start Practice Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      {weakTopics.length} topic{weakTopics.length !== 1 ? "s" : ""} need attention
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Focus on these areas to improve your overall performance
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
                          <span className="text-muted-foreground">
                            Last practiced:{" "}
                            {new Date(topic.last_practiced_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => startFocusedPractice(topic.topic_name, topic.unit_code)}
                        disabled={generatingQuiz}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
