import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    label: "Total Study Hours",
    value: "47",
    unit: "hours",
    icon: Clock,
    trend: "+5 this week",
    color: "text-primary",
  },
  {
    label: "Concepts Mastered",
    value: "124",
    unit: "concepts",
    icon: CheckCircle2,
    trend: "+18 this week",
    color: "text-secondary",
  },
  {
    label: "Current Streak",
    value: "6",
    unit: "days",
    icon: Target,
    trend: "Personal best!",
    color: "text-accent",
  },
  {
    label: "Average Focus",
    value: "92",
    unit: "%",
    icon: Zap,
    trend: "+4% from last week",
    color: "text-primary",
  },
];

const weeklyActivity = [
  { day: "Mon", hours: 2.5, target: 3 },
  { day: "Tue", hours: 3, target: 3 },
  { day: "Wed", hours: 2, target: 3 },
  { day: "Thu", hours: 3.5, target: 3 },
  { day: "Fri", hours: 2.5, target: 3 },
  { day: "Sat", hours: 4, target: 3 },
  { day: "Sun", hours: 3, target: 3 },
];

const paperBreakdown = [
  { paper: "MA", progress: 67, color: "bg-primary" },
  { paper: "FA", progress: 45, color: "bg-secondary" },
  { paper: "AA", progress: 23, color: "bg-accent" },
];

export default function Analytics() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-2">
            Your Analytics
          </h1>
          <p className="text-xl text-muted-foreground">
            Momentum is everything. Stay consistent and watch yourself grow!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-6 shadow-card card-float animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-display font-bold">{stat.value}</span>
                    <span className="text-sm text-muted-foreground">{stat.unit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <Card className="p-6 shadow-card card-float animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Weekly Activity</h2>
            </div>
            <div className="space-y-4">
              {weeklyActivity.map((day) => {
                const percentage = (day.hours / day.target) * 100;
                const isOverTarget = day.hours >= day.target;
                
                return (
                  <div key={day.day}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{day.day}</span>
                      <span className="text-sm text-muted-foreground">
                        {day.hours}h / {day.target}h
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-3"
                      />
                      {isOverTarget && (
                        <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Paper Breakdown */}
          <Card className="p-6 shadow-card card-float animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Paper Progress</h2>
            </div>
            <div className="space-y-6">
              {paperBreakdown.map((paper) => (
                <div key={paper.paper} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${paper.color}`} />
                      <span className="font-semibold">Paper {paper.paper}</span>
                    </div>
                    <span className="text-2xl font-display font-bold text-primary">
                      {paper.progress}%
                    </span>
                  </div>
                  <Progress value={paper.progress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {paper.progress >= 67
                      ? "You're exam-ready! Keep reviewing."
                      : paper.progress >= 40
                      ? "Making great progress!"
                      : "Keep studying, you'll get there!"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Motivational Card */}
        <Card className="mt-6 p-8 shadow-card bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center animate-slide-up" style={{ animationDelay: "0.6s" }}>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-display font-bold mb-2">
              You're 67% exam-ready
            </h3>
            <p className="text-lg text-muted-foreground">
              Your consistent effort is paying off. Keep your streak alive and you'll achieve your ACCA goals!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
