import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Route } from "lucide-react";
import Planner from "./Planner";
import StudyPath from "./StudyPath";

export default function PlannerEnhanced() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Study Planner</h1>
            <p className="text-muted-foreground">Schedule sessions and create your AI-powered study path</p>
          </div>

          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="ai-path" className="flex items-center gap-2">
                <Route className="w-4 h-4" />
                AI Path
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <Planner />
            </TabsContent>

            <TabsContent value="ai-path">
              <StudyPath />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
