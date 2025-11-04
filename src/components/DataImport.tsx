import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, CheckCircle } from "lucide-react";

export default function DataImport() {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState({
    papers: false,
    syllabusUnits: false,
    flashcards: false,
    pastPapers: false,
  });

  const sampleData = {
    papers: [
      { paper_code: "BT", title: "Business and Technology", level: "Applied Knowledge" },
      { paper_code: "MA", title: "Management Accounting", level: "Applied Knowledge" },
      { paper_code: "FA", title: "Financial Accounting", level: "Applied Knowledge" },
    ],
    syllabusUnits: [
      {
        paper_code: "BT",
        chapter: "A",
        unit_title: "Business organisation and structure",
        learning_outcome: "Explain the different types of business organisations",
        estimated_minutes: 45,
        priority: "High",
      },
      {
        paper_code: "MA",
        chapter: "A",
        unit_title: "Accounting for management",
        learning_outcome: "Understand the role of management accounting",
        estimated_minutes: 60,
        priority: "High",
      },
    ],
    flashcards: [
      {
        paper_code: "BT",
        question: "What is a stakeholder?",
        answer:
          "A stakeholder is any individual, group, or organization that has an interest in or is affected by an organization's activities. This includes shareholders, employees, customers, suppliers, and the community.",
        category: "Concept",
        difficulty: "Easy",
        xp: 10,
      },
      {
        paper_code: "MA",
        question: "What is the accounting equation?",
        answer:
          "Assets = Liabilities + Equity. This fundamental equation represents the relationship between a company's resources and claims to those resources.",
        category: "Formula",
        difficulty: "Easy",
        xp: 10,
      },
    ],
    pastPapers: [
      { paper_code: "BT", year: 2024, session: "March", note: "Access on ACCA website" },
      { paper_code: "MA", year: 2024, session: "June", note: "Access on ACCA website" },
    ],
  };

  const importData = async () => {
    setImporting(true);

    try {
      // Import Papers
      const { error: papersError } = await supabase.from("papers").insert(sampleData.papers);
      if (papersError && !papersError.message.includes("duplicate")) throw papersError;
      setImported((prev) => ({ ...prev, papers: true }));
      toast.success("Papers imported successfully");

      // Import Syllabus Units
      const { error: unitsError } = await supabase
        .from("syllabus_units")
        .insert(sampleData.syllabusUnits);
      if (unitsError && !unitsError.message.includes("duplicate")) throw unitsError;
      setImported((prev) => ({ ...prev, syllabusUnits: true }));
      toast.success("Syllabus units imported successfully");

      // Import Flashcards
      const { error: flashcardsError } = await supabase
        .from("flashcards")
        .insert(sampleData.flashcards);
      if (flashcardsError && !flashcardsError.message.includes("duplicate"))
        throw flashcardsError;
      setImported((prev) => ({ ...prev, flashcards: true }));
      toast.success("Flashcards imported successfully");

      // Import Past Papers
      const { error: pastPapersError } = await supabase
        .from("past_papers_meta")
        .insert(sampleData.pastPapers);
      if (pastPapersError && !pastPapersError.message.includes("duplicate"))
        throw pastPapersError;
      setImported((prev) => ({ ...prev, pastPapers: true }));
      toast.success("Past papers imported successfully");

      toast.success("All data imported successfully!");
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import ACCA Dataset</CardTitle>
        <CardDescription>
          Import sample data to get started. This includes papers, syllabus units, flashcards, and
          past paper metadata.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              imported.papers ? "bg-primary/10" : "bg-muted/50"
            }`}
          >
            {imported.papers && <CheckCircle className="w-4 h-4 text-primary" />}
            <span className="text-sm">Papers</span>
          </div>
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              imported.syllabusUnits ? "bg-primary/10" : "bg-muted/50"
            }`}
          >
            {imported.syllabusUnits && <CheckCircle className="w-4 h-4 text-primary" />}
            <span className="text-sm">Syllabus Units</span>
          </div>
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              imported.flashcards ? "bg-primary/10" : "bg-muted/50"
            }`}
          >
            {imported.flashcards && <CheckCircle className="w-4 h-4 text-primary" />}
            <span className="text-sm">Flashcards</span>
          </div>
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              imported.pastPapers ? "bg-primary/10" : "bg-muted/50"
            }`}
          >
            {imported.pastPapers && <CheckCircle className="w-4 h-4 text-primary" />}
            <span className="text-sm">Past Papers</span>
          </div>
        </div>

        <Button
          onClick={importData}
          disabled={importing || Object.values(imported).every((v) => v)}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {importing
            ? "Importing..."
            : Object.values(imported).every((v) => v)
            ? "Data Already Imported"
            : "Import Sample Data"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Note: This imports a small sample dataset. For the full ACCA dataset, you would need to
          process the CSV files from the zip archive and import them through the backend.
        </p>
      </CardContent>
    </Card>
  );
}
