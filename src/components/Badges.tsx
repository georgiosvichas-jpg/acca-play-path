import ProtectedRoute from "./ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Flame,
  Target,
  Zap,
  Star,
  Award,
  Lock,
  Sparkles,
} from "lucide-react";
import badgesHero from "@/assets/badges-hero.png";
import Footer from "./Footer";

const unlockedBadges = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first study session",
    icon: Target,
    earned: true,
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Week Warrior",
    description: "Maintain a 7-day study streak",
    icon: Flame,
    earned: true,
    date: "Today",
  },
  {
    id: 3,
    name: "Quick Learner",
    description: "Complete 50 flashcards",
    icon: Zap,
    earned: true,
    date: "Yesterday",
  },
];

const lockedBadges = [
  {
    id: 4,
    name: "Consistency Hero",
    description: "Maintain a 30-day study streak",
    icon: Star,
    earned: false,
    progress: 23,
    total: 30,
  },
  {
    id: 5,
    name: "Exam Warrior",
    description: "Pass your first ACCA paper",
    icon: Trophy,
    earned: false,
    progress: 67,
    total: 100,
  },
  {
    id: 6,
    name: "Master Scholar",
    description: "Complete all 13 ACCA papers",
    icon: Award,
    earned: false,
    progress: 1,
    total: 13,
  },
];

export default function Badges() {
  const totalXP = 1250;
  const nextLevel = 1630;
  const currentLevel = 5;

  return (
    <ProtectedRoute>
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-8">
            <img
              src={badgesHero}
              alt="Achievements"
              className="w-full max-w-sm mx-auto animate-bounce-soft"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
            Your Achievements
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrate every milestone. Each badge represents your dedication to becoming an ACCA professional.
          </p>
        </div>

        {/* XP Progress Card */}
        <Card className="p-8 mb-12 shadow-card card-float animate-slide-up bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center animate-bounce-soft">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Level {currentLevel}</p>
                <h2 className="text-3xl font-display font-bold mb-1">{totalXP} XP</h2>
                <p className="text-sm text-muted-foreground">
                  {nextLevel - totalXP} XP to Level {currentLevel + 1}
                </p>
              </div>
            </div>
            <div className="w-full md:w-96">
              <Progress value={(totalXP / nextLevel) * 100} className="h-4 mb-2" />
              <p className="text-sm text-right text-muted-foreground">
                {Math.round((totalXP / nextLevel) * 100)}% to next level
              </p>
            </div>
          </div>
        </Card>

        {/* Unlocked Badges */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Earned Badges ({unlockedBadges.length})
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {unlockedBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <Card
                  key={badge.id}
                  className="p-6 shadow-card card-float text-center animate-scale-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
                  
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center animate-bounce-soft">
                      <Icon className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {badge.description}
                    </p>
                    <Badge className="bg-accent/20 text-accent rounded-lg">
                      Earned {badge.date}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Locked Badges */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-muted-foreground" />
            In Progress ({lockedBadges.length})
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {lockedBadges.map((badge, index) => {
              const Icon = badge.icon;
              const progress = (badge.progress / badge.total) * 100;
              
              return (
                <Card
                  key={badge.id}
                  className="p-6 shadow-card card-float text-center animate-scale-in opacity-75 hover:opacity-100 transition-opacity"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center relative">
                    <Icon className="w-10 h-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-muted/50 rounded-2xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {badge.description}
                  </p>
                  <div>
                    <Progress value={progress} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {badge.progress} / {badge.total}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </ProtectedRoute>
  );
}
