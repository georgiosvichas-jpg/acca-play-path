import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePapers } from "@/hooks/usePapers";
import { Loader2, Upload, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormulaCardImporter from "@/components/FormulaCardImporter";

interface ImportSummary {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface ImportError {
  row: number;
  error: string;
  data: string;
}

interface MockConfigPreview {
  paper_code: string;
  duration_minutes: number;
  total_questions: number;
  pass_mark_percentage: number;
}

interface SyllabusUnitPreview {
  unit_code: string;
  unit_name: string;
  parent_unit_code: string | null;
  unit_level: string;
}

interface FAQuestionImportResult {
  success: boolean;
  summary: {
    total_questions: number;
    inserted_count: number;
    updated_count: number;
    skipped_count: number;
  };
  skipped: Array<{ external_id: string; error_reason: string }>;
  skipped_details?: Array<{ external_id: string; error_reason: string }>;
  total_questions?: number;
  inserted_count?: number;
  updated_count?: number;
  skipped_count?: number;
}

interface FlashcardGenerationResult {
  success: boolean;
  summary: {
    total_generated: number;
    inserted: number;
    skipped_duplicates: number;
  };
  preview: Array<{
    unit_code: string;
    unit_name: string;
    front: string;
    back: string;
    tag: string;
  }>;
}

interface MiniTestBuildResult {
  success: boolean;
  summary: {
    tests_created: number;
    questions_per_test: Record<string, number>;
    errors: string[];
  };
}

interface MockConfigImportResult {
  success: boolean;
  summary: {
    configs_created: number;
    configs_updated: number;
  };
  preview: Array<{
    paper_code: string;
    duration_minutes: number;
    total_questions: number;
    pass_mark_percentage: number;
    sections: any[];
  }>;
}

export default function AdminContentImport() {
  const { toast } = useToast();
  const { papers } = usePapers();
  
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [mockFile, setMockFile] = useState<File | null>(null);
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [syllabusSummary, setSyllabusSummary] = useState<ImportSummary | null>(null);
  const [syllabusErrors, setSyllabusErrors] = useState<ImportError[]>([]);
  const [mockSummary, setMockSummary] = useState<ImportSummary | null>(null);
  const [mockErrors, setMockErrors] = useState<ImportError[]>([]);
  const [mockConfigs, setMockConfigs] = useState<MockConfigPreview[]>([]);
  const [syllabusUnits, setSyllabusUnits] = useState<SyllabusUnitPreview[]>([]);
  
  // Unified Question Import State
  const [selectedPaper, setSelectedPaper] = useState("");
  const [questionContent, setQuestionContent] = useState<any[]>([]);
  const [questionFileName, setQuestionFileName] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionResult, setQuestionResult] = useState<FAQuestionImportResult | null>(null);
  
  // Content Tools Paper Selection
  const [flashcardPaper, setFlashcardPaper] = useState("");
  const [minitestPaper, setMinitestPaper] = useState("");
  const [mockConfigPaper, setMockConfigPaper] = useState("");
  
  const [flashcardGenerating, setFlashcardGenerating] = useState(false);
  const [flashcardResult, setFlashcardResult] = useState<FlashcardGenerationResult | null>(null);
  const [minitestBuilding, setMinitestBuilding] = useState(false);
  const [minitestResult, setMinitestResult] = useState<MiniTestBuildResult | null>(null);
  const [mockConfigImporting, setMockConfigImporting] = useState(false);
  const [mockConfigResult, setMockConfigResult] = useState<MockConfigImportResult | null>(null);

  const handleSyllabusImport = async () => {
    if (!syllabusFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setSyllabusLoading(true);
    setSyllabusSummary(null);
    setSyllabusErrors([]);
    setSyllabusUnits([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", syllabusFile);

      const response = await supabase.functions.invoke("import-syllabus-units", {
        body: formData,
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      setSyllabusSummary(result.summary);
      setSyllabusErrors(result.errors || []);
      setSyllabusUnits(result.units || []);

      toast({
        title: "Import completed",
        description: `${result.summary.inserted} inserted, ${result.summary.updated} updated, ${result.summary.skipped} skipped`,
      });
    } catch (error) {
      console.error("Error importing syllabus units:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSyllabusLoading(false);
    }
  };

  const handleMockImport = async () => {
    if (!mockFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setMockLoading(true);
    setMockSummary(null);
    setMockErrors([]);
    setMockConfigs([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", mockFile);

      const response = await supabase.functions.invoke("import-mock-config", {
        body: formData,
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      setMockSummary(result.summary);
      setMockErrors(result.errors || []);
      setMockConfigs(result.configs || []);

      toast({
        title: "Import completed",
        description: `${result.summary.inserted} inserted, ${result.summary.updated} updated, ${result.summary.skipped} skipped`,
      });
    } catch (error) {
      console.error("Error importing mock config:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setMockLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!flashcardPaper) {
      toast({
        title: "No Paper Selected",
        description: "Please select a paper before generating flashcards",
        variant: "destructive",
      });
      return;
    }

    setFlashcardGenerating(true);
    setFlashcardResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      toast({
        title: "Generating flashcards",
        description: `AI is analyzing ${flashcardPaper} content. This may take a few minutes...`,
      });

      const response = await supabase.functions.invoke("generate-flashcards", {
        body: { paper_code: flashcardPaper },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data as FlashcardGenerationResult;
      setFlashcardResult(result);

      toast({
        title: "Generation completed",
        description: `${result.summary.inserted} flashcards created, ${result.summary.skipped_duplicates} duplicates skipped`,
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setFlashcardGenerating(false);
    }
  };

  const handleBuildMinitests = async () => {
    if (!minitestPaper) {
      toast({
        title: "No Paper Selected",
        description: "Please select a paper before building mini tests",
        variant: "destructive",
      });
      return;
    }

    setMinitestBuilding(true);
    setMinitestResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      toast({
        title: "Building mini tests",
        description: `Processing templates and selecting ${minitestPaper} questions...`,
      });

      // Load template file for the selected paper
      const templateResponse = await fetch(`/data/${minitestPaper.toLowerCase()}_assessment_templates.json`);
      if (!templateResponse.ok) {
        throw new Error(`No assessment templates found for ${minitestPaper}`);
      }
      const templateData = await templateResponse.json();

      const response = await supabase.functions.invoke("build-minitests", {
        body: { 
          paper_code: minitestPaper,
          mini_tests: templateData.mini_tests 
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data as MiniTestBuildResult;
      setMinitestResult(result);

      toast({
        title: "Mini tests created",
        description: `${result.summary.tests_created} tests built successfully`,
      });
    } catch (error) {
      console.error("Error building mini tests:", error);
      toast({
        title: "Build failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setMinitestBuilding(false);
    }
  };

  const handleImportMockConfig = async () => {
    if (!mockConfigPaper) {
      toast({
        title: "No Paper Selected",
        description: "Please select a paper before importing mock config",
        variant: "destructive",
      });
      return;
    }

    setMockConfigImporting(true);
    setMockConfigResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      toast({
        title: "Importing mock config",
        description: `Processing ${mockConfigPaper} mock exam templates...`,
      });

      // Fetch templates from public folder for the selected paper
      const templateResponse = await fetch(`/data/${mockConfigPaper.toLowerCase()}_assessment_templates.json`);
      if (!templateResponse.ok) {
        throw new Error(`No assessment templates found for ${mockConfigPaper}`);
      }
      const templateData = await templateResponse.json();

      // Pass templates to edge function
      const response = await supabase.functions.invoke("import-mock-config", {
        body: { 
          paper_code: mockConfigPaper,
          mock_exams: templateData.mock_exams 
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data as MockConfigImportResult;
      setMockConfigResult(result);

      const action = result.summary.configs_updated > 0 ? "updated" : "created";
      toast({
        title: "Mock config imported",
        description: `${mockConfigPaper} mock exam configuration ${action} successfully`,
      });
    } catch (error) {
      console.error("Error importing mock config:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setMockConfigImporting(false);
    }
  };

  const handleSyllabusFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSyllabusFile(file);
    }
  };

  const handleQuestionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedPaper) {
      toast({
        title: "No Paper Selected",
        description: "Please select a paper before importing questions",
        variant: "destructive",
      });
      return;
    }

    setQuestionFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let questionsArray: any[] = [];
        if (Array.isArray(parsed)) {
          questionsArray = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          questionsArray = parsed.questions;
        } else {
          throw new Error("Invalid JSON format. Expected array or object with 'questions' array");
        }

        setQuestionContent(questionsArray);
        toast({
          title: "File loaded",
          description: `${questionsArray.length} questions ready to import`,
        });
      } catch (err) {
        console.error("File parse error:", err);
        toast({
          title: "File Parse Failed",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleQuestionImportClick = async () => {
    if (!selectedPaper) {
      toast({
        title: "No Paper Selected",
        description: "Please select a paper before importing questions",
        variant: "destructive",
      });
      return;
    }

    if (questionContent.length === 0) {
      toast({
        title: "No questions loaded",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setQuestionLoading(true);
    setQuestionResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const CHUNK_SIZE = 10;
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      const allSkippedDetails: any[] = [];

      for (let i = 0; i < questionContent.length; i += CHUNK_SIZE) {
        const chunk = questionContent.slice(i, i + CHUNK_SIZE);
        const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
        const totalChunks = Math.ceil(questionContent.length / CHUNK_SIZE);

        toast({
          title: "Importing...",
          description: `Processing batch ${chunkNum} of ${totalChunks} (${Math.round((i / questionContent.length) * 100)}% complete)`,
        });

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            paper_code: selectedPaper,
            questions: chunk,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Import failed: ${errorText}`);
        }

        const result = await response.json();
        totalInserted += result.inserted || 0;
        totalUpdated += result.updated || 0;
        totalSkipped += result.skipped || 0;
        if (result.skipped_details) {
          allSkippedDetails.push(...result.skipped_details);
        }
      }

      setQuestionResult({
        success: true,
        summary: {
          total_questions: questionContent.length,
          inserted_count: totalInserted,
          updated_count: totalUpdated,
          skipped_count: totalSkipped,
        },
        skipped: allSkippedDetails,
        skipped_details: allSkippedDetails,
        total_questions: questionContent.length,
        inserted_count: totalInserted,
        updated_count: totalUpdated,
        skipped_count: totalSkipped,
      });

      toast({
        title: "Import Complete",
        description: `${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped`,
      });
    } catch (err) {
      console.error("Import error:", err);
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setQuestionLoading(false);
    }
  };

  const downloadSkippedQuestions = (skipped: Array<{ external_id: string; error_reason: string }>) => {
    const errorLog = skipped.map(err => 
      `External ID: ${err.external_id}\nReason: ${err.error_reason}\n---`
    ).join('\n');
    
    const blob = new Blob([errorLog], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPaper}_skipped_questions.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Content Import</h1>
        <p className="text-muted-foreground">Import syllabus units and mock exam configurations</p>
      </div>

      {/* Syllabus Units Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import Syllabus Units (CSV)</CardTitle>
          <CardDescription>
            Upload a CSV file with columns: paper_code, unit_code, parent_unit_code, unit_name,
            unit_level, estimated_study_minutes, description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="syllabusFile">CSV File</Label>
            <Input
              id="syllabusFile"
              type="file"
              accept=".csv"
              onChange={handleSyllabusFileChange}
              disabled={syllabusLoading}
            />
          </div>

          <Button
            onClick={handleSyllabusImport}
            disabled={!syllabusFile || syllabusLoading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {syllabusLoading ? "Importing..." : "Import Syllabus Units"}
          </Button>

          {syllabusSummary && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Import Summary:</p>
                  <p>Total Rows: {syllabusSummary.total}</p>
                  <p>Inserted: {syllabusSummary.inserted}</p>
                  <p>Updated: {syllabusSummary.updated}</p>
                  <p>Skipped: {syllabusSummary.skipped}</p>
                  {syllabusErrors && syllabusErrors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        View Errors ({syllabusErrors.length})
                      </summary>
                      <ul className="mt-2 space-y-1 text-xs">
                        {syllabusErrors.slice(0, 10).map((err, i) => (
                          <li key={i}>
                            Row {err.row}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Question Bank Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import Question Bank (JSON)</CardTitle>
          <CardDescription>
            Upload a JSON file to import questions for any paper. Supports all question types (MCQ, MATCHING, NUMERIC, SHORT).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="questionPaper">Paper</Label>
            <Select value={selectedPaper} onValueChange={setSelectedPaper}>
              <SelectTrigger id="questionPaper">
                <SelectValue placeholder="Select paper" />
              </SelectTrigger>
              <SelectContent>
                {papers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.paper_code}>
                    {paper.paper_code} - {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="questionFile">JSON File</Label>
            <Input
              id="questionFile"
              type="file"
              accept=".json"
              onChange={handleQuestionFileChange}
              disabled={questionLoading}
            />
          </div>

          <Button
            onClick={handleQuestionImportClick}
            disabled={!selectedPaper || questionContent.length === 0 || questionLoading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {questionLoading ? "Importing..." : "Import Questions"}
          </Button>

          {questionResult && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Import Summary:</p>
                  <p>Total Questions: {questionResult.total_questions}</p>
                  <p>Inserted: {questionResult.inserted_count}</p>
                  <p>Updated: {questionResult.updated_count}</p>
                  <p>Skipped: {questionResult.skipped_count}</p>
                  {questionResult.skipped_details && questionResult.skipped_details.length > 0 && (
                    <>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-muted-foreground">
                          View Skipped ({questionResult.skipped_details.length})
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs">
                          {questionResult.skipped_details.slice(0, 10).map((skip, i) => (
                            <li key={i}>
                              {skip.external_id}: {skip.error_reason}
                            </li>
                          ))}
                        </ul>
                      </details>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadSkippedQuestions(questionResult.skipped_details)}
                        className="mt-2"
                      >
                        Download Skipped Questions Log
                      </Button>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mock Config Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import Mock Exam Configuration</CardTitle>
          <CardDescription>
            Upload a CSV file to configure mock exams for each paper. Required columns: paper_code, duration_minutes, total_questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mock-file">CSV File</Label>
            <Input
              id="mock-file"
              type="file"
              accept=".csv"
              onChange={(e) => setMockFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleMockImport}
            disabled={!mockFile || mockLoading}
            className="w-full sm:w-auto"
          >
            {mockLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Mock Config
              </>
            )}
          </Button>

          {mockSummary && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Import Summary</div>
                <div className="space-y-1 text-sm">
                  <div>Total rows: {mockSummary.total}</div>
                  <div>Inserted: {mockSummary.inserted}</div>
                  <div>Updated: {mockSummary.updated}</div>
                  <div>Skipped: {mockSummary.skipped}</div>
                  <div>Errors: {mockSummary.errors}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {mockErrors.length > 0 && (
            <div className="space-y-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {mockErrors.length} rows had errors during import
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csv = mockErrors.map(e => `${e.row},${e.error},${e.data}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = "mock-config-import-errors.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Error Log
              </Button>
            </div>
          )}

          {mockConfigs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Imported Configurations</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paper Code</TableHead>
                      <TableHead>Duration (min)</TableHead>
                      <TableHead>Total Questions</TableHead>
                      <TableHead>Pass Mark %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockConfigs.map((config) => (
                      <TableRow key={config.paper_code}>
                        <TableCell className="font-medium">{config.paper_code}</TableCell>
                        <TableCell>{config.duration_minutes}</TableCell>
                        <TableCell>{config.total_questions}</TableCell>
                        <TableCell>{config.pass_mark_percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Generate Flashcards */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Generate Flashcards</CardTitle>
          <CardDescription>
            Use AI to automatically generate flashcards from questions and syllabus units. Creates 5-15 flashcards per unit covering definitions, formulas, concepts, and principles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flashcard-paper">Select Paper</Label>
            <Select value={flashcardPaper} onValueChange={setFlashcardPaper}>
              <SelectTrigger id="flashcard-paper">
                <SelectValue placeholder="Select a paper" />
              </SelectTrigger>
              <SelectContent>
                {papers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.paper_code}>
                    {paper.paper_code} - {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This tool will analyze all syllabus units and questions for the selected paper to generate comprehensive flashcards. The process may take several minutes.
            </p>
          </div>

          <Button
            onClick={handleGenerateFlashcards}
            disabled={flashcardGenerating || !flashcardPaper}
            className="w-full sm:w-auto"
          >
            {flashcardGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Flashcards...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Generate {flashcardPaper || ''} Flashcards
              </>
            )}
          </Button>

          {flashcardResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Generation Summary</div>
                <div className="space-y-1 text-sm">
                  <div>Total generated: {flashcardResult.summary.total_generated}</div>
                  <div>Inserted: {flashcardResult.summary.inserted}</div>
                  <div>Skipped (duplicates): {flashcardResult.summary.skipped_duplicates}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {flashcardResult && flashcardResult.preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Preview (First 10 Flashcards)</h3>
              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Front</TableHead>
                      <TableHead>Back</TableHead>
                      <TableHead>Tag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flashcardResult.preview.map((card, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-xs">
                          {card.unit_code}
                          <div className="text-muted-foreground">{card.unit_name}</div>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{card.front}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{card.back}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                            {card.tag}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Build Mini Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Build Mini Tests</CardTitle>
          <CardDescription>
            Automatically create mini tests from templates by randomly sampling questions from target syllabus units.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minitest-paper">Select Paper</Label>
            <Select value={minitestPaper} onValueChange={setMinitestPaper}>
              <SelectTrigger id="minitest-paper">
                <SelectValue placeholder="Select a paper" />
              </SelectTrigger>
              <SelectContent>
                {papers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.paper_code}>
                    {paper.paper_code} - {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This tool uses assessment templates to create curated mini tests. Each test targets specific units with recommended timing.
            </p>
          </div>

          <Button
            onClick={handleBuildMinitests}
            disabled={minitestBuilding || !minitestPaper}
            className="w-full sm:w-auto"
          >
            {minitestBuilding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Building Tests...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Build {minitestPaper || ''} Mini Tests
              </>
            )}
          </Button>

          {minitestResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Build Summary</div>
                <div className="space-y-1 text-sm">
                  <div>Tests created: {minitestResult.summary.tests_created}</div>
                  {Object.entries(minitestResult.summary.questions_per_test).map(([title, count]) => (
                    <div key={title} className="ml-4">
                      • {title}: {count} questions
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {minitestResult && minitestResult.summary.errors.length > 0 && (
            <div className="space-y-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Warnings/Errors</div>
                  <ul className="text-sm space-y-1">
                    {minitestResult.summary.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Mock Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Import Mock Configuration</CardTitle>
          <CardDescription>
            Import mock exam settings from templates including duration, total questions, and section structure for full mock exams.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mockconfig-paper">Select Paper</Label>
            <Select value={mockConfigPaper} onValueChange={setMockConfigPaper}>
              <SelectTrigger id="mockconfig-paper">
                <SelectValue placeholder="Select a paper" />
              </SelectTrigger>
              <SelectContent>
                {papers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.paper_code}>
                    {paper.paper_code} - {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This tool reads mock exam templates and configures the mock exam system with duration, question count, and sectional breakdown.
            </p>
          </div>

          <Button
            onClick={handleImportMockConfig}
            disabled={mockConfigImporting || !mockConfigPaper}
            className="w-full sm:w-auto"
          >
            {mockConfigImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {mockConfigPaper || ''} Mock Config
              </>
            )}
          </Button>

          {mockConfigResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Import Summary</div>
                <div className="space-y-1 text-sm">
                  <div>Configs created: {mockConfigResult.summary.configs_created}</div>
                  <div>Configs updated: {mockConfigResult.summary.configs_updated}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {mockConfigResult && mockConfigResult.preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Mock Exam Configuration</h3>
              <div className="border rounded-lg p-4 space-y-3">
                {mockConfigResult.preview.map((config, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Paper:</span> {config.paper_code}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {config.duration_minutes} minutes
                      </div>
                      <div>
                        <span className="font-medium">Total Questions:</span> {config.total_questions}
                      </div>
                      <div>
                        <span className="font-medium">Pass Mark:</span> {config.pass_mark_percentage}%
                      </div>
                    </div>
                    
                    {config.sections && config.sections.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium text-sm mb-1">Sections:</div>
                        <div className="space-y-1">
                          {config.sections.map((section: any, sIdx: number) => (
                            <div key={sIdx} className="text-xs bg-muted p-2 rounded">
                              <div className="font-medium">{section.name}</div>
                              <div className="text-muted-foreground">
                                {section.num_questions} questions • Units: {section.focus_units?.join(", ")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formula Card Importer */}
      <FormulaCardImporter />
    </div>
  );
}