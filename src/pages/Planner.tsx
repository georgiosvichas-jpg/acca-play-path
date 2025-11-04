import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePapers } from "@/hooks/usePapers";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { CalendarDays, Clock, Target, TrendingUp } from "lucide-react";
import SessionDetailsDialog from "@/components/SessionDetailsDialog";
import CreateSessionDialog from "@/components/CreateSessionDialog";

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { profile } = useUserProfile();
  const { papers } = usePapers();
  const { sessions, loading, completeSession, createSession } = useStudySessions();

  // Get sessions for selected week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const sessionsThisWeek = sessions.filter((s) => {
    const sessionDate = new Date(s.session_date);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });

  const completedThisWeek = sessionsThisWeek.filter((s) => s.completed).length;
  const totalPlanned = sessionsThisWeek.length;
  const xpThisWeek = sessionsThisWeek.reduce((sum, s) => sum + (s.xp_earned || 0), 0);

  // Get sessions for selected date
  const selectedDaySessions = sessions.filter((s) =>
    isSameDay(new Date(s.session_date), selectedDate)
  );

  const handleCompleteSession = async (sessionId: string) => {
    await completeSession(sessionId);
  };

  const handleCreateSession = async (sessionData: any) => {
    await createSession(sessionData);
    setShowCreateDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#475569]">Loading your study plan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FBFA] to-[#EAF8F4] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Smart Study Planner</h1>
            <p className="text-[#475569] mt-1">
              {(profile as any)?.study_hours || 5} hours/week •{" "}
              {(profile as any)?.selected_papers?.length || 0} papers
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <CalendarDays className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Completion Rate</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {totalPlanned > 0 ? Math.round((completedThisWeek / totalPlanned) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Sessions This Week</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {completedThisWeek}/{totalPlanned}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">XP Earned</p>
                  <p className="text-2xl font-bold text-[#0F172A]">{xpThisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasSession: sessions.map((s) => new Date(s.session_date)),
                }}
                modifiersStyles={{
                  hasSession: {
                    fontWeight: "bold",
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Sessions for selected date */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDaySessions.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-[#64748B]">No sessions planned for this day</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    Schedule a session
                  </Button>
                </div>
              ) : (
                selectedDaySessions.map((session) => {
                  const paper = papers.find((p) => p.paper_code === session.paper_code);
                  return (
                    <SessionDetailsDialog
                      key={session.id}
                      session={session}
                      paper={paper}
                      onComplete={handleCompleteSession}
                    />
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Week Overview */}
        <Card>
          <CardHeader>
            <CardTitle>This Week's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const daySessions = sessions.filter((s) =>
                  isSameDay(new Date(s.session_date), day)
                );
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isToday
                        ? "border-primary/50"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-center">
                      <p className="text-xs text-[#64748B] font-medium">
                        {format(day, "EEE")}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          isToday ? "text-primary" : "text-[#0F172A]"
                        }`}
                      >
                        {format(day, "d")}
                      </p>
                      {daySessions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {daySessions.map((s) => (
                            <Badge
                              key={s.id}
                              variant={s.completed ? "default" : "outline"}
                              className="text-xs w-full"
                            >
                              {s.paper_code}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateSessionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSession={handleCreateSession}
        selectedDate={selectedDate}
      />
    </div>
  );
}
