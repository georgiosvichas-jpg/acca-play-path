import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useStudySessions } from "@/hooks/useStudySessions";
import { usePapers } from "@/hooks/usePapers";
import { format, isSameDay, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Calendar, Target, Loader2, CheckCircle2, Clock, AlertCircle, Sparkles, Lock, ChevronDown, ChevronRight, Bell, BellOff, CalendarDays, ExternalLink, BookOpen, Brain, PenTool } from "lucide-react";
import { toast } from "sonner";
import { FeaturePaywallModal } from "@/components/FeaturePaywallModal";

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
}

export default function StudyPath() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasFeature, planType, isLoading: featureLoading } = useFeatureAccess();
  const { sessions } = useStudySessions();
  const { papers } = usePapers();
  
  const [loading, setLoading] = useState(false);
  const [savedPath, setSavedPath] = useState<SavedPath | null>(null);
  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [showPaywall, setShowPaywall] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));
  
  // Form state
  const [examDate, setExamDate] = useState("");
  const [weeksAvailable, setWeeksAvailable] = useState(8);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canAccessFullStudyPlan = hasFeature("studyPlanDays") && planType !== "free";

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
    
    // Load reminder preferences
    if (user) {
      loadReminderPreferences();
    }
  }, [user]);

  const loadReminderPreferences = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email_reminders_enabled, browser_notifications_enabled')
      .eq('user_id', user.id)
      .single();
    
    if (data && !error) {
      setEmailReminders(data.email_reminders_enabled || false);
      setNotificationsEnabled(data.browser_notifications_enabled || false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const enabled = permission === 'granted';
      setNotificationsEnabled(enabled);
      
      // Save to database
      await supabase
        .from('user_profiles')
        .update({ browser_notifications_enabled: enabled })
        .eq('user_id', user?.id);
      
      if (enabled) {
        toast.success('Notifications enabled');
      } else {
        toast.error('Notification permission denied');
      }
    }
  };

  const toggleEmailReminders = async () => {
    const newValue = !emailReminders;
    setEmailReminders(newValue);
    
    // Save to database
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ email_reminders_enabled: newValue })
      .eq('user_id', user?.id);
    
    if (updateError) {
      console.error('Error updating preferences:', updateError);
      toast.error('Failed to update preferences');
      setEmailReminders(!newValue);
      return;
    }
    
    if (newValue && savedPath) {
      try {
        await supabase.functions.invoke('schedule-study-reminders', {
          body: { 
            userId: user?.id,
            pathId: savedPath.id,
            enable: true 
          }
        });
        toast.success('Email reminders enabled');
      } catch (error) {
        console.error('Error enabling reminders:', error);
        toast.error('Failed to enable email reminders');
        setEmailReminders(false);
      }
    } else if (!newValue) {
      try {
        await supabase.functions.invoke('schedule-study-reminders', {
          body: { 
            userId: user?.id,
            enable: false 
          }
        });
        toast.success('Email reminders disabled');
      } catch (error) {
        console.error('Error disabling reminders:', error);
      }
    }
  };

  const showDailyNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted' && studyPath) {
      const today = new Date();
      const todaysTasks: string[] = [];
      
      studyPath.weeks.forEach(week => {
        week.dailyTasks.forEach((day, dayIdx) => {
          const dayDate = new Date(savedPath?.exam_date || '');
          dayDate.setDate(dayDate.getDate() - (studyPath.weeks.length - week.weekNumber) * 7 + dayIdx);
          
          if (isSameDay(dayDate, today)) {
            todaysTasks.push(...day.tasks);
          }
        });
      });

      if (todaysTasks.length > 0) {
        new Notification('Study Reminder', {
          body: `You have ${todaysTasks.length} tasks scheduled today`,
          icon: '/favicon.png'
        });
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedPath();
      // Load user's selected papers from profile
      loadUserPapers();
    }
  }, [user]);

  const loadUserPapers = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_profiles')
      .select('selected_papers')
      .eq('user_id', user.id)
      .single();
    
    if (data?.selected_papers && data.selected_papers.length > 0) {
      setSelectedPapers(data.selected_papers);
    }
  };

  const fetchSavedPath = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_paths')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
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

  const generatePath = async () => {
    if (!examDate || weeksAvailable < 1) {
      toast.error("Please enter exam date and weeks available");
      return;
    }

    if (selectedPapers.length === 0) {
      toast.error("Please select at least one paper");
      return;
    }

    // Check if free user trying to generate plan beyond 1 week
    if (planType === "free" && weeksAvailable > 1) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-study-path', {
        body: { examDate, weeksAvailable, papers: selectedPapers }
      });

      if (functionError) throw functionError;

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }

      setStudyPath(data.studyPath);
      setSavedPath({
        id: data.savedPathId,
        exam_date: examDate,
        weeks_duration: weeksAvailable,
        path_data: data.studyPath,
        progress: {}
      });
      setProgress({});
      toast.success("Study path generated successfully!");
    } catch (err) {
      console.error("Error generating study path:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to generate study path";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const newProgress = { ...progress, [taskId]: !progress[taskId] };
    setProgress(newProgress);

    if (savedPath?.id) {
      try {
        await supabase
          .from('study_paths')
          .update({ progress: newProgress })
          .eq('id', savedPath.id);
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    }
  };

  const calculateProgress = () => {
    if (!studyPath) return 0;
    
    const totalTasks = studyPath.weeks.reduce((sum, week) => 
      sum + week.dailyTasks.reduce((daySum, day) => daySum + day.tasks.length, 0), 0
    );
    
    const completedTasks = Object.values(progress).filter(Boolean).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const parseTaskLink = (taskText: string): { type: string; paper: string; unit: string; link: string } | null => {
    const practiceMatch = taskText.match(/Practice\s+([A-Z]+)\s+([A-Z0-9]+)/i);
    const reviewMatch = taskText.match(/Review.*(?:flashcards|questions).*for\s+([A-Z]+)\s+([A-Z0-9]+)/i);
    const mockMatch = taskText.match(/Mock.*exam.*for\s+([A-Z]+)/i);
    
    if (practiceMatch) {
      const paper = practiceMatch[1];
      const unit = practiceMatch[2];
      return { type: 'practice', paper, unit, link: `/practice?paper=${paper}&unit=${unit}` };
    } else if (reviewMatch) {
      const paper = reviewMatch[1];
      const unit = reviewMatch[2];
      return { type: 'flashcards', paper, unit, link: `/learn?tab=flashcards&paper=${paper}` };
    } else if (mockMatch) {
      const paper = mockMatch[1];
      return { type: 'mock', paper, unit: '', link: `/practice?tab=mock&paper=${paper}` };
    }
    
    return null;
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'practice': return <PenTool className="w-3 h-3" />;
      case 'flashcards': return <Brain className="w-3 h-3" />;
      case 'mock': return <BookOpen className="w-3 h-3" />;
      default: return <ExternalLink className="w-3 h-3" />;
    }
  };

  const togglePaperSelection = (paperCode: string) => {
    setSelectedPapers(prev =>
      prev.includes(paperCode) ? prev.filter(p => p !== paperCode) : [...prev, paperCode]
    );
  };

  if (!studyPath) {
    return (
      <>
        <div className="container max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle>AI Study Path Generator</CardTitle>
              </div>
              <CardDescription>
                Get a personalized multi-week study plan tailored to your exam date and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {planType === "free" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Free Plan:</strong> Generate a 1-week preview study plan. Upgrade to Pro for unlimited weeks.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Papers</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {papers.map((paper) => (
                      <div key={paper.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`paper-${paper.paper_code}`}
                          checked={selectedPapers.includes(paper.paper_code)}
                          onCheckedChange={() => togglePaperSelection(paper.paper_code)}
                        />
                        <label
                          htmlFor={`paper-${paper.paper_code}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {paper.paper_code} - {paper.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Exam Date</Label>
                  <Input 
                    type="date" 
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weeks Available for Study</Label>
                  <Input 
                    type="number" 
                    value={weeksAvailable}
                    onChange={(e) => setWeeksAvailable(parseInt(e.target.value))}
                    min={1}
                    max={planType === "free" ? 1 : 24}
                  />
                  {planType === "free" ? (
                    <p className="text-xs text-muted-foreground">
                      Free plan limited to 1-week preview. Upgrade to Pro for full plans.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Recommended: 8-12 weeks for comprehensive preparation
                    </p>
                  )}
                </div>
              </div>

              <Button onClick={generatePath} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Personalized Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {planType === "free" && weeksAvailable > 1 ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Upgrade to Generate
                      </>
                    ) : (
                      "Generate Study Path"
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        <FeaturePaywallModal 
          open={showPaywall} 
          onOpenChange={setShowPaywall}
          paywallType="study-path"
        />
      </>
    );
  }

    const progressPercentage = calculateProgress();

  // Get sessions that match the study path dates
  const getSessionsForWeek = (week: Week) => {
    if (!savedPath) return [];
    const examDate = parseISO(savedPath.exam_date);
    
    return sessions.filter(session => {
      const sessionDate = parseISO(session.session_date);
      week.dailyTasks.forEach((day, dayIdx) => {
        const dayDate = new Date(examDate);
        dayDate.setDate(dayDate.getDate() - (studyPath!.weeks.length - week.weekNumber) * 7 + dayIdx);
        if (isSameDay(sessionDate, dayDate)) {
          return true;
        }
      });
      return false;
    });
  };

  const toggleWeek = (weekNumber: number) => {
    setOpenWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const getWeekProgress = (week: Week) => {
    const weekTasks = week.dailyTasks.reduce((sum, day) => sum + day.tasks.length, 0);
    const completedTasks = week.dailyTasks.reduce((sum, day, dayIdx) => 
      sum + day.tasks.filter((_, taskIdx) => 
        progress[`w${week.weekNumber}-d${dayIdx}-t${taskIdx}`]
      ).length, 0
    );
    return weekTasks > 0 ? (completedTasks / weekTasks) * 100 : 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{studyPath.title}</h1>
          <p className="text-muted-foreground">{studyPath.description}</p>
        </div>
        <Button variant="outline" onClick={() => { setStudyPath(null); setSavedPath(null); }}>
          Create New Path
        </Button>
      </div>

      {savedPath && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Exam: {new Date(savedPath.exam_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{savedPath.weeks_duration} weeks</span>
                  </div>
                </div>
                <span className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} className="mb-2" />
              <p className="text-xs text-muted-foreground text-center">Overall Progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Daily Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm">Browser Notifications</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      requestNotificationPermission();
                    } else {
                      setNotificationsEnabled(false);
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Email Reminders</span>
                </div>
                <Switch
                  checked={emailReminders}
                  onCheckedChange={toggleEmailReminders}
                />
              </div>
              {(notificationsEnabled || emailReminders) && (
                <p className="text-xs text-muted-foreground">
                  You'll receive reminders for upcoming tasks each morning
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Study Tips Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Study Tips & Success Strategies</CardTitle>
          </div>
          <CardDescription>Expert recommendations for exam success</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 md:grid-cols-2">
            {studyPath.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Study Timeline
        </h2>
        
        <div className="relative space-y-4">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />
          
          {studyPath.weeks.map((week, weekIdx) => {
            const weekProgress = getWeekProgress(week);
            const isOpen = openWeeks.has(week.weekNumber);
            const totalWeekHours = week.dailyTasks.reduce((sum, day) => sum + day.estimatedHours, 0);
            
            return (
              <Collapsible
                key={week.weekNumber}
                open={isOpen}
                onOpenChange={() => toggleWeek(week.weekNumber)}
              >
                <Card className={`relative ml-14 ${weekProgress === 100 ? 'border-primary' : ''}`}>
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[52px] top-6 w-4 h-4 rounded-full border-4 ${
                    weekProgress === 100 ? 'bg-primary border-primary' : 'bg-background border-border'
                  }`} />
                  
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={weekProgress === 100 ? "default" : "secondary"}>
                              Week {week.weekNumber}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {totalWeekHours}h total
                            </span>
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <CardTitle className="text-xl">{week.title}</CardTitle>
                          <CardDescription className="mt-1">Focus: {week.focus}</CardDescription>
                          
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{weekProgress.toFixed(0)}%</span>
                            </div>
                            <Progress value={weekProgress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-6">
                      {/* Weekly Goals */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          Weekly Goals
                        </h3>
                        <ul className="space-y-2">
                          {week.goals.map((goal, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-primary font-medium">{idx + 1}.</span>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Daily Tasks */}
                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Daily Schedule
                        </h3>
                        {week.dailyTasks.map((day, dayIdx) => {
                          const dayTasksCompleted = day.tasks.filter((_, taskIdx) => 
                            progress[`w${week.weekNumber}-d${dayIdx}-t${taskIdx}`]
                          ).length;
                          const dayProgress = (dayTasksCompleted / day.tasks.length) * 100;
                          
                          // Calculate the date for this day
                          const examDate = savedPath ? parseISO(savedPath.exam_date) : new Date();
                          const dayDate = new Date(examDate);
                          dayDate.setDate(dayDate.getDate() - (studyPath.weeks.length - week.weekNumber) * 7 + dayIdx);
                          
                          // Get sessions for this day
                          const daySessions = sessions.filter(s => 
                            isSameDay(parseISO(s.session_date), dayDate)
                          );

                          return (
                            <Card key={dayIdx} className="bg-background">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                      {day.day}
                                      <Badge variant="outline" className="font-normal">
                                        {dayTasksCompleted}/{day.tasks.length}
                                      </Badge>
                                    </CardTitle>
                                    <span className="text-xs text-muted-foreground">
                                      {format(dayDate, 'MMM d')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {day.estimatedHours}h
                                    </span>
                                  </div>
                                </div>
                                {dayProgress > 0 && <Progress value={dayProgress} className="h-1 mt-2" />}
                              </CardHeader>
                              <CardContent>
                                {/* Show calendar sessions if any */}
                                {daySessions.length > 0 && (
                                  <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CalendarDays className="h-4 w-4 text-primary" />
                                      <span className="text-sm font-semibold">Scheduled Sessions</span>
                                    </div>
                                    <div className="space-y-2">
                                      {daySessions.map(session => (
                                        <div key={session.id} className="flex items-center gap-2 text-sm">
                                          <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                                            {session.paper_code}
                                          </Badge>
                                          <span className="text-muted-foreground">
                                            {session.start_time || 'Time not set'} • {session.duration_minutes}min
                                          </span>
                                          {session.completed && (
                                            <CheckCircle2 className="h-3 w-3 text-primary" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-3">
                                  {day.tasks.map((task, taskIdx) => {
                                    const taskId = `w${week.weekNumber}-d${dayIdx}-t${taskIdx}`;
                                    const isCompleted = progress[taskId] || false;
                                    const taskLink = parseTaskLink(task);
                                    
                                    return (
                                      <div 
                                        key={taskIdx} 
                                        className={`flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors ${
                                          isCompleted ? 'bg-muted/30' : ''
                                        }`}
                                      >
                                        <Checkbox 
                                          checked={isCompleted}
                                          onCheckedChange={() => toggleTask(taskId)}
                                          className="mt-1"
                                        />
                                        {taskLink ? (
                                          <button
                                            onClick={() => navigate(taskLink.link)}
                                            className={`text-sm flex-1 text-left flex items-center gap-1.5 hover:text-primary transition-colors ${
                                              isCompleted ? 'line-through text-muted-foreground' : ''
                                            }`}
                                          >
                                            <span className="flex-1">{task}</span>
                                            <Badge variant="outline" className="text-xs gap-1">
                                              {getTaskIcon(taskLink.type)}
                                              {taskLink.type}
                                            </Badge>
                                          </button>
                                        ) : (
                                          <span className={`text-sm flex-1 ${
                                            isCompleted ? 'line-through text-muted-foreground' : ''
                                          }`}>
                                            {task}
                                          </span>
                                        )}
                                        {isCompleted && (
                                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
