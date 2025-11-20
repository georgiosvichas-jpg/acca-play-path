import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Brain, Target, Layers } from "lucide-react";
import PracticeQuiz from "./PracticeQuiz";
import QuestionBrowser from "./QuestionBrowser";
import SpacedRepetition from "./SpacedRepetition";
import FlashcardsContentNew from "@/components/FlashcardsContentNew";
import MockExam from "./MockExam";

export default function Study() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Study Hub</h1>
            <p className="text-muted-foreground">Practice, review, and explore questions</p>
          </div>

          <Tabs defaultValue="practice" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Practice</span>
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Flashcards</span>
              </TabsTrigger>
              <TabsTrigger value="mock" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Mock</span>
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Review</span>
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Browse</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="practice">
              <PracticeQuiz />
            </TabsContent>

            <TabsContent value="flashcards">
              <FlashcardsContentNew />
            </TabsContent>

            <TabsContent value="mock">
              <MockExam />
            </TabsContent>

            <TabsContent value="review">
              <SpacedRepetition />
            </TabsContent>

            <TabsContent value="browse">
              <QuestionBrowser />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
