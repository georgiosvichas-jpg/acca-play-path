import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function BTQuestionImporter() {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);

  const handleImport = async () => {
    setImporting(true);
    setStatus("idle");

    try {
      // Fetch the JSON file from public folder
      const response = await fetch("/data/bt_question_bank.json");
      if (!response.ok) {
        throw new Error("Failed to fetch question bank file");
      }
      
      const questions = await response.json();
      console.log(`Loaded ${questions.length} questions from file`);

      // Send to edge function
      const { data, error } = await supabase.functions.invoke("import-bt-questions", {
        body: { questions },
      });

      if (error) throw error;

      if (data.alreadyExists) {
        toast.info("BT questions already imported");
        setStatus("success");
        setImportedCount(0);
      } else {
        toast.success(`Successfully imported ${data.count} BT questions!`);
        setStatus("success");
        setImportedCount(data.count);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import BT questions. Please try again.");
      setStatus("error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {status === "success" && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>
            {importedCount > 0
              ? `Successfully imported ${importedCount} questions`
              : "Questions already imported"}
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Import failed. Please check console for details.</span>
        </div>
      )}

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>This will import:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>907 MCQ questions for BT paper</li>
          <li>Questions organized by unit code (BT01-BT16)</li>
          <li>Difficulty levels: easy, medium, hard</li>
          <li>Full explanations for each answer</li>
        </ul>
      </div>

      <Button
        onClick={handleImport}
        disabled={importing || status === "success"}
        className="w-full"
      >
        {importing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : status === "success" ? (
          "Already Imported"
        ) : (
          "Import BT Questions"
        )}
      </Button>
    </div>
  );
}
