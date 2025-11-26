import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./useUserProfile";
import { usePapers } from "./usePapers";

interface UseStudyPreferencesOptions {
  allowAll?: boolean;
  defaultToFirst?: boolean;
}

interface Unit {
  id: string;
  unit_code: string;
  unit_title: string;
  paper_code: string;
}

export function useStudyPreferences(options: UseStudyPreferencesOptions = {}) {
  const { allowAll = false, defaultToFirst = true } = options;
  const [searchParams] = useSearchParams();
  const { profile } = useUserProfile();
  const { papers, loading: papersLoading } = usePapers();

  const [selectedPaper, setSelectedPaper] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [isFromUrl, setIsFromUrl] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);

  // Fetch units when paper changes
  useEffect(() => {
    if (!selectedPaper || selectedPaper === "all") {
      setAvailableUnits([]);
      return;
    }

    const fetchUnits = async () => {
      setUnitsLoading(true);
      try {
        const { data, error } = await supabase
          .from("syllabus_units")
          .select("id, unit_code, unit_title, paper_code")
          .eq("paper_code", selectedPaper)
          .order("unit_code");

        if (error) throw error;
        setAvailableUnits(data || []);
      } catch (error) {
        console.error("Error fetching units:", error);
        setAvailableUnits([]);
      } finally {
        setUnitsLoading(false);
      }
    };

    fetchUnits();
  }, [selectedPaper]);

  // Initialize preferences from URL params > profile > defaults
  useEffect(() => {
    if (papersLoading || papers.length === 0) return;

    // Check URL params first
    const paperParam = searchParams.get("paper");
    const unitParam = searchParams.get("unit");
    const difficultyParam = searchParams.get("difficulty");

    let initialPaper = "";
    let fromUrl = false;

    // Priority 1: URL parameter (for AI Path links)
    if (paperParam && papers.some(p => p.paper_code === paperParam)) {
      initialPaper = paperParam;
      fromUrl = true;
    }
    // Priority 2: Profile preference
    else if (profile?.selected_paper && papers.some(p => p.paper_code === profile.selected_paper)) {
      initialPaper = profile.selected_paper;
    }
    // Priority 3: First paper (if defaultToFirst is true)
    else if (defaultToFirst && papers.length > 0) {
      initialPaper = papers[0].paper_code;
    }
    // Priority 4: "all" (if allowAll is true)
    else if (allowAll) {
      initialPaper = "all";
    }

    setSelectedPaper(initialPaper);
    setIsFromUrl(fromUrl);

    // Initialize unit and difficulty from URL if present
    if (unitParam) {
      setSelectedUnit(unitParam);
    }
    if (difficultyParam) {
      setSelectedDifficulty(difficultyParam);
    }
  }, [papersLoading, papers, profile, searchParams, allowAll, defaultToFirst]);

  // Computed values
  const selectedPapers = selectedPaper === "all" 
    ? papers.map(p => p.paper_code) 
    : [selectedPaper];

  const loading = papersLoading || unitsLoading;

  return {
    // Current selections
    selectedPaper,
    selectedPapers,
    selectedUnit,
    selectedDifficulty,
    
    // Setters
    setSelectedPaper,
    setSelectedUnit,
    setSelectedDifficulty,
    
    // Data
    papers,
    availableUnits,
    
    // State
    loading,
    isFromUrl,
  };
}
