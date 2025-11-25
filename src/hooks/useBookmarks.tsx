import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

interface Bookmark {
  id: string;
  question_id: string;
  source_type: string;
  notes: string | null;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("question_bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (questionId: string): boolean => {
    return bookmarks.some((b) => b.question_id === questionId);
  };

  const addBookmark = async (
    questionId: string,
    sourceType: string,
    notes?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark questions",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.from("question_bookmarks").insert({
        user_id: user.id,
        question_id: questionId,
        source_type: sourceType,
        notes: notes || null,
      });

      if (error) throw error;

      await fetchBookmarks();
      toast({
        title: "Bookmarked",
        description: "Question saved to your bookmarks",
      });
      return true;
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Already Bookmarked",
          description: "This question is already in your bookmarks",
        });
      } else {
        console.error("Error adding bookmark:", error);
        toast({
          title: "Error",
          description: "Failed to bookmark question",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const removeBookmark = async (questionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("question_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", questionId);

      if (error) throw error;

      await fetchBookmarks();
      toast({
        title: "Removed",
        description: "Question removed from bookmarks",
      });
      return true;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleBookmark = async (
    questionId: string,
    sourceType: string,
    notes?: string
  ) => {
    if (isBookmarked(questionId)) {
      return await removeBookmark(questionId);
    } else {
      return await addBookmark(questionId, sourceType, notes);
    }
  };

  return {
    bookmarks,
    loading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refreshBookmarks: fetchBookmarks,
  };
}
