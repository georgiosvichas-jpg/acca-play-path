import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useXP } from "@/hooks/useXP";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "./ProtectedRoute";
import Footer from "./Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Trophy, Award, Star, Calendar, CheckCircle2, Brain, Flame, BookOpen } from "lucide-react";
import { format } from "date-fns";

const ICON_MAP: Record<string, any> = {
  BookOpen,
  Award,
  Star,
  Calendar,
  CheckCircle2,
  Brain,
  Trophy,
  Flame,
};

interface Badge {
  id: string;
  badge_name: string;
  description: string;
  criteria_type: string;
  criteria_value: number;
  icon: string;
  tier: string;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

export default function BadgesReal() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { currentLevel, currentXP, nextLevelXP, progress } = useXP();
  const { checkAndAwardBadges } = useBadgeChecker();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      try {
        const { data: badgeData } = await supabase
          .from("badges")
          .select("*")
          .order("criteria_value", { ascending: true });

        const { data: userBadgeData } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", user.id);

        if (badgeData) setBadges(badgeData);
        if (userBadgeData) setEarnedBadges(userBadgeData);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  const isEarned = (badgeId: string) => {
    return earnedBadges.some((eb) => eb.badge_id === badgeId);
  };

  const getEarnedDate = (badgeId: string) => {
    const badge = earnedBadges.find((eb) => eb.badge_id === badgeId);
    return badge ? format(new Date(badge.earned_at), "MMM d, yyyy") : null;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "silver":
        return "from-gray-300 to-gray-500";
      default:
        return "from-orange-400 to-orange-600";
    }
  };

  const unlockedBadges = badges.filter((badge) => isEarned(badge.id));
  const lockedBadges = badges.filter((badge) => !isEarned(badge.id));

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading badges...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <main className="container mx-auto px-4 py-8 mt-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Your Achievements</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your progress and unlock badges as you master ACCA topics
            </p>
          </div>

          {/* XP Progress Card */}
          <Card className="mb-12 max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Level {currentLevel} Progress
              </CardTitle>
              <CardDescription>
                {currentXP} / {nextLevelXP} XP to next level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3" />
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Level {currentLevel}</span>
                <span>Level {currentLevel + 1}</span>
              </div>
            </CardContent>
          </Card>

          {/* Unlocked Badges */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Earned Badges ({unlockedBadges.length})
            </h2>
            {unlockedBadges.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No badges earned yet. Keep studying to unlock your first badge!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedBadges.map((badge) => {
                  const IconComponent = ICON_MAP[badge.icon] || Award;
                  return (
                    <Card key={badge.id} className="relative overflow-hidden border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getTierColor(badge.tier)} opacity-10 rounded-bl-full`} />
                      <CardHeader>
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTierColor(badge.tier)} flex items-center justify-center mb-4 shadow-md`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-lg">{badge.badge_name}</CardTitle>
                        <CardDescription>{badge.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Earned on {getEarnedDate(badge.id)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Locked Badges */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-muted-foreground" />
              In Progress ({lockedBadges.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedBadges.map((badge) => {
                const IconComponent = ICON_MAP[badge.icon] || Award;
                return (
                  <Card key={badge.id} className="relative opacity-60 hover:opacity-80 transition-opacity">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <IconComponent className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{badge.badge_name}</CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {badge.criteria_type === "xp_total" && `Reach ${badge.criteria_value} XP`}
                        {badge.criteria_type === "sessions_completed" && `Complete ${badge.criteria_value} sessions`}
                        {badge.criteria_type === "flashcards_completed" && `Complete ${badge.criteria_value} flashcards`}
                        {badge.criteria_type === "streak" && `Maintain ${badge.criteria_value}-day streak`}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
