import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MockConfig {
  mock_id: string;
  paper_code: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  pass_mark_percentage: number;
  easy_ratio?: number;
  medium_ratio?: number;
  hard_ratio?: number;
  unit_scope?: string[];
  description?: string;
  sections_json?: any;
}

export const useMockConfigs = (paperCode?: string) => {
  return useQuery({
    queryKey: ["mock-configs", paperCode],
    queryFn: async () => {
      let query = supabase
        .from("mock_config")
        .select("*")
        .order("title");

      if (paperCode) {
        query = query.eq("paper_code", paperCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching mock configs:", error);
        throw error;
      }

      return (data || []) as MockConfig[];
    },
    enabled: !!paperCode, // Only fetch when paper is selected
  });
};
