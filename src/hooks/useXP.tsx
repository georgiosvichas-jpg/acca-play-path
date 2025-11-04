import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserProfile } from "./useUserProfile";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "./use-window-size";

export const XP_MAPPING = {
  onboarding_complete: 10,
  first_session_created: 5,
  session_completed: 15,
  flashcard_session_10: 10,
  flashcard_session_bonus: 5,
  analytics_view: 3,
  streak_3days: 20,
  level_up_bonus: 10,
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0,    // Level 1: 0-99 XP
  100,  // Level 2: 100-299 XP
  300,  // Level 3: 300-699 XP
  700,  // Level 4: 700-1199 XP
  1200, // Level 5: 1200+ XP
];

export function useXP() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getNextLevelXP = (currentLevel: number): number => {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 500;
    }
    return LEVEL_THRESHOLDS[currentLevel];
  };

  const getCurrentLevelProgress = (xp: number, level: number): number => {
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = getNextLevelXP(level);
    const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const checkAndAwardBadges = useCallback(async (newXP: number, eventType: string) => {
    if (!user) return;

    try {
      // Fetch all badges
      const { data: badges } = await supabase
        .from("badges")
        .select("*");

      if (!badges) return;

      // Fetch user's earned badges
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id);

      const earnedBadgeIds = userBadges?.map((ub) => ub.badge_id) || [];

      // Check XP-based badges
      for (const badge of badges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let shouldAward = false;

        if (badge.criteria_type === "xp_total" && newXP >= badge.criteria_value) {
          shouldAward = true;
        } else if (badge.criteria_type === "onboarding" && eventType === "onboarding_complete") {
          shouldAward = true;
        }

        if (shouldAward) {
          await supabase
            .from("user_badges")
            .insert({ user_id: user.id, badge_id: badge.id });

          toast.success(`🏆 Badge Unlocked: ${badge.badge_name}`, {
            description: badge.description,
            duration: 5000,
          });

          // Bonus XP for milestone badges
          if (badge.badge_name === "ACCA Rising Star") {
            await awardXP("milestone_bonus", 50);
          }
        }
      }
    } catch (error) {
      console.error("Error checking badges:", error);
    }
  }, [user]);

  const awardXP = useCallback(async (eventType: string, customXP?: number) => {
    if (!user || !profile) return;

    const xpValue = customXP || XP_MAPPING[eventType as keyof typeof XP_MAPPING] || 0;
    
    if (xpValue === 0) return;

    try {
      const newTotalXP = (profile.total_xp || 0) + xpValue;
      const oldLevel = calculateLevel(profile.total_xp || 0);
      const newLevel = calculateLevel(newTotalXP);

      // Log XP event
      await supabase
        .from("xp_events")
        .insert({
          user_id: user.id,
          event_type: eventType,
          xp_value: xpValue,
        });

      // Update profile
      await updateProfile({
        total_xp: newTotalXP,
        level: newLevel,
      });

      // Show toast
      toast.success(`+${xpValue} XP earned!`, {
        description: eventType.replace(/_/g, " "),
        duration: 3000,
      });

      // Check for level up
      if (newLevel > oldLevel) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);

        toast.success(`🎉 Level Up! You're now Level ${newLevel}`, {
          description: `You've earned ${XP_MAPPING.level_up_bonus} bonus XP!`,
          duration: 5000,
        });

        // Award level-up bonus
        await supabase
          .from("xp_events")
          .insert({
            user_id: user.id,
            event_type: "level_up_bonus",
            xp_value: XP_MAPPING.level_up_bonus,
          });

        await updateProfile({
          total_xp: newTotalXP + XP_MAPPING.level_up_bonus,
        });
      }

      // Check badges
      await checkAndAwardBadges(newTotalXP, eventType);
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  }, [user, profile, updateProfile, checkAndAwardBadges]);

  const currentLevel = calculateLevel(profile?.total_xp || 0);
  const nextLevelXP = getNextLevelXP(currentLevel);
  const progress = getCurrentLevelProgress(profile?.total_xp || 0, currentLevel);

  return {
    awardXP,
    currentLevel,
    currentXP: profile?.total_xp || 0,
    nextLevelXP,
    progress,
    showConfetti,
    ConfettiComponent: showConfetti ? (
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
      />
    ) : null,
  };
}
