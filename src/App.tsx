import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/CookieConsent";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import BadgesReal from "./components/BadgesReal";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Planner from "./pages/Planner";
import PlannerEnhanced from "./pages/PlannerEnhanced";
import PracticeQuiz from "./pages/PracticeQuiz";
import MockExam from "./pages/MockExam";
import MiniTest from "./pages/MiniTest";
import SpacedRepetition from "./pages/SpacedRepetition";
import QuestionBrowser from "./pages/QuestionBrowser";
import Analytics from "./pages/Analytics";
import Study from "./pages/Study";
import { AppLayout } from "./components/AppLayout";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import OutcomeoOnboarding from "./components/StudyBuddyOnboarding";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import Pricing from "./pages/Pricing";
import XPConfettiWrapper from "./components/XPConfettiWrapper";
import FlashcardsContentNew from "./components/FlashcardsContentNew";
import GuidedTour from "./components/GuidedTour";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Disclaimer from "./pages/Disclaimer";
import Resources from "./pages/Resources";
import PlanningStudies from "./pages/blog/PlanningStudies";
import CommonMistakes from "./pages/blog/CommonMistakes";
import ExamChecklist from "./pages/blog/ExamChecklist";
import ExamTechniques from "./pages/blog/ExamTechniques";
import TimeManagement from "./pages/blog/TimeManagement";
import PaperStrategies from "./pages/blog/PaperStrategies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieConsent />
        <XPConfettiWrapper />
        <GuidedTour />
        <AppLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OutcomeoOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
                  <PlannerEnhanced />
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
            <Route path="/mini-test" element={
              <ProtectedRoute>
                <MiniTest />
              </ProtectedRoute>
            } />
            
            {/* Unified sections */}
            <Route 
              path="/study" 
              element={
                <ProtectedRoute>
                  <Study />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            
            {/* Legacy routes redirect to unified sections */}
            <Route path="/flashcards" element={<Study />} />
            <Route path="/practice-quiz" element={<Study />} />
            <Route path="/question-browser" element={<Study />} />
            <Route path="/spaced-repetition" element={<Study />} />
            <Route path="/question-analytics" element={<Analytics />} />
            <Route path="/progress-tracking" element={<Analytics />} />
            <Route path="/progress" element={<Analytics />} />
            <Route path="/coach" element={<Dashboard />} />
            <Route path="/study-path" element={<PlannerEnhanced />} />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <Pricing />
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
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/blog/planning-studies" element={<PlanningStudies />} />
          <Route path="/blog/common-mistakes" element={<CommonMistakes />} />
          <Route path="/blog/exam-checklist" element={<ExamChecklist />} />
          <Route path="/blog/exam-techniques" element={<ExamTechniques />} />
          <Route path="/blog/time-management" element={<TimeManagement />} />
          <Route path="/blog/paper-strategies" element={<PaperStrategies />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
