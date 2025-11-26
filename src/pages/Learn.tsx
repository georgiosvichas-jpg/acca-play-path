import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Layers } from "lucide-react";
import FlashcardsContentNew from "@/components/FlashcardsContentNew";

export default function Learn() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Learn</h1>
            <p className="text-muted-foreground">Master concepts through active recall</p>
          </div>

          <FlashcardsContentNew />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
