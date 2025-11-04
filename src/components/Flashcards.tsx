import ProtectedRoute from "./ProtectedRoute";
import FlashcardsContent from "./FlashcardsContent";

export default function Flashcards() {
  return (
    <ProtectedRoute>
      <FlashcardsContent />
    </ProtectedRoute>
  );
}
