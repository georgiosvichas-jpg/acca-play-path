import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useXP } from "@/hooks/useXP";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FlashcardFlipCard from "./FlashcardFlipCard";
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
    // Auto-import flashcards if none exist
    const autoImport = async () => {
      if (showImporter && !loading) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-flashcards`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
            }
          );

          if (response.ok) {
            await fetchFlashcards();
          }
        } catch (error) {
          console.error("Auto-import failed:", error);
        }
      }
    };

    autoImport();
  }, [showImporter, loading]);

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F8FBFA] to-[#EAF8F4] p-4">
          <Card className="max-w-xl w-full shadow-lg animate-fade-in rounded-3xl">
            <CardContent className="pt-12 pb-10 px-8 text-center space-y-6">
              {/* Loading Animation */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-[#0F172A]">
                  Preparing Your Flashcards
                </h1>
                <p className="text-base text-[#475569] max-w-lg mx-auto leading-relaxed">
                  We're loading your ACCA flashcard collection. This will only take a moment...
                </p>
              </div>

              {/* Loading Spinner */}
              <div className="py-6">
                <div className="mx-auto w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>

              {/* Progress Text */}
              <p className="text-sm text-[#94A3B8]">
                Setting up 500+ flashcards across all ACCA papers
              </p>
            </CardContent>
          </Card>
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
