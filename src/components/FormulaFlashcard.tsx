import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ChevronLeft, ChevronRight, Calculator } from "lucide-react";

interface FormulaFlashcardProps {
  flashcard: {
    id: string;
    question: string; // Formula name
    answer: string; // Contains JSON with formula, breakdown, and practice
    paper_code: string;
    difficulty: string;
  };
  currentIndex: number;
  totalCards: number;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (rating: "again" | "hard" | "good" | "easy") => void;
}

interface FormulaData {
  formula: string;
  breakdown: string[];
  practice: string;
}

export default function FormulaFlashcard({
  flashcard,
  currentIndex,
  totalCards,
  onNext,
  onPrevious,
  onRate,
}: FormulaFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  let formulaData: FormulaData;
  try {
    formulaData = JSON.parse(flashcard.answer);
  } catch {
    formulaData = {
      formula: flashcard.answer,
      breakdown: [],
      practice: "",
    };
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) onPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < totalCards - 1) onNext();
      } else if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRate("again");
        } else if (e.key === "2") {
          e.preventDefault();
          handleRate("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          handleRate("good");
        } else if (e.key === "4") {
          e.preventDefault();
          handleRate("easy");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex, totalCards]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
    onRate(rating);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Card {currentIndex + 1} of {totalCards}
        </span>
        <span className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Formula Card
        </span>
      </div>

      {/* Main Card */}
      <Card
        className="relative cursor-pointer transition-all duration-500 min-h-[400px] perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Side - Formula Name */}
          {!isFlipped && (
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-center space-y-6 backface-hidden">
              <div className="text-center space-y-4">
                <div className="inline-flex px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-semibold text-primary">
                    {flashcard.paper_code} • {flashcard.difficulty}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  {flashcard.question}
                </h2>
                <div className="mt-8 px-6 py-4 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-mono text-foreground">
                    {formulaData.formula}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-8">
                Click to see breakdown
              </p>
            </div>
          )}

          {/* Back Side - Breakdown & Practice */}
          {isFlipped && (
            <div className="absolute inset-0 p-8 overflow-y-auto backface-hidden rotate-y-180">
              <div className="space-y-6">
                {/* Formula Display */}
                <div className="px-4 py-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xl font-mono text-foreground">
                    {formulaData.formula}
                  </p>
                </div>

                {/* Step-by-step Breakdown */}
                {formulaData.breakdown.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      Step-by-Step Breakdown:
                    </h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {formulaData.breakdown.map((step, idx) => (
                        <li
                          key={idx}
                          className="text-base text-muted-foreground leading-relaxed pl-2"
                        >
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Practice Problem */}
                {formulaData.practice && (
                  <div className="space-y-2 p-4 bg-accent/50 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Practice Problem:
                    </h3>
                    <p className="text-base text-foreground leading-relaxed">
                      {formulaData.practice}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation & Rating */}
      <div className="flex flex-col gap-4">
        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            size="lg"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={currentIndex === totalCards - 1}
            size="lg"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Rating Buttons (only show when flipped) */}
        {isFlipped && (
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="destructive"
              onClick={() => handleRate("again")}
              className="h-auto py-3 flex flex-col gap-1"
            >
              <span className="font-semibold">Again</span>
              <span className="text-xs opacity-90">&lt; 1 min</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate("hard")}
              className="h-auto py-3 flex flex-col gap-1 border-orange-500 text-orange-700 hover:bg-orange-50"
            >
              <span className="font-semibold">Hard</span>
              <span className="text-xs opacity-90">+1 XP</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate("good")}
              className="h-auto py-3 flex flex-col gap-1 border-emerald-500 text-emerald-700 hover:bg-emerald-50"
            >
              <span className="font-semibold">Good</span>
              <span className="text-xs opacity-90">+2 XP</span>
            </Button>
            <Button
              variant="default"
              onClick={() => handleRate("easy")}
              className="h-auto py-3 flex flex-col gap-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <span className="font-semibold">Easy</span>
              <span className="text-xs opacity-90">+3 XP</span>
            </Button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcut Hint */}
      <p className="text-center text-xs text-muted-foreground">
        Press <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to flip •{" "}
        <kbd className="px-2 py-1 bg-muted rounded">←</kbd> / <kbd className="px-2 py-1 bg-muted rounded">→</kbd> to navigate
        {isFlipped && (
          <>
            {" "}• <kbd className="px-2 py-1 bg-muted rounded">1-4</kbd> to rate
          </>
        )}
      </p>
    </div>
  );
}
