import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function PMQuestionImporter() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    setImporting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("import-pm-questions");

      if (error) throw error;

      setResult(data);
      toast.success(`Successfully imported ${data.imported} PM questions!`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import PM questions");
      setResult({ error: error.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import PM Questions
        </CardTitle>
        <CardDescription>
          Import Performance Management (PM) questions into the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleImport} 
          disabled={importing}
          className="w-full"
        >
          {importing ? "Importing..." : "Import PM Questions"}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${result.error ? "bg-destructive/10" : "bg-primary/10"}`}>
            {result.error ? (
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Import Failed</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-primary">
                <CheckCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">{result.message}</p>
                  <p className="text-sm">Imported: {result.imported} | Skipped: {result.skipped} | Total: {result.total}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
