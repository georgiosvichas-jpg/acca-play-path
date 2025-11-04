import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle, Circle } from "lucide-react";
import { format } from "date-fns";
import type { StudySession } from "@/hooks/useStudySessions";
import type { Paper } from "@/hooks/usePapers";

interface SessionDetailsDialogProps {
  session: StudySession;
  paper?: Paper;
  onComplete: (sessionId: string) => Promise<void>;
}

export default function SessionDetailsDialog({
  session,
  paper,
  onComplete,
}: SessionDetailsDialogProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(session.id);
      setOpen(false);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            session.completed
              ? "bg-primary/5 border-primary/20"
              : "border-border hover:border-primary/50 hover:shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {session.completed ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-[#94A3B8]" />
                )}
                <Badge variant={session.completed ? "default" : "outline"}>
                  {session.paper_code}
                </Badge>
              </div>
              <p className="font-semibold text-[#0F172A]">{paper?.title || session.paper_code}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {session.duration_minutes} min
                </span>
                {session.start_time && (
                  <span>
                    {format(
                      new Date(`2000-01-01T${session.start_time}`),
                      "h:mm a"
                    )}
                  </span>
                )}
              </div>
            </div>
            {session.completed && session.xp_earned > 0 && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                +{session.xp_earned} XP
              </Badge>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Study Session Details</DialogTitle>
          <DialogDescription>
            {paper?.title || session.paper_code} • {session.duration_minutes} minutes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <p className="text-sm font-medium text-[#475569] mb-2">Status</p>
            <Badge variant={session.completed ? "default" : "outline"} className="text-sm">
              {session.completed ? "Completed" : "Scheduled"}
            </Badge>
          </div>

          {session.start_time && (
            <div>
              <p className="text-sm font-medium text-[#475569] mb-2">Time</p>
              <p className="text-[#0F172A]">
                {format(new Date(`2000-01-01T${session.start_time}`), "h:mm a")}
              </p>
            </div>
          )}

          {session.notes && (
            <div>
              <p className="text-sm font-medium text-[#475569] mb-2">Notes</p>
              <p className="text-sm text-[#0F172A]">{session.notes}</p>
            </div>
          )}

          {session.completed && session.completed_at && (
            <div>
              <p className="text-sm font-medium text-[#475569] mb-2">Completed At</p>
              <p className="text-[#0F172A]">
                {format(new Date(session.completed_at), "PPp")}
              </p>
            </div>
          )}

          {!session.completed && (
            <div className="pt-4">
              <Button onClick={handleComplete} disabled={isCompleting} className="w-full">
                {isCompleting ? "Completing..." : "Mark as Complete"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
