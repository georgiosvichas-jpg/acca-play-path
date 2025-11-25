import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface QuestionReview {
  id: string;
  question_id: string;
  last_reviewed_at: string;
  next_review_at: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  times_seen: number;
  times_correct: number;
  times_incorrect: number;
}

// SM-2 Algorithm Implementation
const calculateNextReview = (
  quality: number, // 0-5 scale (0=complete fail, 5=perfect)
  easeFactor: number,
  intervalDays: number,
  repetitions: number
): { easeFactor: number; intervalDays: number; repetitions: number } => {
  // Update ease factor (minimum 1.3)
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  let newIntervalDays: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0;
    newIntervalDays = 1;
  } else {
    // Passed
    newRepetitions = repetitions + 1;
    
    if (newRepetitions === 1) {
      newIntervalDays = 1;
    } else if (newRepetitions === 2) {
      newIntervalDays = 6;
    } else {
      newIntervalDays = Math.round(intervalDays * newEaseFactor);
    }
  }

  return {
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    repetitions: newRepetitions,
  };
};

export function useSpacedRepetition() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const recordReview = useCallback(async (questionId: string, isCorrect: boolean) => {
    if (!user) return;

    try {
      // Fetch existing review
      const { data: existingReview } = await supabase
        .from("question_reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("question_id", questionId)
        .maybeSingle();

      // Convert correctness to quality (0-5 scale)
      // Correct = 4 (good), Incorrect = 1 (barely remembered)
      const quality = isCorrect ? 4 : 1;

      if (existingReview) {
        // Update existing review
        const { easeFactor, intervalDays, repetitions } = calculateNextReview(
          quality,
          existingReview.ease_factor,
          existingReview.interval_days,
          existingReview.repetitions
        );

        const nextReviewAt = new Date();
        nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

        await supabase
          .from("question_reviews")
          .update({
            last_reviewed_at: new Date().toISOString(),
            next_review_at: nextReviewAt.toISOString(),
            ease_factor: easeFactor,
            interval_days: intervalDays,
            repetitions: repetitions,
            times_seen: existingReview.times_seen + 1,
            times_correct: existingReview.times_correct + (isCorrect ? 1 : 0),
            times_incorrect: existingReview.times_incorrect + (isCorrect ? 0 : 1),
          })
          .eq("id", existingReview.id);
      } else {
        // Create new review
        const { easeFactor, intervalDays, repetitions } = calculateNextReview(
          quality,
          2.5, // Default ease factor
          1,   // Default interval
          0    // Initial repetitions
        );

        const nextReviewAt = new Date();
        nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

        await supabase.from("question_reviews").insert({
          user_id: user.id,
          question_id: questionId,
          last_reviewed_at: new Date().toISOString(),
          next_review_at: nextReviewAt.toISOString(),
          ease_factor: easeFactor,
          interval_days: intervalDays,
          repetitions: repetitions,
          times_seen: 1,
          times_correct: isCorrect ? 1 : 0,
          times_incorrect: isCorrect ? 0 : 1,
        });
      }
    } catch (error) {
      console.error("Error recording review:", error);
    }
  }, [user]);

  const getDueReviews = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("question_reviews")
        .select("question_id")
        .eq("user_id", user.id)
        .lte("next_review_at", new Date().toISOString())
        .order("next_review_at", { ascending: true });

      if (error) throw error;

      return data?.map(r => r.question_id) || [];
    } catch (error) {
      console.error("Error fetching due reviews:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getReviewStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("question_reviews")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const now = new Date();
      const dueCount = data?.filter(r => new Date(r.next_review_at) <= now).length || 0;
      const totalReviewed = data?.length || 0;
      const avgAccuracy = data?.length
        ? (data.reduce((sum, r) => sum + (r.times_correct / r.times_seen) * 100, 0) / data.length)
        : 0;

      return {
        dueCount,
        totalReviewed,
        avgAccuracy: avgAccuracy.toFixed(1),
      };
    } catch (error) {
      console.error("Error fetching review stats:", error);
      return null;
    }
  }, [user]);

  const getTopicMastery = useCallback(async (paper: string) => {
    if (!user) return [];

    try {
      // Get all reviews with question details
      const { data: reviews, error } = await supabase
        .from("question_reviews")
        .select("*, question:sb_questions!inner(unit_code, paper)")
        .eq("user_id", user.id)
        .eq("question.paper", paper);

      if (error) throw error;

      // Group by unit_code and calculate mastery
      const unitMap = new Map();
      reviews?.forEach((review: any) => {
        const unitCode = review.question.unit_code || "Other";
        if (!unitMap.has(unitCode)) {
          unitMap.set(unitCode, {
            unitCode,
            totalSeen: 0,
            totalCorrect: 0,
            avgEaseFactor: 0,
            dueCount: 0,
            count: 0,
          });
        }

        const unit = unitMap.get(unitCode);
        unit.totalSeen += review.times_seen;
        unit.totalCorrect += review.times_correct;
        unit.avgEaseFactor += review.ease_factor;
        unit.count += 1;

        const now = new Date();
        if (new Date(review.next_review_at) <= now) {
          unit.dueCount += 1;
        }
      });

      // Calculate mastery percentage for each unit
      return Array.from(unitMap.values()).map(unit => {
        const accuracy = unit.totalSeen > 0 ? (unit.totalCorrect / unit.totalSeen) * 100 : 0;
        const avgEase = unit.count > 0 ? unit.avgEaseFactor / unit.count : 2.5;
        
        // Mastery formula: combination of accuracy and ease factor
        const mastery = Math.min(100, (accuracy * 0.7) + ((avgEase - 1.3) / (3.0 - 1.3) * 100 * 0.3));
        
        return {
          ...unit,
          accuracy: accuracy.toFixed(1),
          avgEaseFactor: avgEase.toFixed(2),
          mastery: mastery.toFixed(0),
          status: mastery < 40 ? 'struggling' : mastery < 70 ? 'learning' : 'mastered',
        };
      }).sort((a, b) => parseFloat(a.mastery) - parseFloat(b.mastery));
    } catch (error) {
      console.error("Error fetching topic mastery:", error);
      return [];
    }
  }, [user]);

  const getStreakData = useCallback(async () => {
    if (!user) return { currentStreak: 0, dailyTarget: 10, reviewedToday: 0 };

    try {
      // Get today's reviews
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("question_reviews")
        .select("last_reviewed_at")
        .eq("user_id", user.id)
        .gte("last_reviewed_at", today.toISOString());

      if (error) throw error;

      const reviewedToday = data?.length || 0;

      // Calculate streak (simplified - would need dedicated table in production)
      // For now, just return today's count
      return {
        currentStreak: reviewedToday > 0 ? 1 : 0,
        dailyTarget: 10,
        reviewedToday,
      };
    } catch (error) {
      console.error("Error fetching streak data:", error);
      return { currentStreak: 0, dailyTarget: 10, reviewedToday: 0 };
    }
  }, [user]);

  const recordBatchReviews = useCallback(async (
    questions: Array<{ questionId: string; isCorrect: boolean }>
  ) => {
    for (const q of questions) {
      await recordReview(q.questionId, q.isCorrect);
    }
  }, [recordReview]);

  return {
    recordReview,
    recordBatchReviews,
    getDueReviews,
    getReviewStats,
    getTopicMastery,
    getStreakData,
    loading,
  };
}
