import ProtectedRoute from "@/components/ProtectedRoute";
import ProgressPage from "@/components/ProgressPage";
import Footer from "@/components/Footer";

export default function Progress() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <ProgressPage />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}