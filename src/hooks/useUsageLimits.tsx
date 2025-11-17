import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFeatureAccess } from "./useFeatureAccess";
import { toast } from "@/hooks/use-toast";

interface UsageLimits {
  dailyFlashcardsUsed: number;
  weeklyMocksUsed: number;
  totalMocksCompleted: number;
  canUseFlashcard: boolean;
  canUseMockExam: boolean;
  remainingFlashcards: number;
  remainingMocks: number;
  isLoading: boolean;
}

export function useUsageLimits() {
  const { user } = useAuth();
  const { limits, planType } = useFeatureAccess();
  const [usage, setUsage] = useState<UsageLimits>({
    dailyFlashcardsUsed: 0,
    weeklyMocksUsed: 0,
    totalMocksCompleted: 0,
    canUseFlashcard: true,
    canUseMockExam: true,
    remainingFlashcards: 10,
    remainingMocks: 1,
    isLoading: true,
  });

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsage((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Reset counters if needed
      await supabase.rpc("reset_daily_flashcard_counter");
      await supabase.rpc("reset_weekly_mock_counter");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("daily_flashcards_used, weekly_mocks_used, total_mocks_completed")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const dailyUsed = profile.daily_flashcards_used || 0;
        const weeklyUsed = profile.weekly_mocks_used || 0;
        const totalUsed = profile.total_mocks_completed || 0;

        const canUseFlashcard =
          limits.dailyFlashcards === Infinity || dailyUsed < limits.dailyFlashcards;
        
        let canUseMockExam = true;
        if (planType === "free") {
          canUseMockExam = totalUsed < 1;
        } else if (planType === "pro") {
          canUseMockExam = weeklyUsed < limits.mocksPerWeek;
        }
        // Elite has unlimited mocks

        setUsage({
          dailyFlashcardsUsed: dailyUsed,
          weeklyMocksUsed: weeklyUsed,
          totalMocksCompleted: totalUsed,
          canUseFlashcard,
          canUseMockExam,
          remainingFlashcards:
            limits.dailyFlashcards === Infinity
              ? Infinity
              : Math.max(0, limits.dailyFlashcards - dailyUsed),
          remainingMocks:
            planType === "elite"
              ? Infinity
              : planType === "pro"
              ? Math.max(0, limits.mocksPerWeek - weeklyUsed)
              : Math.max(0, 1 - totalUsed),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
      setUsage((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user, limits, planType]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const incrementFlashcardUsage = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc("reset_daily_flashcard_counter");
      if (error) throw error;

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          daily_flashcards_used: usage.dailyFlashcardsUsed + 1,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await fetchUsage();
      return true;
    } catch (error) {
      console.error("Error incrementing flashcard usage:", error);
      toast({
        title: "Error",
        description: "Failed to track flashcard usage",
        variant: "destructive",
      });
      return false;
    }
  };

  const incrementMockUsage = async () => {
    if (!user) return false;

    try {
      await supabase.rpc("reset_weekly_mock_counter");

      const { error } = await supabase
        .from("user_profiles")
        .update({
          weekly_mocks_used: usage.weeklyMocksUsed + 1,
          total_mocks_completed: usage.totalMocksCompleted + 1,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchUsage();
      return true;
    } catch (error) {
      console.error("Error incrementing mock usage:", error);
      toast({
        title: "Error",
        description: "Failed to track mock exam usage",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    ...usage,
    incrementFlashcardUsage,
    incrementMockUsage,
    refreshUsage: fetchUsage,
  };
}
