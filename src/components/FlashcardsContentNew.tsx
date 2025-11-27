import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useStudyPreferences } from "@/hooks/useStudyPreferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FlashcardFlipCard from "./FlashcardFlipCard";
import FormulaFlashcard from "./FormulaFlashcard";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Filter, BookOpen, Lock, AlertCircle, TrendingUp, Eye } from "lucide-react";
import { PaywallModal } from "./PaywallModal";
import { UpgradeNudge } from "./UpgradeNudge";
import { Alert, AlertDescription } from "./ui/alert";

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
  const { awardXP } = useXP();
  const { 
    canUseFlashcard, 
    remainingFlashcards, 
    dailyFlashcardsUsed,
    incrementFlashcardUsage,
    isLoading: usageLoading 
  } = useUsageLimits();
  const { planType, getUpgradeMessage } = useFeatureAccess();
  
  // Study preferences hook (allowAll for "all papers" option)
  const {
    selectedPaper,
    selectedUnit,
    selectedDifficulty,
    setSelectedPaper,
    setSelectedUnit,
    setSelectedDifficulty,
    papers,
    availableUnits,
    loading: prefsLoading,
  } = useStudyPreferences({ allowAll: true });
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showImporter, setShowImporter] = useState(false);
  const [importAttempted, setImportAttempted] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [requiredTier, setRequiredTier] = useState<"pro" | "elite">("pro");
  const [topicMastery, setTopicMastery] = useState<Record<string, { mastery: number; total: number; goodCount: number }>>({});

  // Filters
  const [shuffleMode, setShuffleMode] = useState(false);
  const [peekMode, setPeekMode] = useState(false);

  // Get unique values for filters
  const availablePaperCodes = Array.from(new Set(flashcards.map((f) => f.paper_code))).sort();
  const units = Array.from(new Set(flashcards.map((f) => f.unit_title))).sort();
  const difficulties = ["Easy", "Medium", "Hard"];
  
  // No manual initialization needed - handled by useStudyPreferences hook

  useEffect(() => {
    fetchFlashcards();
    if (user) {
      fetchTopicMastery();
    }
  }, [user]);

  useEffect(() => {
    // Auto-import flashcards if none exist
    const autoImport = async () => {
      if (showImporter && !loading && !importAttempted) {
        setImportAttempted(true);
        try {
          console.log("Auto-importing flashcards...");
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-flashcards`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
            }
          );

          const result = await response.json();
          console.log("Import result:", result);

          if (response.ok && result.imported > 0) {
            toast.success(`Successfully imported ${result.imported} flashcards!`);
            await fetchFlashcards();
          } else {
            toast.error("Failed to import flashcards. Please try again.");
          }
        } catch (error) {
          console.error("Auto-import failed:", error);
          toast.error("Failed to import flashcards. Please refresh the page.");
        }
      }
    };

    autoImport();
  }, [showImporter, loading, importAttempted]);

  useEffect(() => {
    applyFilters();
    if (user) {
      fetchTopicMastery();
    }
  }, [flashcards, selectedPaper, selectedUnit, selectedDifficulty, shuffleMode, user]);

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

    if (selectedPaper && selectedPaper !== "all") {
      filtered = filtered.filter((f) => f.paper_code === selectedPaper);
    }

    if (selectedUnit && selectedUnit !== "all") {
      // Check if selectedUnit looks like a unit code (e.g., "FA05")
      const isUnitCode = /^[A-Z]+\d+$/.test(selectedUnit);
      
      if (isUnitCode) {
        // Look up the unit title from availableUnits
        const matchingUnit = availableUnits.find(u => u.unit_code === selectedUnit);
        const unitTitle = matchingUnit?.unit_title;
        
        if (unitTitle) {
          // Filter by the actual unit title
          filtered = filtered.filter((f) => f.unit_title === unitTitle);
        } else {
          // Fallback: try fuzzy matching against unit_title
          filtered = filtered.filter((f) => 
            f.unit_title?.toLowerCase().includes(selectedUnit.toLowerCase())
          );
        }
      } else {
        // Filter by exact unit title match
        filtered = filtered.filter((f) => f.unit_title === selectedUnit);
      }
    }

    if (selectedDifficulty && selectedDifficulty !== "all") {
      filtered = filtered.filter((f) => f.difficulty === selectedDifficulty);
    }

    // Apply shuffle if enabled
    if (shuffleMode) {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    setFilteredCards(filtered);
    setCurrentIndex(0);
  };

  const handleRate = async (rating: "again" | "hard" | "good" | "easy") => {
    if (!user) return;

    // Check if user can use more flashcards
    if (!canUseFlashcard) {
      const upgradeInfo = getUpgradeMessage("Unlimited Flashcards");
      setRequiredTier(upgradeInfo.tier as "pro" | "elite");
      setShowPaywall(true);
      return;
    }

    const card = filteredCards[currentIndex];

    // Map ratings to XP and correctness
    const xpMap = { again: 0, hard: 1, good: 2, easy: 3 };
    const correctMap = { again: 0, hard: 0, good: 1, easy: 1 };
    const xpGain = xpMap[rating];
    const isCorrect = correctMap[rating];

    try {
      // Increment usage counter
      await incrementFlashcardUsage();
      
      // Award XP
      if (xpGain > 0) {
        await awardXP("flashcard_session_10", xpGain);
      }

      // Get existing review to increment counts
      const { data: existingReview } = await supabase
        .from("flashcard_reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("flashcard_id", card.id)
        .single();

      // Update or create flashcard review with cumulative counts
      await supabase.from("flashcard_reviews").upsert(
        {
          user_id: user.id,
          flashcard_id: card.id,
          total_reviews: (existingReview?.total_reviews || 0) + 1,
          correct_count: (existingReview?.correct_count || 0) + isCorrect,
          last_reviewed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,flashcard_id",
        }
      );

      // Update topic mastery
      const unit = card.unit_title || "Other";
      setTopicMastery((prev) => {
        const current = prev[unit] || { mastery: 0, total: 0, goodCount: 0 };
        const newGoodCount = current.goodCount + isCorrect;
        const newTotal = current.total + 1;
        const newMastery = newTotal > 0 ? (newGoodCount / newTotal) * 100 : 0;
        return {
          ...prev,
          [unit]: { mastery: newMastery, total: newTotal, goodCount: newGoodCount },
        };
      });

      if (xpGain > 0) {
        toast.success(`${rating === "easy" ? "Excellent!" : "Good!"} +${xpGain} XP`);
      }
      
      // Auto-advance to next card
      handleNext();
    } catch (error) {
      console.error("Error marking flashcard as learned:", error);
    }
  };

  const fetchTopicMastery = async () => {
    if (!user?.id) return;

    try {
      const { data: reviews } = await supabase
        .from("flashcard_reviews")
        .select("flashcard_id, total_reviews, correct_count")
        .eq("user_id", user.id);

      if (!reviews) return;

      const { data: cards } = await supabase
        .from("flashcards")
        .select("id, unit_title")
        .eq("paper_code", selectedPaper !== "all" ? selectedPaper : undefined);

      if (!cards) return;

      const masteryByTopic: Record<string, { mastery: number; total: number; goodCount: number }> = {};
      
      cards.forEach((card) => {
        const review = reviews.find((r) => r.flashcard_id === card.id);
        const unit = card.unit_title || "Other";
        
        if (!masteryByTopic[unit]) {
          masteryByTopic[unit] = { mastery: 0, total: 0, goodCount: 0 };
        }
        
        if (review) {
          masteryByTopic[unit].total += review.total_reviews || 0;
          masteryByTopic[unit].goodCount += review.correct_count || 0;
        }
      });

      Object.keys(masteryByTopic).forEach((unit) => {
        const { total, goodCount } = masteryByTopic[unit];
        masteryByTopic[unit].mastery = total > 0 ? (goodCount / total) * 100 : 0;
      });

      setTopicMastery(masteryByTopic);
    } catch (error) {
      console.error("Error fetching topic mastery:", error);
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

  if (loading || prefsLoading) {
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

              {!importAttempted ? (
                <>
                  {/* Loading Spinner */}
                  <div className="py-6">
                    <div className="mx-auto w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>

                  {/* Progress Text */}
                  <p className="text-sm text-[#94A3B8]">
                    Setting up 500+ flashcards across all ACCA papers
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">Import Failed</p>
                  <p className="text-sm text-[#94A3B8] mb-4">
                    Unable to import flashcards. Please try again.
                  </p>
                  <Button 
                    onClick={() => {
                      setImportAttempted(false);
                      setShowImporter(true);
                    }}
                    variant="outline"
                  >
                    Retry Import
                  </Button>
                </>
              )}
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

          {/* Topic Mastery Grid */}
          {Object.keys(topicMastery).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Topic Mastery Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(topicMastery)
                    .sort(([, a], [, b]) => a.mastery - b.mastery)
                    .map(([topic, data]) => {
                      const color =
                        data.mastery >= 70
                          ? "bg-emerald-500"
                          : data.mastery >= 40
                          ? "bg-yellow-500"
                          : "bg-destructive";
                      const textColor =
                        data.mastery >= 70
                          ? "text-emerald-700"
                          : data.mastery >= 40
                          ? "text-yellow-700"
                          : "text-destructive";
                      return (
                        <div key={topic} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{topic}</span>
                            <span className={`text-xs font-semibold ${textColor}`}>
                              {data.mastery.toFixed(0)}%
                            </span>
                          </div>
                          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${color} transition-all duration-500`}
                              style={{ width: `${data.mastery}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {data.goodCount} correct / {data.total} reviews
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filter Flashcards
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={shuffleMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShuffleMode(!shuffleMode)}
                  >
                    {shuffleMode ? "Shuffle ON" : "Shuffle OFF"}
                  </Button>
                  <Button
                    variant={peekMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeekMode(!peekMode)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {peekMode ? "Peek ON" : "Peek OFF"}
                  </Button>
                </div>
              </div>
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
                        <SelectItem key={paper.id} value={paper.paper_code}>
                          {paper.paper_code} - {paper.title}
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

              {!usageLoading && planType === "free" && (
                <>
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Free Plan:</strong> {remainingFlashcards} of 10 daily flashcards remaining
                    </AlertDescription>
                  </Alert>
                  {remainingFlashcards === 0 && (
                    <UpgradeNudge
                      type="flashcard-limit"
                      message="You're on a roll – unlock unlimited flashcards with Pro."
                      tier="pro"
                      variant="inline"
                      className="mt-4"
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Flashcard - check if formula type */}
          {filteredCards[currentIndex].source_type === "formula" ? (
            <FormulaFlashcard
              flashcard={filteredCards[currentIndex]}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onRate={handleRate}
              currentIndex={currentIndex}
              totalCards={filteredCards.length}
              peekMode={peekMode}
            />
          ) : (
            <FlashcardFlipCard
              flashcard={filteredCards[currentIndex]}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onRate={handleRate}
              hasNext={currentIndex < filteredCards.length - 1}
              hasPrevious={currentIndex > 0}
              currentIndex={currentIndex}
              totalCards={filteredCards.length}
              peekMode={peekMode}
            />
          )}
        </div>
      </div>
      <Footer />
      <PaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature="Unlimited Flashcards"
        requiredTier={requiredTier}
      />
    </>
  );
}
