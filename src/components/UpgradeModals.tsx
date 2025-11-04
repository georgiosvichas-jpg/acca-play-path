import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Lock, TrendingUp, Award, Sparkles } from "lucide-react";

interface FlashcardUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlockPaper: () => void;
  onUpgradeToPro: () => void;
}

export function FlashcardUnlockModal({
  open,
  onOpenChange,
  onUnlockPaper,
  onUpgradeToPro,
}: FlashcardUnlockModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 animate-fade-in">
        <div className="p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              You've mastered your free flashcards!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Continue your progress with unlimited flashcards and mini-problems for this paper.
              Upgrade now and unlock full access to the planner, analytics, and XP rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Flashcards unlocked</span>
              <span className="font-medium">10/100</span>
            </div>
            <Progress value={10} className="h-2" />
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={onUnlockPaper}
              className="w-full h-12 text-base bg-[#00A67E] hover:bg-[#009A72] text-white"
            >
              Unlock this paper (€9 one-time)
            </Button>
            <Button
              onClick={onUpgradeToPro}
              variant="outline"
              className="w-full h-12 text-base border-2"
            >
              Get all papers with Pro (€19/month)
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Keep using free plan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PaperUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperTitle?: string;
  onUnlockPaper: () => void;
  onUpgradeToPro: () => void;
}

export function PaperUnlockModal({
  open,
  onOpenChange,
  paperTitle,
  onUnlockPaper,
  onUpgradeToPro,
}: PaperUnlockModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 animate-fade-in">
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-[#00A67E]/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#00A67E]" />
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              This paper is locked.
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Unlock this paper to access the full syllabus, interactive flashcards, and progress tracking.
              Choose whether to unlock just one paper or go Pro for unlimited access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Button
              onClick={onUnlockPaper}
              className="w-full h-12 text-base bg-[#00A67E] hover:bg-[#009A72] text-white"
            >
              Unlock one paper (€9)
            </Button>
            <Button
              onClick={onUpgradeToPro}
              variant="outline"
              className="w-full h-12 text-base border-2"
            >
              Go Pro for all papers (€19/month)
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              No hidden fees. Your progress always stays saved.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AnalyticsUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgradeToPro: () => void;
}

export function AnalyticsUpgradeModal({
  open,
  onOpenChange,
  onUpgradeToPro,
}: AnalyticsUpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 animate-fade-in relative overflow-hidden">
        {/* Blurred chart preview background */}
        <div className="absolute inset-0 opacity-5">
          <TrendingUp className="w-full h-full p-12" />
        </div>

        <div className="p-6 space-y-4 relative z-10">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-[#00A67E]/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-[#00A67E]" />
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              See how ready you really are.
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Track your performance, XP, and exam readiness with advanced analytics.
              Pro users get personalized insights and full history tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Button
              onClick={onUpgradeToPro}
              className="w-full h-12 text-base bg-[#00A67E] hover:bg-[#009A72] text-white"
            >
              Upgrade to Pro (€19/month)
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full h-12 text-base border-2"
            >
              Keep using free plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface NextLevelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgradeToPro: (isAnnual: boolean) => void;
}

export function NextLevelModal({
  open,
  onOpenChange,
  onUpgradeToPro,
}: NextLevelModalProps) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 animate-fade-in relative overflow-hidden">
        {/* Confetti effect background */}
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute top-4 left-4 w-6 h-6 text-[#00A67E] animate-pulse" />
          <Award className="absolute top-8 right-8 w-8 h-8 text-[#00A67E] animate-pulse delay-100" />
          <Sparkles className="absolute bottom-12 left-12 w-5 h-5 text-[#00A67E] animate-pulse delay-200" />
          <Sparkles className="absolute bottom-8 right-6 w-7 h-7 text-[#00A67E] animate-pulse delay-300" />
        </div>

        <div className="p-6 space-y-4 relative z-10">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-[#00A67E]/10 flex items-center justify-center">
              <Award className="w-8 h-8 text-[#00A67E]" />
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              You're ready for your next challenge.
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              You've completed your current paper — now keep your momentum going.
              Go Pro to unlock all papers, maintain your streak, and track your overall readiness.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 py-2">
            <span className={`text-sm ${!isAnnual ? "font-semibold" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-[#00A67E]"
            />
            <span className={`text-sm ${isAnnual ? "font-semibold" : "text-muted-foreground"}`}>
              Annual <span className="text-[#00A67E]">(save 20%)</span>
            </span>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => onUpgradeToPro(isAnnual)}
              className="w-full h-12 text-base bg-[#00A67E] hover:bg-[#009A72] text-white"
            >
              Go Pro ({isAnnual ? "€180/year" : "€19/month"})
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full h-12 text-base border-2"
            >
              Stay with current paper
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
