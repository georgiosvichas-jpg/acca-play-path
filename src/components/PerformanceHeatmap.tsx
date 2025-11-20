import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapData {
  date: string;
  count: number;
  accuracy: number;
}

export function PerformanceHeatmap() {
  const { user } = useAuth();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHeatmapData();
    }
  }, [user]);

  const fetchHeatmapData = async () => {
    if (!user) return;

    try {
      const { data: sessions, error } = await supabase
        .from("study_sessions")
        .select("session_date, total_questions, correct_answers")
        .eq("user_id", user.id)
        .gte("session_date", getDateMonthsAgo(6))
        .order("session_date", { ascending: true });

      if (error) throw error;

      const grouped = sessions?.reduce((acc, session) => {
        const date = session.session_date;
        if (!acc[date]) {
          acc[date] = { count: 0, correct: 0, total: 0 };
        }
        acc[date].count += 1;
        acc[date].correct += session.correct_answers || 0;
        acc[date].total += session.total_questions || 0;
        return acc;
      }, {} as Record<string, { count: number; correct: number; total: number }>);

      const heatmap = Object.entries(grouped || {}).map(([date, stats]) => ({
        date,
        count: stats.count,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      }));

      setHeatmapData(heatmap);
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateMonthsAgo = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split("T")[0];
  };

  const getWeeks = () => {
    const weeks: Date[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);

    const current = new Date(startDate);
    current.setDate(current.getDate() - current.getDay());

    while (current <= today) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const getColorForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayData = heatmapData.find((d) => d.date === dateStr);

    if (!dayData || dayData.count === 0) return "bg-muted";

    if (dayData.accuracy >= 80) return "bg-green-500";
    if (dayData.accuracy >= 60) return "bg-yellow-500";
    if (dayData.accuracy >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return heatmapData.find((d) => d.date === dateStr);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading heatmap...
        </CardContent>
      </Card>
    );
  }

  const weeks = getWeeks();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Activity Heatmap</CardTitle>
        <CardDescription>Your study sessions and performance over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-1 text-xs text-muted-foreground mb-2">
            <div className="w-8">Mon</div>
            <div className="w-8">Wed</div>
            <div className="w-8">Fri</div>
          </div>
          <TooltipProvider>
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const dayData = getDayData(day);
                    const color = getColorForDay(day);

                    return (
                      <Tooltip key={dayIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm ${color} cursor-pointer hover:ring-2 hover:ring-primary`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-medium">{day.toLocaleDateString()}</div>
                            {dayData ? (
                              <>
                                <div>{dayData.count} session{dayData.count !== 1 ? 's' : ''}</div>
                                <div>{dayData.accuracy.toFixed(0)}% accuracy</div>
                              </>
                            ) : (
                              <div>No activity</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </TooltipProvider>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <div className="w-3 h-3 bg-orange-500 rounded-sm" />
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
