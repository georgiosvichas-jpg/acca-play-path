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

const tasks = [
  { id: 1, title: "Cost Accounting Basics", paper: "MA", status: "mastered", xp: 50 },
  { id: 2, title: "Variance Analysis", paper: "MA", status: "in-progress", xp: 35 },
  { id: 3, title: "Standard Costing", paper: "MA", status: "todo", xp: 40 },
  { id: 4, title: "Activity-Based Costing", paper: "MA", status: "todo", xp: 45 },
];

const papers = [
  { code: "MA", name: "Management Accounting", progress: 67 },
  { code: "FA", name: "Financial Accounting", progress: 45 },
  { code: "AA", name: "Audit & Assurance", progress: 23 },
];

export default function Dashboard() {
  return (
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
                  <span className="font-semibold">6 day streak!</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
                Your Study Plan for MA
              </h1>
              
              <p className="text-xl text-white/90 mb-6">
                You're 67% exam-ready. Keep your streak alive!
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
                <Button variant="outline" size="sm" className="rounded-xl">
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      {task.status === "mastered" ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      ) : task.status === "in-progress" ? (
                        <Circle className="w-6 h-6 text-secondary fill-secondary/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                      
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">Paper {task.paper}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          task.status === "mastered"
                            ? "default"
                            : task.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="rounded-lg"
                      >
                        {task.status === "mastered"
                          ? "Mastered"
                          : task.status === "in-progress"
                          ? "In Progress"
                          : "To Do"}
                      </Badge>
                      <span className="text-sm font-semibold text-accent">+{task.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Study Illustration */}
            <Card className="p-6 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <img
                src={studyDesk}
                alt="Study Setup"
                className="w-full rounded-xl"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* XP Progress */}
            <Card className="p-6 shadow-card card-float animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center animate-bounce-soft">
                  <Trophy className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your XP</p>
                  <p className="text-2xl font-display font-bold">1,250 XP</p>
                </div>
              </div>
              <Progress value={62} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">380 XP to next level</p>
            </Card>

            {/* Papers Progress */}
            <Card className="p-6 shadow-card card-float animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-display font-bold mb-4">Paper Progress</h3>
              <div className="space-y-4">
                {papers.map((paper) => (
                  <div key={paper.code}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold">{paper.code}</span>
                        <p className="text-xs text-muted-foreground">{paper.name}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{paper.progress}%</span>
                    </div>
                    <Progress value={paper.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Motivational Card */}
            <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-lg font-semibold mb-2">Momentum is everything</p>
              <p className="text-muted-foreground">Stay consistent and watch yourself grow!</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
