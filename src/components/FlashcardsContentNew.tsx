import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useXP } from "@/hooks/useXP";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FlashcardFlipCard from "./FlashcardFlipCard";
import FlashcardImporter from "./FlashcardImporter";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Filter, BookOpen } from "lucide-react";

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

export default function FlashcardsContentNew() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { awardXP } = useXP();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showImporter, setShowImporter] = useState(false);

  // Filters
  const [selectedPaper, setSelectedPaper] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Get unique values for filters
  const papers = Array.from(new Set(flashcards.map((f) => f.paper_code))).sort();
  const units = Array.from(new Set(flashcards.map((f) => f.unit_title))).sort();
  const difficulties = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [flashcards, selectedPaper, selectedUnit, selectedDifficulty]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("paper_code");

      if (error) throw error;

      if (data && data.length > 0) {
        setFlashcards(data);
        setShowImporter(false);
      } else {
        setShowImporter(true);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...flashcards];

    if (selectedPaper !== "all") {
      filtered = filtered.filter((f) => f.paper_code === selectedPaper);
    }

    if (selectedUnit !== "all") {
      filtered = filtered.filter((f) => f.unit_title === selectedUnit);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((f) => f.difficulty === selectedDifficulty);
    }

    setFilteredCards(filtered);
    setCurrentIndex(0);
  };

  const handleMarkLearned = async () => {
    if (!user) return;

    const card = filteredCards[currentIndex];

    try {
      // Award XP for completing flashcard
      await awardXP("flashcard_session_10", 1); // +1 XP per card

      // Record flashcard review
      await supabase.from("flashcard_reviews").upsert({
        user_id: user.id,
        flashcard_id: card.id,
        last_reviewed_at: new Date().toISOString(),
        total_reviews: 1,
        correct_count: 1,
      });

      toast.success("+1 XP earned!");
    } catch (error) {
      console.error("Error marking flashcard as learned:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetFilters = () => {
    setSelectedPaper("all");
    setSelectedUnit("all");
    setSelectedDifficulty("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showImporter) {
    return (
      <>
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2">
              <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground">Welcome to Flashcards</h1>
              <p className="text-muted-foreground">
                Import the ACCA flashcard dataset to start studying
              </p>
            </div>
            <FlashcardImporter />
            <div className="text-center">
              <Button variant="ghost" onClick={fetchFlashcards}>
                Check if cards are imported
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <>
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  No Flashcards Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  No flashcards match your current filters. Try adjusting your selection.
                </p>
                <Button onClick={resetFilters}>Reset All Filters</Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">ACCA Flashcards</h1>
            <p className="text-lg text-muted-foreground">
              Master your ACCA exams one card at a time
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Filter Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Paper</label>
                  <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Papers</SelectItem>
                      {papers.map((paper) => (
                        <SelectItem key={paper} value={paper}>
                          {paper}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline">{filteredCards.length} cards</Badge>
                  {(selectedPaper !== "all" || selectedUnit !== "all" || selectedDifficulty !== "all") && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flashcard */}
          <FlashcardFlipCard
            flashcard={filteredCards[currentIndex]}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onMarkLearned={handleMarkLearned}
            hasNext={currentIndex < filteredCards.length - 1}
            hasPrevious={currentIndex > 0}
            currentIndex={currentIndex}
            totalCards={filteredCards.length}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
