import { Trophy } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useXP } from "@/hooks/useXP";

export default function XPDisplay() {
  const { profile } = useUserProfile();
  const { currentLevel, currentXP, nextLevelXP, progress } = useXP();

  if (!profile) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
        <Trophy className="w-4 h-4 text-primary" />
        <div className="text-sm font-semibold text-foreground">
          Level {currentLevel}
        </div>
        <div className="text-xs text-muted-foreground">
          {currentXP} XP
        </div>
      </div>
      
      <div className="hidden md:block w-32">
        <div className="text-xs text-muted-foreground mb-1">
          {currentXP} / {nextLevelXP} XP
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
