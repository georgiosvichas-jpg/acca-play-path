import ProtectedRoute from "@/components/ProtectedRoute";
import CoachChat from "@/components/CoachChat";
import Footer from "@/components/Footer";

export default function Coach() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <CoachChat />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}