import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Paper {
  id: string;
  paper_code: string;
  title: string;
  level: string;
}

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      const { data, error } = await supabase
        .from("papers")
        .select("*")
        .order("paper_code");

      if (error) {
        console.error("Error fetching papers:", error);
      } else {
        setPapers(data || []);
      }
      setLoading(false);
    };

    fetchPapers();
  }, []);

  return { papers, loading };
}
