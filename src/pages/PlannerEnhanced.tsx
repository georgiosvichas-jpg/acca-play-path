import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePapers } from "@/hooks/usePapers";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO, differenceInDays, addDays, startOfDay } from "date-fns";
import { CalendarDays, Target, Clock, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import CreateSessionDialog from "@/components/CreateSessionDialog";
import UnifiedDayTasks from "@/components/UnifiedDayTasks";
import AIPathSummary from "@/components/AIPathSummary";
import AIPathFullTimeline from "@/components/AIPathFullTimeline";
import { toast } from "sonner";

interface DailyTask {
  day: string;
  tasks: string[];
  estimatedHours: number;
}

interface Week {
  weekNumber: number;
  title: string;
  focus: string;
  goals: string[];
  dailyTasks: DailyTask[];
}

interface StudyPath {
  title: string;
  description: string;
  weeks: Week[];
  tips: string[];
}

interface SavedPath {
  id: string;
  exam_date: string;
  weeks_duration: number;
  path_data: StudyPath;
  progress: Record<string, boolean>;
  papers: string[];
}

export default function PlannerEnhanced() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile } = useUserProfile();
  const { papers } = usePapers();
  const { sessions, completeSession, createSession } = useStudySessions();
  const { planType } = useFeatureAccess();

  // AI Path state
  const [savedPath, setSavedPath] = useState<SavedPath | null>(null);
  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  // Load AI Path
  useEffect(() => {
    if (user) {
      fetchSavedPath();
    }
  }, [user]);

  const fetchSavedPath = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("study_paths")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSavedPath(data as unknown as SavedPath);
        setStudyPath(data.path_data as unknown as StudyPath);
        setProgress((data.progress as unknown as Record<string, boolean>) || {});
      }
    } catch (err) {
      console.error("Error fetching saved path:", err);
    }
  };

  // Get AI tasks for selected date
  const getAITasksForDate = (date: Date) => {
    if (!studyPath || !savedPath) return [];

    const tasks: any[] = [];
    const examDate = parseISO(savedPath.exam_date);
    const totalWeeks = studyPath.weeks.length;

    studyPath.weeks.forEach((week, weekIdx) => {
      week.dailyTasks.forEach((day, dayIdx) => {
        // Calculate the actual date for this day
        const weeksFromExam = totalWeeks - week.weekNumber;
        const daysOffset = dayIdx - weeksFromExam * 7;
        const taskDate = addDays(examDate, daysOffset);

        if (isSameDay(taskDate, date)) {
          day.tasks.forEach((task, taskIdx) => {
            const taskId = `w${weekIdx + 1}-d${dayIdx}-t${taskIdx}`;
            const taskData = typeof task === "object" ? task : { text: task };
            const taskText = (taskData as any).text || task;

            // Parse task link
            const linkData = parseTaskLink(taskText);

            tasks.push({
              id: taskId,
              text: taskText,
              paper: linkData?.paper,
              unit: linkData?.unit,
              type: linkData?.type,
              link: linkData?.link,
              completed: progress[taskId] || false,
            });
          });
        }
      });
    });

    return tasks;
  };

  const parseTaskLink = (
    taskText: string
  ): { type: string; paper: string; unit: string; link: string } | null => {
    const practiceMatch = taskText.match(/Practice\s+([A-Z]+)\s+([A-Z0-9]+)/i);
    const reviewMatch = taskText.match(/Review.*(?:flashcards|questions).*for\s+([A-Z]+)\s+([A-Z0-9]+)/i);
    const mockMatch = taskText.match(/Mock.*exam.*for\s+([A-Z]+)/i);

    if (practiceMatch) {
      const paper = practiceMatch[1];
      const unit = practiceMatch[2];
      return { type: "practice", paper, unit, link: `/practice?paper=${paper}&unit=${unit}` };
    } else if (reviewMatch) {
      const paper = reviewMatch[1];
      const unit = reviewMatch[2];
      return { type: "flashcards", paper, unit, link: `/learn?paper=${paper}` };
    } else if (mockMatch) {
      const paper = mockMatch[1];
      return { type: "mock", paper, unit: "", link: `/practice?tab=mock&paper=${paper}` };
    }

    return null;
  };

  // Get sessions for selected date
  const selectedDaySessions = sessions.filter((s) => isSameDay(new Date(s.session_date), selectedDate));

  // Get AI tasks for selected date
  const aiTasks = getAITasksForDate(selectedDate);

  // Calculate weekly stats
  const thisWeekSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.session_date);
    const weekStart = startOfDay(new Date());
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekEnd = addDays(weekStart, 6);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });

  const completedThisWeek = thisWeekSessions.filter((s) => s.completed).length;
  const totalPlanned = thisWeekSessions.length;
  const xpThisWeek = thisWeekSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);

  const handleCompleteSession = async (sessionId: string) => {
    await completeSession(sessionId);
  };

  const handleCreateSession = async (sessionData: any) => {
    await createSession(sessionData);
    setShowCreateDialog(false);
  };

  const handleToggleAITask = async (taskId: string) => {
    const newProgress = { ...progress, [taskId]: !progress[taskId] };
    setProgress(newProgress);

    if (savedPath?.id) {
      try {
        await supabase.from("study_paths").update({ progress: newProgress }).eq("id", savedPath.id);
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    }
  };

  const calculateProgress = () => {
    if (!studyPath) return 0;

    const totalTasks = studyPath.weeks.reduce(
      (sum, week) => sum + week.dailyTasks.reduce((daySum, day) => daySum + day.tasks.length, 0),
      0
    );

    const completedTasks = Object.values(progress).filter(Boolean).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const handleRegeneratePath = () => {
    navigate("/planner?generate=true");
  };

  // Check if date has activities
  const dateHasActivities = (date: Date) => {
    const hasSession = sessions.some((s) => isSameDay(new Date(s.session_date), date));
    const hasAITask = getAITasksForDate(date).length > 0;
    return { hasSession, hasAITask };
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Study Planner</h1>
            <p className="text-muted-foreground">
              Track your scheduled sessions and AI-guided study plan in one place
            </p>
          </div>

          {/* AI Path Summary */}
          {studyPath && savedPath && (
            <div className="mb-6">
              <AIPathSummary
                examDate={savedPath.exam_date}
                progress={calculateProgress()}
                onViewTimeline={() => setShowTimelineDialog(true)}
                onRegenerate={handleRegeneratePath}
              />
            </div>
          )}

          {/* No AI Path CTA */}
          {!studyPath && (
            <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Generate Your AI Study Path</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get a personalized multi-week plan with daily tasks integrated into your calendar
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate("/planner?generate=true")}>Generate Path</Button>
              </CardContent>
            </Card>
          )}

          {/* Weekly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">
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
                    <p className="text-sm text-muted-foreground">Sessions This Week</p>
                    <p className="text-2xl font-bold">
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
                    <p className="text-sm text-muted-foreground">XP Earned</p>
                    <p className="text-2xl font-bold">{xpThisWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unified Calendar + Tasks View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Calendar</CardTitle>
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    hasSession: sessions.map((s) => new Date(s.session_date)),
                    hasAITask: studyPath
                      ? Array.from(
                          new Set(
                            studyPath.weeks.flatMap((week, weekIdx) =>
                              week.dailyTasks.map((day, dayIdx) => {
                                const examDate = parseISO(savedPath!.exam_date);
                                const totalWeeks = studyPath.weeks.length;
                                const weeksFromExam = totalWeeks - week.weekNumber;
                                const daysOffset = dayIdx - weeksFromExam * 7;
                                return addDays(examDate, daysOffset);
                              })
                            )
                          )
                        )
                      : [],
                  }}
                  modifiersStyles={{
                    hasSession: {
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                    },
                  }}
                  modifiersClassNames={{
                    hasSession: "font-semibold",
                  }}
                />
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Manual session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">AI task</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks for Selected Date */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedDayTasks
                  selectedDate={selectedDate}
                  manualSessions={selectedDaySessions}
                  aiTasks={aiTasks}
                  papers={papers}
                  onCompleteSession={handleCompleteSession}
                  onToggleAITask={handleToggleAITask}
                />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>

      {/* Dialogs */}
      <CreateSessionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSession={handleCreateSession}
        selectedDate={selectedDate}
      />

      {studyPath && (
        <AIPathFullTimeline
          open={showTimelineDialog}
          onOpenChange={setShowTimelineDialog}
          studyPath={studyPath}
          progress={progress}
          onToggleTask={handleToggleAITask}
        />
      )}
    </ProtectedRoute>
  );
}
