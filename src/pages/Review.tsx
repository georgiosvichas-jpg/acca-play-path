import { useSearchParams } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingDown, Bookmark } from "lucide-react";
import SpacedRepetition from "./SpacedRepetition";
import WeakAreas from "./WeakAreas";
import Bookmarks from "./Bookmarks";

export default function Review() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "spaced";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Review</h1>
            <p className="text-muted-foreground">Strengthen retention and address knowledge gaps</p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="spaced" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Spaced Review</span>
                <span className="sm:hidden">Spaced</span>
              </TabsTrigger>
              <TabsTrigger value="weak" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                <span className="hidden sm:inline">Weak Areas</span>
                <span className="sm:hidden">Weak</span>
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Bookmarks</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spaced">
              <SpacedRepetition />
            </TabsContent>

            <TabsContent value="weak">
              <WeakAreas />
            </TabsContent>

            <TabsContent value="bookmarks">
              <Bookmarks />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
