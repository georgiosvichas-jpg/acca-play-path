import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/CookieConsent";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import BadgesReal from "./components/BadgesReal";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Planner from "./pages/Planner";
import PlannerEnhanced from "./pages/PlannerEnhanced";
import Analytics from "./pages/Analytics";
import Practice from "./pages/Practice";
import Learn from "./pages/Learn";
import ProgressNew from "./pages/ProgressNew";
import { AppLayout } from "./components/AppLayout";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import OutcomeoOnboarding from "./components/StudyBuddyOnboarding";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
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
import MultiPaperDashboard from "./pages/MultiPaperDashboard";
import ExamWeekMode from "./pages/ExamWeekMode";
import AdminContentImport from "./pages/AdminContentImport";

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
            
            {/* Smart Grouping Hub Pages */}
            <Route 
              path="/practice" 
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/learn" 
              element={
                <ProtectedRoute>
                  <Learn />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <ProgressNew />
                </ProtectedRoute>
              }
            />
            
            {/* Legacy routes redirect to new hub pages */}
            <Route path="/study" element={<Navigate to="/practice" replace />} />
            <Route path="/practice-quiz" element={<Navigate to="/practice?tab=quiz" replace />} />
            <Route path="/mock-exam" element={<Navigate to="/practice?tab=mock" replace />} />
            <Route path="/mini-test" element={<Navigate to="/practice?tab=quiz" replace />} />
            <Route path="/flashcards" element={<Navigate to="/learn?tab=flashcards" replace />} />
            <Route path="/question-browser" element={<Navigate to="/learn?tab=browse" replace />} />
            <Route path="/study-path" element={<Navigate to="/planner" replace />} />
            <Route path="/review" element={<Navigate to="/progress?tab=focus" replace />} />
            <Route path="/analytics" element={<Navigate to="/progress?tab=dashboard" replace />} />
            <Route path="/spaced-repetition" element={<Navigate to="/progress?tab=focus" replace />} />
            <Route path="/bookmarks" element={<Navigate to="/progress?tab=saved" replace />} />
            <Route path="/weak-areas" element={<Navigate to="/progress?tab=focus" replace />} />
            <Route path="/question-analytics" element={<Navigate to="/progress?tab=dashboard" replace />} />
            <Route path="/progress-tracking" element={<Navigate to="/progress?tab=dashboard" replace />} />
            <Route path="/coach" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/multi-paper-dashboard"
              element={
                <ProtectedRoute>
                  <MultiPaperDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-week-mode"
              element={
                <ProtectedRoute>
                  <ExamWeekMode />
                </ProtectedRoute>
              }
            />
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
            path="/payment-cancelled"
            element={
              <ProtectedRoute>
                <PaymentCancelled />
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
          <Route
            path="/admin/content-import" 
            element={
              <ProtectedRoute>
                <AdminContentImport />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
