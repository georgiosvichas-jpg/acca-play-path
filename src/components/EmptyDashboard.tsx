import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles, PlayCircle, Zap, BarChart3, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmptyDashboard() {
  const navigate = useNavigate();
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  const handleStartFlashcards = () => {
    navigate("/flashcards");
  };

  const handleStartTodaySession = () => {
    // Will integrate with StudyBuddy API later
    navigate("/flashcards");
  };

  const handleQuickDrill = () => {
    // Will integrate with StudyBuddy API later
    navigate("/flashcards");
  };

  const handleViewAnalytics = () => {
    navigate("/analytics");
  };

  const handleUpgradeToPremium = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-b from-[#F8FBFA] to-[#EAF8F4] p-4">
      <Card className="max-w-2xl w-full shadow-lg animate-fade-in rounded-3xl">
        <CardContent className="pt-12 pb-10 px-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-[#0F172A]">
              Your Study Dashboard is ready
            </h1>
            <p className="text-base text-[#475569] max-w-xl mx-auto leading-relaxed">
              We're generating your personalized ACCA plan based on your selected papers and
              goals. It will update automatically as you study and complete flashcards.
            </p>
          </div>

          {/* Illustration placeholder - Simple mockup visual */}
          <div className="py-6">
            <div className="max-w-md mx-auto bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-primary/20 rounded w-3/4" />
                  <div className="h-3 bg-primary/10 rounded w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-primary/20 rounded w-2/3" />
                  <div className="h-3 bg-primary/10 rounded w-1/3" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-primary/20 rounded w-4/5" />
                  <div className="h-3 bg-primary/10 rounded w-2/5" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleStartTodaySession}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Start Today's Session</h3>
                  <p className="text-sm text-muted-foreground">Begin your personalized study plan</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleQuickDrill}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Take a Quick Drill</h3>
                  <p className="text-sm text-muted-foreground">Practice with quick questions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleViewAnalytics}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track your progress and insights</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleUpgradeToPremium}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground">Unlock all features and papers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-[#94A3B8] pt-2">
            You'll start earning XP and insights after your first practice session.
          </p>
        </CardContent>
      </Card>

      {/* Features Modal */}
      <Dialog open={showFeaturesModal} onOpenChange={setShowFeaturesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Study Buddy Features</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Everything you need to master your ACCA exams
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A] mb-1">Smart Flashcards</h3>
                <p className="text-sm text-[#475569]">
                  Practice with AI-powered flashcards tailored to your selected papers. Track your
                  progress and earn XP with every session.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A] mb-1">Study Planner</h3>
                <p className="text-sm text-[#475569]">
                  Your personalized study schedule adapts to your goals, time availability, and
                  exam dates automatically.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A] mb-1">Progress Analytics</h3>
                <p className="text-sm text-[#475569]">
                  Track your study streaks, XP growth, and readiness scores. See exactly where you
                  stand before exam day.
                </p>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button className="w-full" size="lg" onClick={handleStartFlashcards}>
              Start with Flashcards
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
