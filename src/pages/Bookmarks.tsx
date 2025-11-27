import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BookmarkedQuestion {
  id: string;
  question_id: string;
  source_type: string;
  notes: string | null;
  created_at: string;
  question: {
    question: string;
    paper: string;
    type: string;
    difficulty: string | null;
    unit_code: string | null;
  } | null;
}

export default function Bookmarks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookmarks, loading, removeBookmark } = useBookmarks();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([]);
  const [fetchingDetails, setFetchingDetails] = useState(true);

  useEffect(() => {
    if (!loading && bookmarks.length > 0) {
      fetchQuestionDetails();
    } else if (!loading) {
      setFetchingDetails(false);
    }
  }, [loading, bookmarks]);

  const fetchQuestionDetails = async () => {
    try {
      const questionIds = bookmarks.map((b) => b.question_id);
      const { data, error } = await supabase
        .from("sb_questions")
        .select("id, question, paper, type, difficulty, unit_code")
        .in("id", questionIds);

      if (error) throw error;

      const questionsMap = new Map(data?.map((q) => [q.id, q]) || []);
      const enriched = bookmarks.map((bookmark) => ({
        ...bookmark,
        question: questionsMap.get(bookmark.question_id) || null,
      }));

      setBookmarkedQuestions(enriched);
    } catch (error) {
      console.error("Error fetching question details:", error);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleRemove = async (questionId: string) => {
    await removeBookmark(questionId);
    setBookmarkedQuestions((prev) =>
      prev.filter((bq) => bq.question_id !== questionId)
    );
  };

  const getSourceLabel = (sourceType: string) => {
    const labels: Record<string, string> = {
      practice: "Practice Quiz",
      mock: "Mock Exam",
      spaced_repetition: "Spaced Repetition",
      mini_test: "Mini Test",
    };
    return labels[sourceType] || sourceType;
  };

  if (loading || fetchingDetails) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-6 w-6" />
              Bookmarked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-6 w-6" />
            Bookmarked Questions ({bookmarkedQuestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookmarkedQuestions.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start bookmarking questions from Practice Quiz, Mock Exam, or Spaced Repetition
              </p>
              <Button onClick={() => navigate("/practice-quiz")}>
                Go to Practice Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarkedQuestions.map((item) => (
                <Card key={item.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{getSourceLabel(item.source_type)}</Badge>
                          {item.question?.paper && (
                            <Badge variant="secondary">{item.question.paper}</Badge>
                          )}
                          {item.question?.difficulty && (
                            <Badge
                              variant={
                                item.question.difficulty === "hard"
                                  ? "destructive"
                                  : item.question.difficulty === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {item.question.difficulty}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2">
                          {item.question?.question || "Question not found"}
                        </p>
                        {item.question?.unit_code && (
                          <p className="text-xs text-muted-foreground">
                            Unit: {item.question.unit_code}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Note: {item.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Saved: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemove(item.question_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
