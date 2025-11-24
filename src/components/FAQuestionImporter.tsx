import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function FAQuestionImporter() {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);

  const handleImport = async () => {
    setImporting(true);
    setStatus("idle");
    setImportedCount(0);

    try {
      // Call edge function - it will fetch the JSON from public storage
      const { data, error } = await supabase.functions.invoke("import-fa-questions");

      if (error) throw error;

      if (data.success) {
        const { summary } = data;
        const total = summary.inserted_count + summary.updated_count;
        
        if (total === 0 && summary.skipped_count > 0) {
          toast.warning(`All ${summary.total_questions} questions were skipped. Check console for errors.`);
          setStatus("error");
        } else if (summary.skipped_count > 0) {
          toast.success(`Imported ${total} FA questions (${summary.inserted_count} new, ${summary.updated_count} updated). ${summary.skipped_count} skipped.`);
          setStatus("success");
          setImportedCount(total);
        } else {
          toast.success(`Successfully imported ${total} FA questions (${summary.inserted_count} new, ${summary.updated_count} updated)!`);
          setStatus("success");
          setImportedCount(total);
        }
        
        if (data.skipped?.length > 0) {
          console.log("Skipped questions:", data.skipped);
        }
      } else {
        throw new Error(data.error || "Import failed");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import FA questions. Please try again.");
      setStatus("error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {status === "success" && importedCount > 0 && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>Successfully imported {importedCount} questions</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Import failed. Please check console for details.</span>
        </div>
      )}

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Upload the FA question bank JSON file to import:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All FA MCQ questions with auto-generated IDs</li>
          <li>Organized by unit codes (FA01-FA10)</li>
          <li>Automatic field mapping and normalization</li>
          <li>Difficulty levels converted to uppercase</li>
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
        ) : (
          "Import FA Questions"
        )}
      </Button>
    </div>
  );
}
