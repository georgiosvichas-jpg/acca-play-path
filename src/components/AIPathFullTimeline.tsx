import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronRight, Lightbulb } from "lucide-react";
import { useState } from "react";

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

interface AIPathFullTimelineProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyPath: StudyPath;
  progress: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
}

export default function AIPathFullTimeline({
  open,
  onOpenChange,
  studyPath,
  progress,
  onToggleTask,
}: AIPathFullTimelineProps) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));

  const toggleWeek = (weekNum: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) {
        next.delete(weekNum);
      } else {
        next.add(weekNum);
      }
      return next;
    });
  };

  const getWeekProgress = (week: Week, weekIdx: number) => {
    const totalTasks = week.dailyTasks.reduce((sum, day) => sum + day.tasks.length, 0);
    const completed = week.dailyTasks.reduce((sum, day, dayIdx) => {
      return (
        sum +
        day.tasks.filter((_, taskIdx) => {
          const taskId = `w${weekIdx + 1}-d${dayIdx}-t${taskIdx}`;
          return progress[taskId];
        }).length
      );
    }, 0);
    return totalTasks > 0 ? (completed / totalTasks) * 100 : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{studyPath.title}</DialogTitle>
          <p className="text-muted-foreground">{studyPath.description}</p>
        </DialogHeader>

        {/* Study Tips */}
        {studyPath.tips && studyPath.tips.length > 0 && (
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Study Tips</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {studyPath.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4 mt-6">
          {studyPath.weeks.map((week, weekIdx) => {
            const weekProgress = getWeekProgress(week, weekIdx);
            const isOpen = openWeeks.has(week.weekNumber);

            return (
              <Collapsible key={weekIdx} open={isOpen} onOpenChange={() => toggleWeek(week.weekNumber)}>
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                            weekProgress === 100
                              ? "bg-primary text-primary-foreground"
                              : weekProgress > 0
                              ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {weekProgress === 100 ? <CheckCircle2 className="w-4 h-4" /> : week.weekNumber}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{week.title}</h3>
                          <p className="text-sm text-muted-foreground">{week.focus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{Math.round(weekProgress)}%</p>
                          <Progress value={weekProgress} className="w-24 h-1.5 mt-1" />
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-4">
                      {/* Week Goals */}
                      {week.goals && week.goals.length > 0 && (
                        <div className="pl-11">
                          <h4 className="text-sm font-semibold mb-2">Goals</h4>
                          <ul className="space-y-1">
                            {week.goals.map((goal, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Daily Tasks */}
                      <div className="pl-11 space-y-3">
                        {week.dailyTasks.map((day, dayIdx) => (
                          <div key={dayIdx} className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              {day.day}
                              <Badge variant="outline" className="text-xs">
                                {day.estimatedHours}h
                              </Badge>
                            </h4>
                            <div className="space-y-1.5">
                              {day.tasks.map((task, taskIdx) => {
                                const taskId = `w${weekIdx + 1}-d${dayIdx}-t${taskIdx}`;
                                const isCompleted = progress[taskId];
                                const taskText = typeof task === "object" ? (task as any).text : task;

                                return (
                                  <div
                                    key={taskIdx}
                                    className="flex items-start gap-2 text-sm cursor-pointer group"
                                    onClick={() => onToggleTask(taskId)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isCompleted}
                                      onChange={() => {}}
                                      className="mt-0.5 cursor-pointer"
                                    />
                                    <span
                                      className={`flex-1 ${
                                        isCompleted
                                          ? "line-through text-muted-foreground"
                                          : "text-foreground group-hover:text-primary"
                                      }`}
                                    >
                                      {taskText}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
