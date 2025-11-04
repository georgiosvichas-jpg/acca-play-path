import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function FlashcardImporter() {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);

  const handleImport = async () => {
    setImporting(true);
    setStatus("idle");
    
    try {
      // Fetch the CSV file
      const response = await fetch("/data/acca_flashcards_dataset.csv");
      if (!response.ok) throw new Error("Failed to fetch CSV file");
      
      const csvData = await response.text();
      
      toast.info("Importing flashcards...", { description: "This may take a minute" });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("import-flashcards", {
        body: { csvData },
      });

      if (error) throw error;

      if (data.success) {
        setImportedCount(data.imported);
        setStatus("success");
        toast.success(`Successfully imported ${data.imported} flashcards!`);
      }
    } catch (error) {
      console.error("Import error:", error);
      setStatus("error");
      toast.error("Failed to import flashcards", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Import ACCA Flashcards
        </CardTitle>
        <CardDescription>
          Import the complete ACCA flashcard dataset (526 cards) into your study library
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "success" && (
          <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="text-sm">
              <strong>Import Complete!</strong>
              <p className="text-muted-foreground">
                Successfully imported {importedCount} flashcards. You can now start studying!
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div className="text-sm">
              <strong>Import Failed</strong>
              <p className="text-muted-foreground">
                There was an error importing the flashcards. Please try again.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">What will be imported:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>526 ACCA flashcards covering all papers</li>
            <li>Questions and answers for mini-problems</li>
            <li>Organized by paper, unit, and difficulty</li>
            <li>Each card awards +1 XP when completed</li>
          </ul>
        </div>

        <Button
          onClick={handleImport}
          disabled={importing || status === "success"}
          className="w-full"
          size="lg"
        >
          {importing ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Importing Flashcards...
            </>
          ) : status === "success" ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Import Complete
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import Flashcards Dataset
            </>
          )}
        </Button>

        {status === "success" && (
          <p className="text-xs text-center text-muted-foreground">
            Refresh the flashcards page to see your imported cards
          </p>
        )}
      </CardContent>
    </Card>
  );
}
