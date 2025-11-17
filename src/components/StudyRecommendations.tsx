import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Target, TrendingUp, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  targetArea: string;
  actionItems: string[];
}

interface RecommendationsData {
  summary: string;
  recommendations: Recommendation[];
  encouragement: string;
}

export function StudyRecommendations() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('study-recommendations');

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }

      setRecommendations(data.recommendations);
      toast.success("Recommendations generated!");
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to generate recommendations";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-5 w-5" />;
      case "medium": return <Target className="h-5 w-5" />;
      case "low": return <TrendingUp className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  if (!recommendations && !loading && !error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <CardTitle>AI Study Recommendations</CardTitle>
          </div>
          <CardDescription>
            Get personalized study suggestions based on your performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Let our AI analyze your practice quiz results and suggest which areas to focus on next.
            </p>
            <Button onClick={fetchRecommendations} size="lg" className="w-full md:w-auto">
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your performance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchRecommendations} variant="outline" className="w-full mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <CardTitle>Your Study Recommendations</CardTitle>
            </div>
            <Button onClick={fetchRecommendations} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium">{recommendations.summary}</p>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            {recommendations.recommendations.map((rec, idx) => (
              <Card key={idx} className="border-l-4" style={{ 
                borderLeftColor: rec.priority === "high" ? "rgb(239 68 68)" : 
                                rec.priority === "medium" ? "rgb(234 179 8)" : 
                                "rgb(34 197 94)" 
              }}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPriorityIcon(rec.priority)}
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{rec.targetArea}</Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {rec.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Action Items:</p>
                    <ul className="space-y-2">
                      {rec.actionItems.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Encouragement */}
          <div className="p-4 bg-muted rounded-lg border">
            <p className="text-sm italic">{recommendations.encouragement}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
