import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function FAQuestionImporter() {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);
  const [skippedErrors, setSkippedErrors] = useState<any[]>([]);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatus("idle");
    setImportedCount(0);
    setSkippedErrors([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const fileContent = await file.text();
      const parsed = JSON.parse(fileContent);
      
      const allQuestions = Array.isArray(parsed) ? parsed : parsed.questions || [];
      if (allQuestions.length === 0) {
        throw new Error("No questions found in file");
      }

      const CHUNK_SIZE = 10;
      const totalChunks = Math.ceil(allQuestions.length / CHUNK_SIZE);
      
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      const allErrors: any[] = [];

      for (let i = 0; i < allQuestions.length; i += CHUNK_SIZE) {
        const chunk = allQuestions.slice(i, i + CHUNK_SIZE);
        const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
        
        toast.info(`Processing batch ${chunkNum} of ${totalChunks}...`);
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-fa-questions`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ questions: chunk, chunk_offset: i }),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed at batch ${chunkNum}: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data?.success) {
          totalInserted += data.summary.inserted_count || 0;
          totalUpdated += data.summary.updated_count || 0;
          totalSkipped += data.summary.skipped_count || 0;
          if (data.skipped?.length > 0) {
            allErrors.push(...data.skipped);
          }
        }
      }

      const total = totalInserted + totalUpdated;
      setImportedCount(total);
      setSkippedErrors(allErrors);
      setStatus("success");
      
      if (total === 0 && totalSkipped > 0) {
        toast.warning(`All ${allQuestions.length} questions were skipped. Check error log below.`);
      } else if (totalSkipped > 0) {
        toast.success(`Imported ${total} FA questions (${totalInserted} new, ${totalUpdated} updated). ${totalSkipped} skipped.`);
        console.log("Skipped questions:", allErrors);
      } else {
        toast.success(`Successfully imported ${total} FA questions (${totalInserted} new, ${totalUpdated} updated)!`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import FA questions");
      setStatus("error");
    } finally {
      setImporting(false);
    }
  };

  const downloadErrorLog = () => {
    const errorLog = skippedErrors.map(err => 
      `External ID: ${err.external_id}\nReason: ${err.error_reason}\n---`
    ).join('\n');
    
    const blob = new Blob([errorLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fa-import-errors-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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

      {skippedErrors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            <span>{skippedErrors.length} questions skipped</span>
          </div>
          <Button
            onClick={downloadErrorLog}
            variant="outline"
            size="sm"
          >
            Download Error Log
          </Button>
          <div className="max-h-60 overflow-y-auto bg-muted p-3 rounded text-xs space-y-2">
            {skippedErrors.slice(0, 10).map((err, idx) => (
              <div key={idx} className="border-b border-border pb-2">
                <div className="font-semibold">ID: {err.external_id}</div>
                <div className="text-muted-foreground">{err.error_reason}</div>
              </div>
            ))}
            {skippedErrors.length > 10 && (
              <div className="text-muted-foreground italic">
                ...and {skippedErrors.length - 10} more (download full log)
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Select the FA question bank JSON file to import:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Processes questions in batches of 10 for reliability</li>
          <li>Auto-generates missing external IDs</li>
          <li>Validates against FA syllabus units</li>
          <li>Normalizes field formats automatically</li>
        </ul>
      </div>

      <div className="space-y-2">
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={importing || status === "success"}
          className="hidden"
          id="fa-question-upload"
        />
        <Button
          onClick={() => document.getElementById("fa-question-upload")?.click()}
          disabled={importing || status === "success"}
          className="w-full"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            "Upload FA Question Bank JSON"
          )}
        </Button>
      </div>
    </div>
  );
}
