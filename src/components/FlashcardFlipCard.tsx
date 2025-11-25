import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, Frown, ThumbsUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Flashcard {
  id: string;
  paper_code: string;
  paper_name: string;
  unit_title: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  source_type: string;
}

interface FlashcardFlipCardProps {
  flashcard: Flashcard;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (rating: "again" | "hard" | "good" | "easy") => void;
  hasNext: boolean;
  hasPrevious: boolean;
  currentIndex: number;
  totalCards: number;
}

export default function FlashcardFlipCard({
  flashcard,
  onNext,
  onPrevious,
  onRate,
  hasNext,
  hasPrevious,
  currentIndex,
  totalCards,
}: FlashcardFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const minSwipeDistance = 50;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    onNext();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    onPrevious();
  };

  const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
    onRate(rating);
    setIsFlipped(false);
    if (hasNext) {
      onNext();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && hasNext) {
      handleNext();
    }
    if (isRightSwipe && hasPrevious) {
      handlePrevious();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " && !e.repeat) {
        e.preventDefault();
        handleFlip();
      }
      if (isFlipped) {
        if (e.key === "1") handleRate("again");
        if (e.key === "2") handleRate("hard");
        if (e.key === "3") handleRate("good");
        if (e.key === "4") handleRate("easy");
      }
      if (e.key === "ArrowLeft" && hasPrevious) handlePrevious();
      if (e.key === "ArrowRight" && hasNext) handleNext();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, hasNext, hasPrevious]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Card {currentIndex + 1} of {totalCards}
        </span>
        <div className="flex gap-2">
          <Badge variant="outline">{flashcard.paper_code}</Badge>
          <Badge className={getDifficultyColor(flashcard.difficulty)}>
            {flashcard.difficulty}
          </Badge>
        </div>
      </div>

      {/* Flip Card */}
      <div
        className="relative h-[400px] cursor-pointer perspective-1000"
        onClick={handleFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-500 transform-style-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Front of Card */}
          <Card
            className={cn(
              "absolute w-full h-full backface-hidden shadow-xl border-2 hover:border-primary/50 transition-colors",
              "flex flex-col justify-center"
            )}
          >
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                  {flashcard.unit_title}
                </p>
                <h3 className="text-xl font-medium text-foreground leading-relaxed">
                  {flashcard.question}
                </h3>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Click to reveal answer
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back of Card */}
          <Card
            className={cn(
              "absolute w-full h-full backface-hidden shadow-xl border-2 border-primary/30",
              "rotate-y-180 flex flex-col justify-between bg-gradient-to-br from-primary/5 to-primary/10"
            )}
          >
            <CardContent className="p-8 space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold text-center">
                  Answer
                </p>
                <p className="text-lg text-foreground leading-relaxed text-center">
                  {flashcard.answer}
                </p>
              </div>
            </CardContent>

            <div className="p-4 border-t bg-background/50 space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Rate your recall (or press 1-4)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate("again");
                  }}
                  variant="outline"
                  size="sm"
                  className="border-destructive/50 hover:bg-destructive/10"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Again
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate("hard");
                  }}
                  variant="outline"
                  size="sm"
                  className="border-orange-500/50 hover:bg-orange-500/10"
                >
                  <Frown className="w-3 h-3 mr-1" />
                  Hard
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate("good");
                  }}
                  variant="outline"
                  size="sm"
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Good
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate("easy");
                  }}
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/50 hover:bg-emerald-500/10"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Easy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          size="lg"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button onClick={handleFlip} variant="ghost" size="sm">
          {isFlipped ? "Show Question" : "Show Answer"}
          <Badge variant="outline" className="ml-2 text-xs">Space</Badge>
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!hasNext}
          size="lg"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
