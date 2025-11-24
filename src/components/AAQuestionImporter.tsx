import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

export function AAQuestionImporter() {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-aa-questions");

      if (error) throw error;

      setStatus("success");
      setImportedCount(data?.imported || 0);
      toast({
        title: "Import Successful",
        description: `${data?.imported || 0} AA questions imported successfully.`,
      });
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import AA questions",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>{importedCount} AA questions imported successfully</span>
        </div>
      )}
      
      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          <span>Import failed. Please try again.</span>
        </div>
      )}
      
      <p className="text-sm text-muted-foreground">
        Import Audit and Assurance (AA) multiple-choice questions covering all syllabus units including audit framework, planning, internal controls, and audit evidence.
      </p>
      
      <Button
        onClick={handleImport}
        disabled={importing || status === "success"}
        className="w-full"
      >
        {importing ? "Importing..." : status === "success" ? "Already Imported" : "Import AA Questions"}
      </Button>
    </div>
  );
}
