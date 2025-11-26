import { useSearchParams } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Target, Bookmark } from "lucide-react";
import ProgressDashboard from "@/components/ProgressDashboard";
import FocusAreas from "@/components/FocusAreas";
import Bookmarks from "./Bookmarks";

export default function ProgressNew() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "dashboard";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Progress</h1>
            <p className="text-muted-foreground">Track your performance and focus on what matters</p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="focus" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Focus Areas</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <ProgressDashboard />
            </TabsContent>

            <TabsContent value="focus">
              <FocusAreas />
            </TabsContent>

            <TabsContent value="saved">
              <Bookmarks />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
