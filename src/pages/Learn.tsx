import { useSearchParams } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, BookOpen, Route } from "lucide-react";
import FlashcardsContentNew from "@/components/FlashcardsContentNew";
import QuestionBrowser from "./QuestionBrowser";
import StudyPath from "./StudyPath";

export default function Learn() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "flashcards";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Learn</h1>
            <p className="text-muted-foreground">Build knowledge through flashcards and guided study paths</p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Flashcards</span>
                <span className="sm:hidden">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Browse</span>
              </TabsTrigger>
              <TabsTrigger value="path" className="flex items-center gap-2">
                <Route className="w-4 h-4" />
                <span className="hidden sm:inline">AI Path</span>
                <span className="sm:hidden">Path</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards">
              <FlashcardsContentNew />
            </TabsContent>

            <TabsContent value="browse">
              <QuestionBrowser />
            </TabsContent>

            <TabsContent value="path">
              <StudyPath />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
