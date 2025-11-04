import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type LeaderboardSegment = "global" | "country" | "paper";
export type LeaderboardTimeframe = "all" | "30d" | "7d";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  total_xp: number;
  level: number;
  country: string | null;
  rank: number;
  percentile: number;
  xp_change?: number;
}

export interface UserLeaderboardStats {
  rank_global: number | null;
  rank_country: number | null;
  percentile_global: number | null;
  percentile_country: number | null;
}

export function useLeaderboard(
  segment: LeaderboardSegment = "global",
  timeframe: LeaderboardTimeframe = "all",
  paperCode?: string
) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserLeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    fetchLeaderboard();
  }, [segment, timeframe, paperCode, page]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("user_profiles")
        .select("user_id, display_name, total_xp, level, country")
        .gte("total_xp", 10)
        .eq("is_opted_out_of_leaderboard", false)
        .order("total_xp", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      // Apply segment filters
      if (segment === "country" && user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("country")
          .eq("user_id", user.id)
          .single();

        if (profile?.country) {
          query = query.eq("country", profile.country);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Calculate ranks and percentiles
        const entriesWithRank: LeaderboardEntry[] = data.map((entry, index) => ({
          ...entry,
          display_name: entry.display_name || `Learner-${entry.user_id.slice(0, 4)}`,
          rank: (page - 1) * ITEMS_PER_PAGE + index + 1,
          percentile: 0, // Will be calculated server-side in snapshots
        }));

        setEntries(entriesWithRank);
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("get_user_leaderboard_rank", {
        p_user_id: user.id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setUserStats(data[0]);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const reset = () => {
    setPage(1);
    setHasMore(true);
    setEntries([]);
  };

  return {
    entries,
    userStats,
    loading,
    hasMore,
    loadMore,
    reset,
    refetch: fetchLeaderboard,
  };
}
