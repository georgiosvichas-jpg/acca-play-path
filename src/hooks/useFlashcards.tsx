import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Flashcard {
  id: string;
  paper_code: string;
  question: string;
  answer: string;
  category: string | null;
  difficulty: string | null;
  xp: number;
}

export function useFlashcards(paperCode?: string | null) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      let query = supabase.from("flashcards").select("*");

      if (paperCode) {
        query = query.eq("paper_code", paperCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching flashcards:", error);
      } else {
        // Shuffle the flashcards
        const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
      }
      setLoading(false);
    };

    fetchFlashcards();
  }, [paperCode]);

  return { flashcards, loading };
}
