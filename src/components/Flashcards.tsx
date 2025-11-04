import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RotateCw,
  ChevronRight,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import flashcardsHero from "@/assets/flashcards-hero.png";

const flashcards = [
  {
    id: 1,
    front: "What is the accounting equation?",
    back: "Assets = Liabilities + Equity. This fundamental equation represents the relationship between a company's resources and claims to those resources.",
    category: "Concept",
    xp: 15,
  },
  {
    id: 2,
    front: "Calculate: If Sales = $50,000 and Gross Profit Margin = 40%, what is the Cost of Goods Sold?",
    back: "COGS = $30,000. Calculation: Gross Profit = 40% × $50,000 = $20,000. COGS = Sales - Gross Profit = $50,000 - $20,000 = $30,000",
    category: "Problem",
    xp: 20,
  },
  {
    id: 3,
    front: "What is the formula for the Acid Test Ratio?",
    back: "Acid Test Ratio = (Current Assets - Inventory) / Current Liabilities. It measures a company's ability to pay short-term obligations without selling inventory.",
    category: "Formula",
    xp: 15,
  },
];

export default function Flashcards() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  const card = flashcards[currentCard];
  const progress = ((currentCard + 1) / flashcards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      return;
    }

    // Award XP
    setXpEarned(xpEarned + card.xp);
    setShowXpAnimation(true);
    setTimeout(() => setShowXpAnimation(false), 1000);

    // Move to next card
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setXpEarned(0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Formula":
        return <TrendingUp className="w-4 h-4" />;
      case "Concept":
        return <Lightbulb className="w-4 h-4" />;
      case "Problem":
        return <Sparkles className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Formula":
        return "bg-primary/10 text-primary";
      case "Concept":
        return "bg-secondary/10 text-secondary";
      case "Problem":
        return "bg-accent/10 text-accent";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6">
            <img
              src={flashcardsHero}
              alt="Flashcards"
              className="w-full max-w-md mx-auto rounded-2xl animate-float"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
            Flashcards Playground
          </h1>
          <p className="text-xl text-muted-foreground">
            Keep flipping. Each concept mastered brings you closer.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">
              Card {currentCard + 1} of {flashcards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-accent">+{xpEarned} XP</span>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Flashcard */}
        <div
          className="relative mb-6 animate-scale-in perspective-1000"
          style={{ minHeight: "400px" }}
        >
          <Card
            className={`p-8 md:p-12 shadow-float cursor-pointer transition-all duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            } card-float`}
            onClick={handleFlip}
          >
            {!isFlipped ? (
              // Front
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <Badge
                    className={`${getCategoryColor(card.category)} rounded-lg px-3 py-1`}
                  >
                    <span className="mr-1">{getCategoryIcon(card.category)}</span>
                    {card.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg">
                    +{card.xp} XP
                  </Badge>
                </div>

                <div className="flex items-center justify-center min-h-[250px]">
                  <p className="text-2xl md:text-3xl font-display font-bold text-center text-balance">
                    {card.front}
                  </p>
                </div>

                <p className="text-center text-muted-foreground">
                  Click to reveal answer
                </p>
              </div>
            ) : (
              // Back
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <Badge className="bg-primary text-primary-foreground rounded-lg px-3 py-1">
                    Answer
                  </Badge>
                  <Badge variant="outline" className="rounded-lg">
                    +{card.xp} XP
                  </Badge>
                </div>

                <div className="flex items-center justify-center min-h-[250px]">
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {card.back}
                  </p>
                </div>

                <p className="text-center text-primary font-semibold">
                  Great job! Click Next to continue
                </p>
              </div>
            )}
          </Card>

          {/* XP Animation */}
          {showXpAnimation && (
            <div className="absolute top-4 right-4 animate-slide-up">
              <div className="bg-accent text-accent-foreground px-4 py-2 rounded-xl font-bold shadow-lg">
                +{card.xp} XP
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center animate-slide-up">
          <Button
            size="lg"
            variant="outline"
            className="rounded-xl font-semibold"
            onClick={handleShuffle}
          >
            <RotateCw className="mr-2 h-5 w-5" />
            Shuffle
          </Button>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-float"
            onClick={handleNext}
            disabled={currentCard === flashcards.length - 1 && isFlipped}
          >
            {!isFlipped ? "Reveal Answer" : "Next"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
