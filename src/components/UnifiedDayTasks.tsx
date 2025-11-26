import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, ExternalLink, Brain, PenTool, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import SessionDetailsDialog from "./SessionDetailsDialog";

interface ManualSession {
  id: string;
  user_id: string;
  paper_code: string;
  session_date: string;
  session_type?: string;
  duration_minutes?: number;
  notes?: string;
  completed?: boolean;
  completed_at?: string;
  start_time?: string;
  syllabus_unit_id?: string;
  xp_earned?: number;
  total_questions?: number;
  correct_answers?: number;
  raw_log?: any;
  created_at?: string;
  updated_at?: string;
}

interface AITask {
  id: string;
  text: string;
  paper?: string;
  unit?: string;
  type?: string;
  link?: string;
  completed: boolean;
}

interface UnifiedDayTasksProps {
  selectedDate: Date;
  manualSessions: ManualSession[];
  aiTasks: AITask[];
  papers: any[];
  onCompleteSession: (sessionId: string) => Promise<void>;
  onToggleAITask: (taskId: string) => void;
}

export default function UnifiedDayTasks({
  selectedDate,
  manualSessions,
  aiTasks,
  papers,
  onCompleteSession,
  onToggleAITask,
}: UnifiedDayTasksProps) {
  const navigate = useNavigate();

  const getTaskIcon = (type?: string) => {
    switch (type) {
      case "practice":
        return <PenTool className="w-3 h-3" />;
      case "flashcards":
        return <Brain className="w-3 h-3" />;
      case "mock":
        return <BookOpen className="w-3 h-3" />;
      default:
        return <ExternalLink className="w-3 h-3" />;
    }
  };

  const hasAnyActivity = manualSessions.length > 0 || aiTasks.length > 0;

  if (!hasAnyActivity) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No activities planned for this day</p>
        <p className="text-sm text-muted-foreground mt-2">
          Schedule a session or generate an AI study path to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manual Sessions */}
      {manualSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="font-semibold text-foreground">Scheduled Sessions</h3>
          </div>
            <div className="space-y-2">
            {manualSessions.map((session) => {
              const paper = papers.find((p) => p.paper_code === session.paper_code);
              return (
                <SessionDetailsDialog
                  key={session.id}
                  session={session as any}
                  paper={paper}
                  onComplete={onCompleteSession}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* AI Recommended Tasks */}
      {aiTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="font-semibold text-foreground">AI Recommended Tasks</h3>
          </div>
          <div className="space-y-2">
            {aiTasks.map((task) => (
              <Card key={task.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => onToggleAITask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.text}
                      </p>
                      {task.paper && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {task.paper}
                        </Badge>
                      )}
                    </div>
                    {task.link && !task.completed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(task.link!)}
                        className="shrink-0"
                      >
                        {getTaskIcon(task.type)}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
