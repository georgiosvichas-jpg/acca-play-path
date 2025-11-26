import { useSearchParams } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Target } from "lucide-react";
import PracticeQuiz from "./PracticeQuiz";
import MockExam from "./MockExam";

export default function Practice() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "quiz";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Practice Mode</h1>
            <p className="text-muted-foreground">Test your knowledge with timed drills and exam simulations</p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Practice Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="mock" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Mock Exam</span>
                <span className="sm:hidden">Mock</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quiz">
              <PracticeQuiz />
            </TabsContent>

            <TabsContent value="mock">
              <MockExam />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
