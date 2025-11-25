import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, AlertCircle, Calculator } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImportSummary {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
}

interface FormulaCard {
  paper_code: string;
  formula_name: string;
  formula: string;
  breakdown: string[]; // JSON array
  practice_problem: string;
  difficulty: string;
  unit_title?: string;
  category?: string;
}

export default function FormulaCardImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [preview, setPreview] = useState<FormulaCard[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSummary(null);
      setPreview([]);

      // Read file content immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSV = (content: string): FormulaCard[] => {
    const lines = content.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const cards: FormulaCard[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const card: any = {};

      headers.forEach((header, index) => {
        card[header] = values[index];
      });

      // Parse breakdown from JSON string
      try {
        card.breakdown = JSON.parse(card.breakdown || "[]");
      } catch {
        card.breakdown = [];
      }

      cards.push(card as FormulaCard);
    }

    return cards;
  };

  const handleImport = async () => {
    if (!fileContent) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    setSummary(null);
    setPreview([]);

    try {
      const cards = parseCSV(fileContent);
      let inserted = 0;
      let updated = 0;
      let skipped = 0;

      for (const card of cards) {
        // Validate required fields
        if (!card.paper_code || !card.formula_name || !card.formula) {
          skipped++;
          continue;
        }

        // Create answer JSON
        const answerJSON = JSON.stringify({
          formula: card.formula,
          breakdown: card.breakdown || [],
          practice: card.practice_problem || "",
        });

        // Check if card already exists
        const { data: existing } = await supabase
          .from("flashcards")
          .select("id")
          .eq("paper_code", card.paper_code)
          .eq("question", card.formula_name)
          .eq("source_type", "formula")
          .single();

        if (existing) {
          // Update existing
          await supabase
            .from("flashcards")
            .update({
              answer: answerJSON,
              difficulty: card.difficulty || "Medium",
              unit_title: card.unit_title || null,
              category: card.category || "Formula",
            })
            .eq("id", existing.id);
          updated++;
        } else {
          // Insert new
          await supabase.from("flashcards").insert({
            paper_code: card.paper_code,
            question: card.formula_name,
            answer: answerJSON,
            source_type: "formula",
            difficulty: card.difficulty || "Medium",
            unit_title: card.unit_title || null,
            category: card.category || "Formula",
          });
          inserted++;
        }
      }

      setSummary({
        total: cards.length,
        inserted,
        updated,
        skipped,
      });

      setPreview(cards.slice(0, 5));

      toast.success(`Imported ${inserted + updated} formula cards successfully!`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import formula cards");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Formula Card Importer
        </CardTitle>
        <CardDescription>
          Import formula flashcards with step-by-step breakdowns and practice problems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CSV Format Guide */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>CSV Format:</strong> paper_code, formula_name, formula, breakdown (JSON array),
            practice_problem, difficulty, unit_title, category
            <br />
            <strong>Example:</strong> FA, "ROCE Formula", "ROCE = PBIT / Capital Employed × 100%",
            "[\"PBIT = Profit Before Interest and Tax\",\"Capital Employed = Total Assets - Current
            Liabilities\"]", "Calculate ROCE if PBIT is $50,000 and Capital Employed is $200,000",
            Medium, Financial Ratios, Formula
          </AlertDescription>
        </Alert>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="formula-file">Upload CSV File</Label>
          <Input
            id="formula-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {/* Import Button */}
        <Button onClick={handleImport} disabled={!file || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Formula Cards
            </>
          )}
        </Button>

        {/* Import Summary */}
        {summary && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Import Complete!</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Total rows: {summary.total}</li>
                <li>Inserted: {summary.inserted}</li>
                <li>Updated: {summary.updated}</li>
                <li>Skipped: {summary.skipped}</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Preview (First 5 Cards)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paper</TableHead>
                  <TableHead>Formula Name</TableHead>
                  <TableHead>Formula</TableHead>
                  <TableHead>Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((card, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{card.paper_code}</TableCell>
                    <TableCell>{card.formula_name}</TableCell>
                    <TableCell className="font-mono text-xs">{card.formula}</TableCell>
                    <TableCell>{card.difficulty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
