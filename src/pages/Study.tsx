import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Brain } from "lucide-react";
import PracticeQuiz from "./PracticeQuiz";
import QuestionBrowser from "./QuestionBrowser";
import SpacedRepetition from "./SpacedRepetition";

export default function Study() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Study Hub</h1>
            <p className="text-muted-foreground">Practice, review, and explore questions</p>
          </div>

          <Tabs defaultValue="practice" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Practice
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Review
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Browse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="practice">
              <PracticeQuiz />
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
