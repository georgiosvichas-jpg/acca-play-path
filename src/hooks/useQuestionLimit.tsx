import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";

const FREE_DAILY_LIMIT = 25;

export function useQuestionLimit() {
  const { user } = useAuth();
  const { planType } = useSubscription();
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const isPremium = planType === "pro" || planType === "per_paper";

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUsage = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        const today = new Date().toISOString().split("T")[0];
        const lastReset = (data as any).last_question_reset_date;
        const used = (data as any).daily_questions_used || 0;
        
        // Reset if it's a new day
        if (lastReset !== today) {
          setDailyUsed(0);
        } else {
          setDailyUsed(used);
        }
      }
      setLoading(false);
    };

    fetchUsage();
  }, [user]);

  const canUseQuestions = isPremium || dailyUsed < FREE_DAILY_LIMIT;
  const remaining = isPremium ? Infinity : Math.max(0, FREE_DAILY_LIMIT - dailyUsed);

  return {
    dailyUsed,
    remaining,
    canUseQuestions,
    isPremium,
    loading,
  };
}