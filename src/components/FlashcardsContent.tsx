import { useState, useEffect } from "react";
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
import { useFlashcards } from "@/hooks/useFlashcards";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Footer from "./Footer";
import { EmptyState } from "./EmptyStates";
import { toast } from "sonner";

export default function FlashcardsContent() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const { flashcards, loading } = useFlashcards(profile?.selected_paper);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  useEffect(() => {
    if (flashcards.length > 0) {
      setCurrentCard(0);
      setIsFlipped(false);
    }
  }, [flashcards]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <>
        <EmptyState
          type="flashcards"
          onAction={() => window.location.href = '/dashboard'}
          onSecondaryAction={() => toast.info("Flashcards flip to reveal answers. Practice daily to earn XP!")}
        />
        <Footer />
      </>
    );
  }

  const card = flashcards[currentCard];
  const progress = ((currentCard + 1) / flashcards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = async () => {
    if (!isFlipped) {
      setIsFlipped(true);
      return;
    }

    // Award XP
    const earnedXp = card.xp;
    setXpEarned(xpEarned + earnedXp);
    setShowXpAnimation(true);
    setTimeout(() => setShowXpAnimation(false), 1000);

    // Update user profile XP
    if (user && profile) {
      const newTotalXp = (profile.total_xp || 0) + earnedXp;
      await updateProfile({ total_xp: newTotalXp });

      // Record flashcard review
      await supabase.from("flashcard_reviews").upsert({
        user_id: user.id,
        flashcard_id: card.id,
        last_reviewed_at: new Date().toISOString(),
      });
    }

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

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "Formula":
        return <TrendingUp className="w-4 h-4" />;
      case "Concept":
        return <Lightbulb className="w-4 h-4" />;
      case "Problem":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "Formula":
        return "bg-primary/10 text-primary";
      case "Concept":
        return "bg-secondary/10 text-secondary";
      case "Problem":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="mb-8 animate-fade-in">
            <img
              src={flashcardsHero}
              alt="Flashcards"
              className="w-full rounded-2xl shadow-float"
            />
          </div>

          {/* Progress Bar */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Progress</span>
                <Badge variant="secondary" className="rounded-lg">
                  {currentCard + 1} / {flashcards.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">{xpEarned} XP earned</span>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Flashcard */}
          <div
            className="perspective-1000 mb-8 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div
              className={`relative transition-transform duration-500 transform-style-3d cursor-pointer ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={handleFlip}
            >
              {/* Front of card */}
              <Card
                className={`p-8 md:p-12 shadow-card min-h-[300px] flex flex-col justify-between backface-hidden ${
                  isFlipped ? "hidden" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`rounded-lg ${getCategoryColor(card.category)}`}>
                      {getCategoryIcon(card.category)}
                      <span className="ml-1">{card.category || "General"}</span>
                    </Badge>
                    {card.difficulty && (
                      <Badge variant="outline" className="rounded-lg">
                        {card.difficulty}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                    {card.question}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Click to reveal answer
                </p>
              </Card>

              {/* Back of card */}
              <Card
                className={`p-8 md:p-12 shadow-card min-h-[300px] flex flex-col justify-between backface-hidden rotate-y-180 ${
                  isFlipped ? "" : "hidden"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`rounded-lg ${getCategoryColor(card.category)}`}>
                      {getCategoryIcon(card.category)}
                      <span className="ml-1">{card.category || "General"}</span>
                    </Badge>
                    {card.difficulty && (
                      <Badge variant="outline" className="rounded-lg">
                        {card.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="prose prose-sm md:prose-base max-w-none">
                    <p className="text-lg md:text-xl leading-relaxed">{card.answer}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Click to flip back
                </p>
              </Card>
            </div>
          </div>

          {/* XP Animation */}
          {showXpAnimation && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
              <div className="bg-accent text-white px-6 py-3 rounded-full shadow-float font-bold text-xl">
                +{card.xp} XP
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={handleShuffle}
              className="rounded-xl font-semibold"
            >
              <RotateCw className="mr-2 h-5 w-5" />
              Shuffle
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 font-semibold rounded-xl shadow-float"
              disabled={currentCard === flashcards.length - 1 && isFlipped}
            >
              {isFlipped ? "Next Card" : "Reveal Answer"}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
