import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Trophy,
  Flame,
  CheckCircle2,
  Circle,
  PlayCircle,
} from "lucide-react";
import studyDesk from "@/assets/study-desk.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePapers } from "@/hooks/usePapers";
import Footer from "./Footer";

interface Task {
  id: string;
  unit_title: string;
  paper_code: string;
  completed: boolean;
  xp: number;
}

export default function DashboardContent() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const { papers } = usePapers();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      // Get user's selected paper or default to first paper
      const selectedPaper = profile?.selected_paper || papers[0]?.paper_code;

      if (!selectedPaper) {
        setLoading(false);
        return;
      }

      // Fetch syllabus units for the selected paper
      const { data: units, error } = await supabase
        .from("syllabus_units")
        .select("*")
        .eq("paper_code", selectedPaper)
        .limit(5);

      if (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
        return;
      }

      // Fetch user progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("paper_code", selectedPaper);

      const progressMap = new Map(progress?.map((p) => [p.syllabus_unit_id, p]) || []);

      const tasksData = units?.map((unit) => ({
        id: unit.id,
        unit_title: unit.unit_title,
        paper_code: unit.paper_code,
        completed: progressMap.get(unit.id)?.completed || false,
        xp: 50,
      }));

      setTasks(tasksData || []);
      setLoading(false);
    };

    if (papers.length > 0) {
      fetchTasks();
    }
  }, [user, profile, papers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedPaper = papers.find((p) => p.paper_code === profile?.selected_paper) || papers[0];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 md:p-12 text-white shadow-float relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <Flame className="w-5 h-5 text-accent" />
                    <span className="font-semibold">{profile?.study_streak || 0} day streak!</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
                  Your Study Plan for {selectedPaper?.paper_code}
                </h1>

                <p className="text-xl text-white/90 mb-6">
                  You're {progress}% exam-ready. Keep your streak alive!
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shadow-lg"
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Today's Session
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl"
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    Set Pomodoro
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tasks */}
              <Card className="p-6 shadow-card card-float animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Your Tasks
                  </h2>
                </div>

                {tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tasks available. Import the ACCA dataset to get started!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}

                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {task.unit_title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Paper {task.paper_code}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant={task.completed ? "default" : "outline"}
                            className="rounded-lg"
                          >
                            {task.completed ? "Mastered" : "To Do"}
                          </Badge>
                          <span className="text-sm font-semibold text-accent">+{task.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Study Illustration */}
              <Card
                className="p-6 shadow-card overflow-hidden animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <img src={studyDesk} alt="Study Setup" className="w-full rounded-xl" />
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* XP Progress */}
              <Card
                className="p-6 shadow-card card-float animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center animate-bounce-soft">
                    <Trophy className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your XP</p>
                    <p className="text-2xl font-display font-bold">
                      {profile?.total_xp || 0} XP
                    </p>
                  </div>
                </div>
                <Progress value={((profile?.total_xp || 0) % 1000) / 10} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {1000 - ((profile?.total_xp || 0) % 1000)} XP to next level
                </p>
              </Card>

              {/* Papers Progress */}
              <Card
                className="p-6 shadow-card card-float animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="text-lg font-display font-bold mb-4">Paper Progress</h3>
                {papers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Import the ACCA dataset to see your progress!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {papers.slice(0, 3).map((paper) => (
                      <div key={paper.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold">{paper.paper_code}</span>
                            <p className="text-xs text-muted-foreground">{paper.title}</p>
                          </div>
                          <span className="text-sm font-bold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Motivational Card */}
              <Card
                className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <p className="text-lg font-semibold mb-2">Momentum is everything</p>
                <p className="text-muted-foreground">
                  Stay consistent and watch yourself grow!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
