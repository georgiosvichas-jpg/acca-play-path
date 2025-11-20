import { useState, useRef, useEffect } from "react";
import { useLeaderboard, LeaderboardSegment, LeaderboardTimeframe } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [segment, setSegment] = useState<LeaderboardSegment>("global");
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("all");
  const { entries, userStats, loading, hasMore, loadMore } = useLeaderboard(segment, timeframe);
  const userRowRef = useRef<HTMLDivElement>(null);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const getRankRowClass = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/5 border-l-4 border-yellow-500";
    if (rank === 2) return "bg-gray-400/5 border-l-4 border-gray-400";
    if (rank === 3) return "bg-orange-600/5 border-l-4 border-orange-600";
    return "";
  };

  const scrollToUser = () => {
    userRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const getCurrentUserRank = () => {
    if (segment === "global") return userStats?.rank_global;
    if (segment === "country") return userStats?.rank_country;
    return null;
  };

  const isUserInTopList = () => {
    const userRank = getCurrentUserRank();
    return userRank && userRank <= 100;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <main className="container mx-auto px-4 py-8 mt-16 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
            <p className="text-lg text-muted-foreground">
              Compete fairly. Stay consistent. Learn faster.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <Tabs value={segment} onValueChange={(v) => setSegment(v as LeaderboardSegment)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="global">Global</TabsTrigger>
                <TabsTrigger value="country">Country</TabsTrigger>
                <TabsTrigger value="paper">Paper</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as LeaderboardTimeframe)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All-time</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
              </TabsList>
            </Tabs>

            {!isUserInTopList() && (
              <Button variant="outline" size="sm" onClick={scrollToUser}>
                <Search className="w-4 h-4 mr-2" />
                Find Me
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mb-6">
            Ranks update daily at 02:00. Your XP updates immediately.
          </p>

          {/* Leaderboard Table */}
          <Card>
            <CardContent className="p-0">
              {loading && entries.length === 0 ? (
                <div className="space-y-2 p-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No entries yet
                  </h3>
                  <p className="text-muted-foreground">
                    Earn XP by completing your first flashcard session to join the leaderboard.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b sticky top-0">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5 sm:col-span-6">Name</div>
                    <div className="col-span-2 text-center">Level</div>
                    <div className="col-span-2 text-right">XP</div>
                    <div className="col-span-2 text-right">Change</div>
                  </div>

                  {/* Entries */}
                  <div className="divide-y">
                    {entries.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={cn(
                          "grid grid-cols-12 gap-4 px-4 py-4 hover:bg-muted/20 transition-colors",
                          getRankRowClass(entry.rank),
                          entry.user_id === user?.id && "bg-primary/5"
                        )}
                      >
                        <div className="col-span-1 flex items-center gap-2">
                          {getRankBadge(entry.rank)}
                          <span className="font-semibold text-foreground">
                            {entry.rank}
                          </span>
                        </div>
                        <div className="col-span-5 sm:col-span-6 flex items-center gap-2">
                          <span className="text-foreground font-medium truncate">
                            {entry.display_name}
                          </span>
                          {entry.country && (
                            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <span className="text-sm font-medium text-foreground">
                            {entry.level || 1}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <span className="font-semibold text-foreground">
                            {entry.total_xp.toLocaleString()}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <span className="text-sm text-muted-foreground">—</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="p-4 text-center border-t">
                      <Button variant="outline" onClick={loadMore} disabled={loading}>
                        {loading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Current User Sticky Row */}
          {user && profile && profile.total_xp >= 10 && !isUserInTopList() && (
            <Card className="mt-4 sticky bottom-4 shadow-lg border-2 border-primary" ref={userRowRef}>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-primary/5">
                  <div className="col-span-1 flex items-center">
                    <span className="font-bold text-primary">
                      #{getCurrentUserRank() || "—"}
                    </span>
                  </div>
                  <div className="col-span-5 sm:col-span-6 flex items-center gap-2">
                    <span className="text-foreground font-semibold">
                      {profile.display_name || `Learner-${user.id.slice(0, 4)}`}
                    </span>
                    <span className="text-xs text-muted-foreground">(You)</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="font-medium text-foreground">{profile.level || 1}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="font-bold text-primary">
                      {profile.total_xp.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-sm text-muted-foreground">—</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center pb-2">
                  Your position updates after each session.
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
