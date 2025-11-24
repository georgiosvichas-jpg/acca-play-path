import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [faQuestionFile, setFaQuestionFile] = useState<File | null>(null);
  const [faQuestionLoading, setFaQuestionLoading] = useState(false);
  const [faQuestionResult, setFaQuestionResult] = useState<FAQuestionImportResult | null>(null);
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

  const handleFaQuestionImport = async () => {
    if (!faQuestionFile) {
      toast({
        title: "No file selected",
        description: "Please select a JSON file to import",
        variant: "destructive",
      });
      return;
    }

    setFaQuestionLoading(true);
    setFaQuestionResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", faQuestionFile);

      // Use direct fetch instead of supabase.functions.invoke to avoid content-type issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-fa-questions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: formData, // Let browser set content-type with boundary
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Import failed");
      }

      const result = await response.json() as FAQuestionImportResult;
      setFaQuestionResult(result);

      toast({
        title: "Import completed",
        description: `${result.summary.inserted_count} inserted, ${result.summary.updated_count} updated, ${result.summary.skipped_count} skipped`,
      });
    } catch (error) {
      console.error("Error importing FA questions:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setFaQuestionLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setFlashcardGenerating(true);
    setFlashcardResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      toast({
        title: "Generating flashcards",
        description: "This may take a few minutes. AI is analyzing FA content...",
      });

      const response = await supabase.functions.invoke("generate-fa-flashcards", {
        body: {},
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
    setMinitestBuilding(true);
    setMinitestResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      toast({
        title: "Building mini tests",
        description: "Processing templates and selecting questions...",
      });

      const response = await supabase.functions.invoke("build-fa-minitests", {
        body: {},
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
    setMockConfigImporting(true);
    setMockConfigResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      toast({
        title: "Importing mock config",
        description: "Processing mock exam templates...",
      });

      const response = await supabase.functions.invoke("import-fa-mock-config", {
        body: {},
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data as MockConfigImportResult;
      setMockConfigResult(result);

      const action = result.summary.configs_updated > 0 ? "updated" : "created";
      toast({
        title: "Mock config imported",
        description: `FA mock exam configuration ${action} successfully`,
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

  const downloadErrorLog = (errors: ImportError[], filename: string) => {
    const csv = [
      "Row,Error,Data",
      ...errors.map(e => `${e.row},"${e.error}","${e.data}"`)
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSkippedQuestions = (skipped: Array<{ external_id: string; error_reason: string }>, filename: string) => {
    const json = JSON.stringify(skipped, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
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
          <CardTitle>Import Syllabus Units</CardTitle>
          <CardDescription>
            Upload a CSV file to import or update syllabus units. Required columns: paper_code, unit_code, unit_name, unit_level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="syllabus-file">CSV File</Label>
            <Input
              id="syllabus-file"
              type="file"
              accept=".csv"
              onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleSyllabusImport}
            disabled={!syllabusFile || syllabusLoading}
            className="w-full sm:w-auto"
          >
            {syllabusLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Syllabus Units
              </>
            )}
          </Button>

          {syllabusSummary && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Import Summary</div>
                <div className="space-y-1 text-sm">
                  <div>Total rows: {syllabusSummary.total}</div>
                  <div>Inserted: {syllabusSummary.inserted}</div>
                  <div>Updated: {syllabusSummary.updated}</div>
                  <div>Skipped: {syllabusSummary.skipped}</div>
                  <div>Errors: {syllabusSummary.errors}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {syllabusErrors.length > 0 && (
            <div className="space-y-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {syllabusErrors.length} rows had errors during import
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadErrorLog(syllabusErrors, "syllabus-import-errors.csv")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Error Log
              </Button>
            </div>
          )}

          {syllabusUnits.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Imported Syllabus Units</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Code</TableHead>
                      <TableHead>Unit Name</TableHead>
                      <TableHead>Parent Unit</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syllabusUnits.map((unit) => (
                      <TableRow key={unit.unit_code}>
                        <TableCell className="font-medium">{unit.unit_code}</TableCell>
                        <TableCell>{unit.unit_name}</TableCell>
                        <TableCell>{unit.parent_unit_code || '-'}</TableCell>
                        <TableCell>{unit.unit_level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
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
                onClick={() => downloadErrorLog(mockErrors, "mock-config-import-errors.csv")}
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

      {/* FA Question Bank Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import FA Question Bank (JSON)</CardTitle>
          <CardDescription>
            Upload a JSON file containing FA questions. The file should contain external_id, unit_code, question_type, stem, options, correct_answer, difficulty, and optional fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fa-question-file">JSON File</Label>
            <Input
              id="fa-question-file"
              type="file"
              accept=".json"
              onChange={(e) => setFaQuestionFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleFaQuestionImport}
            disabled={!faQuestionFile || faQuestionLoading}
            className="w-full sm:w-auto"
          >
            {faQuestionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import FA Questions
              </>
            )}
          </Button>

          {faQuestionResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Import Summary</div>
                <div className="space-y-1 text-sm">
                  <div>Total questions: {faQuestionResult.summary.total_questions}</div>
                  <div>Inserted: {faQuestionResult.summary.inserted_count}</div>
                  <div>Updated: {faQuestionResult.summary.updated_count}</div>
                  <div>Skipped: {faQuestionResult.summary.skipped_count}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {faQuestionResult && faQuestionResult.skipped.length > 0 && (
            <div className="space-y-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {faQuestionResult.skipped.length} questions had errors during import
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadSkippedQuestions(faQuestionResult.skipped, "fa-questions-skipped.json")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Skipped Questions
              </Button>
              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>External ID</TableHead>
                      <TableHead>Error Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faQuestionResult.skipped.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.external_id}</TableCell>
                        <TableCell className="text-sm">{item.error_reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Generate FA Flashcards */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Generate FA Flashcards</CardTitle>
          <CardDescription>
            Use AI to automatically generate flashcards from FA questions and syllabus units. Creates 5-15 flashcards per unit covering definitions, formulas, concepts, and principles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This tool will analyze all FA syllabus units and questions to generate comprehensive flashcards. The process may take several minutes.
            </p>
          </div>

          <Button
            onClick={handleGenerateFlashcards}
            disabled={flashcardGenerating}
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
                Generate FA Flashcards
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

      {/* Auto-Build FA Mini Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Build FA Mini Tests</CardTitle>
          <CardDescription>
            Automatically create mini tests from templates by randomly sampling questions from target syllabus units. Creates 3 tests covering different FA topics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This tool uses fa_assessment_templates.json to create curated mini tests. Each test targets specific units and includes 10 questions with recommended timing.
            </p>
          </div>

          <Button
            onClick={handleBuildMinitests}
            disabled={minitestBuilding}
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
                Build FA Mini Tests
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

      {/* Import FA Mock Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Import FA Mock Configuration</CardTitle>
          <CardDescription>
            Import mock exam settings from templates including duration, total questions, and section structure for full FA mock exams.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This tool reads FA mock exam templates and configures the mock exam system with duration, question count, and sectional breakdown.
            </p>
          </div>

          <Button
            onClick={handleImportMockConfig}
            disabled={mockConfigImporting}
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
                Import FA Mock Config
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
    </div>
  );
}