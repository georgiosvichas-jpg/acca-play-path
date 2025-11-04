import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface StudySession {
  id: string;
  user_id: string;
  paper_code: string;
  syllabus_unit_id: string | null;
  session_date: string;
  start_time: string | null;
  duration_minutes: number;
  completed: boolean;
  completed_at: string | null;
  xp_earned: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useStudySessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("session_date", { ascending: true });

    if (error) {
      console.error("Error fetching study sessions:", error);
      toast.error("Failed to load study sessions");
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const createSession = async (sessionData: Partial<StudySession>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("study_sessions")
      .insert([{
        user_id: user.id,
        paper_code: sessionData.paper_code || "",
        session_date: sessionData.session_date || new Date().toISOString().split('T')[0],
        start_time: sessionData.start_time || null,
        duration_minutes: sessionData.duration_minutes || 60,
        syllabus_unit_id: sessionData.syllabus_unit_id || null,
        notes: sessionData.notes || null,
        completed: false,
        xp_earned: 0,
      } as any])
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create study session");
      throw error;
    }

    setSessions((prev) => [...prev, data]);
    toast.success("Study session scheduled");
    return data;
  };

  const completeSession = async (sessionId: string) => {
    if (!user) return;

    const xpEarned = 25; // Base XP for completing a session

    const { error } = await supabase
      .from("study_sessions")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete session");
      throw error;
    }

    // Update user XP
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("total_xp")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      await supabase
        .from("user_profiles")
        .update({ total_xp: (profile.total_xp || 0) + xpEarned })
        .eq("user_id", user.id);
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              completed: true,
              completed_at: new Date().toISOString(),
              xp_earned: xpEarned,
            }
          : s
      )
    );

    toast.success(`Session completed! +${xpEarned} XP`);
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("study_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
      throw error;
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success("Session deleted");
  };

  return {
    sessions,
    loading,
    createSession,
    completeSession,
    deleteSession,
    refetch: fetchSessions,
  };
}
