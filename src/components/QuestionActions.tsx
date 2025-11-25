import { useState } from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck, Sparkles, Loader2 } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface QuestionActionsProps {
  questionId: string;
  sourceType: "practice" | "mock" | "spaced_repetition" | "mini_test";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  userAnswer?: string | number | null;
  explanation?: string | null;
  showExplainButton?: boolean;
  className?: string;
}

export function QuestionActions({
  questionId,
  sourceType,
  question,
  options,
  correctAnswer,
  userAnswer,
  explanation,
  showExplainButton = true,
  className = "",
}: QuestionActionsProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [bookmarking, setBookmarking] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>("");

  const handleBookmark = async () => {
    setBookmarking(true);
    await toggleBookmark(questionId, sourceType);
    setBookmarking(false);
  };

  const handleExplain = async () => {
    setExplaining(true);
    setShowExplanation(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-explain", {
        body: {
          question,
          options,
          correctAnswer,
          userAnswer,
          explanation,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes("402")) {
          toast({
            title: "Credits Required",
            description: "AI credits exhausted. Please add credits to your workspace.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setShowExplanation(false);
        return;
      }

      setAiExplanation(data?.explanation || "No explanation available");
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      toast({
        title: "Error",
        description: "Failed to get AI explanation",
        variant: "destructive",
      });
      setShowExplanation(false);
    } finally {
      setExplaining(false);
    }
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBookmark}
          disabled={bookmarking}
        >
          {bookmarking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isBookmarked(questionId) ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isBookmarked(questionId) ? "Bookmarked" : "Bookmark"}
          </span>
        </Button>

        {showExplainButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExplain}
            disabled={explaining}
          >
            {explaining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-purple-500" />
            )}
            <span className="ml-2">AI Explain</span>
          </Button>
        )}
      </div>

      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Explanation
            </DialogTitle>
            <DialogDescription>
              Detailed explanation powered by AI
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div>
                <h4 className="font-semibold mb-2">Question:</h4>
                <p className="text-sm">{question}</p>
              </div>

              {options && options.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Options:</h4>
                  <div className="space-y-1">
                    {options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`text-sm p-2 rounded ${
                          idx === correctAnswer
                            ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                            : userAnswer === idx && idx !== correctAnswer
                            ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                            : "bg-muted"
                        }`}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + idx)})
                        </span>{" "}
                        {option}
                        {idx === correctAnswer && (
                          <Badge className="ml-2" variant="outline">
                            Correct
                          </Badge>
                        )}
                        {userAnswer === idx && idx !== correctAnswer && (
                          <Badge className="ml-2" variant="destructive">
                            Your Answer
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {explaining ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Generating explanation...</span>
                </div>
              ) : (
                <>
                  {explanation && (
                    <Alert>
                      <AlertDescription>
                        <h4 className="font-semibold mb-2">Official Explanation:</h4>
                        <p className="text-sm">{explanation}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {aiExplanation && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        AI Tutor Explanation:
                      </h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm">
                          {aiExplanation}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
