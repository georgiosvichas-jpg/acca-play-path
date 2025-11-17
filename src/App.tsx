import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import BadgesReal from "./components/BadgesReal";
import Analytics from "./components/Analytics";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Planner from "./pages/Planner";
import PracticeQuiz from "./pages/PracticeQuiz";
import MockExam from "./pages/MockExam";
import SpacedRepetition from "./pages/SpacedRepetition";
import QuestionBrowser from "./pages/QuestionBrowser";
import QuestionAnalytics from "./pages/QuestionAnalytics";
import ProgressTracking from "./pages/ProgressTracking";
import StudyPath from "./pages/StudyPath";
import Navigation from "./components/Navigation";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import StudyBuddyOnboarding from "./components/StudyBuddyOnboarding";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import XPConfettiWrapper from "./components/XPConfettiWrapper";
import FlashcardsContentNew from "./components/FlashcardsContentNew";
import Coach from "./pages/Coach";
import Progress from "./pages/Progress";
import GuidedTour from "./components/GuidedTour";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <XPConfettiWrapper />
        <GuidedTour />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <StudyBuddyOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigation />
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <Navigation />
                <FlashcardsContentNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <BadgesReal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Navigation />
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Navigation />
                <Planner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute>
                <Coach />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice-quiz"
            element={
              <ProtectedRoute>
                <Navigation />
                <PracticeQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-exam"
            element={
              <ProtectedRoute>
                <MockExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spaced-repetition"
            element={
              <ProtectedRoute>
                <SpacedRepetition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question-browser"
            element={
              <ProtectedRoute>
                <Navigation />
                <QuestionBrowser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question-analytics"
            element={
              <ProtectedRoute>
                <Navigation />
                <QuestionAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress-tracking"
            element={
              <ProtectedRoute>
                <Navigation />
                <ProgressTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-path"
            element={
              <ProtectedRoute>
                <Navigation />
                <StudyPath />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-failure"
            element={
              <ProtectedRoute>
                <PaymentFailure />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
