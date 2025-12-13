import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2 } from "lucide-react";
import { useStudyPreferences } from "@/hooks/useStudyPreferences";

interface Question {
  id: string;
  paper: string;
  unit_code: string | null;
  type: string;
  difficulty: string | null;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string | null;
}

export default function QuestionBrowser() {
  const {
    selectedPaper: paper,
    selectedUnit: unitCode,
    selectedDifficulty: difficulty,
    setSelectedPaper: setPaper,
    setSelectedUnit: setUnitCode,
    setSelectedDifficulty: setDifficulty,
    papers,
    availableUnits,
    getUnitDisplayName,
    loading: prefsLoading,
  } = useStudyPreferences();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (paper) {
      fetchQuestions();
    }
  }, [paper]);

  useEffect(() => {
    applyFilters();
  }, [questions, unitCode, difficulty, searchTerm]);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sb_questions")
      .select("*")
      .eq("paper", paper)
      .order("unit_code")
      .order("difficulty");

    if (!error && data) {
      setQuestions(data as Question[]);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...questions];

    if (unitCode !== "all") {
      filtered = filtered.filter(q => q.unit_code === unitCode);
    }

    if (difficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const getDifficultyColor = (diff: string | null) => {
    switch (diff) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // Helper to get unit display name for a unit_code
  const getUnitNameForCode = (unitCodeVal: string | null) => {
    if (!unitCodeVal) return null;
    const unit = availableUnits.find(u => u.unit_code === unitCodeVal);
    return unit ? getUnitDisplayName(unit) : unitCodeVal;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Question Browser</h1>
        <p className="text-muted-foreground">Browse and search through question banks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Paper</Label>
              <Select value={paper} onValueChange={setPaper} disabled={prefsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={prefsLoading ? "Loading papers..." : "Select a paper"} />
                </SelectTrigger>
                <SelectContent>
                  {papers.map((p) => (
                    <SelectItem key={p.id} value={p.paper_code}>
                      {p.title} ({p.paper_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unitCode} onValueChange={setUnitCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.unit_code}>
                      {unit.unit_code} - {getUnitDisplayName(unit)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading questions...</div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedQuestion(q)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      {q.unit_code && (
                        <Badge variant="outline">
                          {q.unit_code} - {getUnitNameForCode(q.unit_code)}
                        </Badge>
                      )}
                      {q.difficulty && (
                        <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2">{q.question}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex gap-2 mb-2">
              {selectedQuestion?.unit_code && (
                <Badge variant="outline">
                  {selectedQuestion.unit_code} - {getUnitNameForCode(selectedQuestion.unit_code)}
                </Badge>
              )}
              {selectedQuestion?.difficulty && (
                <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                  {selectedQuestion.difficulty}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-lg">{selectedQuestion?.question}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="font-semibold">Options:</p>
              {selectedQuestion?.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    idx === selectedQuestion.correct_option_index
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                    <span className="flex-1">{option}</span>
                    {idx === selectedQuestion.correct_option_index && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedQuestion?.explanation && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">Explanation:</p>
                <p className="text-sm">{selectedQuestion.explanation}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
