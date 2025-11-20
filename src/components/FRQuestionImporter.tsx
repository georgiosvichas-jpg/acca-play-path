import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle } from "lucide-react";

export function FRQuestionImporter() {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);

  const handleImport = async () => {
    setImporting(true);
    setStatus("idle");

    try {
      const { data, error } = await supabase.functions.invoke("import-fr-questions");

      if (error) throw error;

      if (data.alreadyExists) {
        toast.info("FR questions already imported");
        setStatus("success");
        setImportedCount(0);
      } else {
        toast.success(`Successfully imported ${data.count} FR questions`);
        setStatus("success");
        setImportedCount(data.count);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import FR questions");
      setStatus("error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">FR Questions</h3>
          <p className="text-sm text-muted-foreground">
            Import multiple-choice questions for the FR (Financial Reporting) paper
          </p>
        </div>
        <Button
          onClick={handleImport}
          disabled={importing || status === "success"}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {importing ? "Importing..." : status === "success" ? "Imported" : "Import FR Questions"}
        </Button>
      </div>

      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {importedCount > 0
              ? `Successfully imported ${importedCount} questions`
              : "Questions already exist in database"}
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="w-4 h-4" />
          <span>Failed to import questions. Check console for details.</span>
        </div>
      )}
    </div>
  );
}
