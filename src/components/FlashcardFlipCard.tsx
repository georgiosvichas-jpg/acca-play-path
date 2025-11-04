import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onMarkLearned: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  currentIndex: number;
  totalCards: number;
}

export default function FlashcardFlipCard({
  flashcard,
  onNext,
  onPrevious,
  onMarkLearned,
  hasNext,
  hasPrevious,
  currentIndex,
  totalCards,
}: FlashcardFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

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

  const handleMarkLearned = () => {
    onMarkLearned();
    setIsFlipped(false);
    if (hasNext) {
      onNext();
    }
  };

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

            <div className="p-6 border-t bg-background/50">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkLearned();
                }}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Learned (+1 XP)
              </Button>
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

        <Button onClick={handleFlip} variant="ghost">
          {isFlipped ? "Show Question" : "Show Answer"}
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
