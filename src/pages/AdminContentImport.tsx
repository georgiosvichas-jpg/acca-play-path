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
    </div>
  );
}