import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Globe, MapPin, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface PeerComparisonDrawerProps {
  children?: React.ReactNode;
}

export default function PeerComparisonDrawer({ children }: PeerComparisonDrawerProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { userStats } = useLeaderboard();
  const [open, setOpen] = useState(false);

  if (!user || !profile) return null;

  const getRankDisplay = (rank: number | null) => {
    if (!rank) return "Not ranked";
    if (rank === 1) return "🥇 1st";
    if (rank === 2) return "🥈 2nd";
    if (rank === 3) return "🥉 3rd";
    return `#${rank}`;
  };

  const getPercentileMessage = (percentile: number | null) => {
    if (!percentile) return "Complete more activities to get ranked";
    if (percentile >= 99) return "You're in the top 1% globally";
    if (percentile >= 95) return "You're in the top 5% globally";
    if (percentile >= 90) return "You're in the top 10% globally";
    if (percentile >= 75) return "You're in the top 25% globally";
    if (percentile >= 50) return "You're in the top 50% globally";
    return `You're in the top ${Math.ceil(100 - percentile)}% globally`;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Trophy className="w-4 h-4" />
            My Rank
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Your Performance
          </SheetTitle>
          <SheetDescription>
            Compare your progress with other learners
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Global Rank Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>
                {getPercentileMessage(userStats?.percentile_global || null)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-foreground">
                    {getRankDisplay(userStats?.rank_global || null)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {profile.total_xp} XP
                  </span>
                </div>
                {userStats?.percentile_global !== null && (
                  <>
                    <Progress value={userStats.percentile_global} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      Top {Math.ceil(100 - userStats.percentile_global)}%
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Country Rank Card */}
          {profile.country && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Country Leaderboard
                </CardTitle>
                <CardDescription>Your rank in {profile.country}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-foreground">
                      {getRankDisplay(userStats?.rank_country || null)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {profile.total_xp} XP
                    </span>
                  </div>
                  {userStats?.percentile_country !== null && (
                    <>
                      <Progress value={userStats.percentile_country} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        Top {Math.ceil(100 - userStats.percentile_country)}%
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Level</span>
                <span className="font-semibold">Level {profile.level || 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Study Streak</span>
                <span className="font-semibold">{profile.study_streak || 0} days</span>
              </div>
              {profile.selected_papers && profile.selected_papers.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Papers</span>
                  <span className="font-semibold">{profile.selected_papers.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Motivation Message */}
          {userStats?.percentile_global && userStats.percentile_global < 75 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Keep going!</strong> You're making great progress. Complete more
                study sessions and flashcards to climb the leaderboard.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Button className="w-full" onClick={() => setOpen(false)}>
            Continue Studying
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
