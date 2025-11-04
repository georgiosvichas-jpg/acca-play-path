import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePapers } from "@/hooks/usePapers";
import { useUserProfile } from "@/hooks/useUserProfile";
import { format } from "date-fns";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (sessionData: any) => Promise<void>;
  selectedDate: Date;
}

export default function CreateSessionDialog({
  open,
  onOpenChange,
  onCreateSession,
  selectedDate,
}: CreateSessionDialogProps) {
  const { papers } = usePapers();
  const { profile } = useUserProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    paper_code: "",
    start_time: "",
    duration_minutes: 60,
    notes: "",
  });

  const userPapers = papers.filter((p) =>
    (profile as any)?.selected_papers?.includes(p.paper_code)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await onCreateSession({
        paper_code: formData.paper_code,
        session_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: formData.start_time || null,
        duration_minutes: formData.duration_minutes,
        notes: formData.notes || null,
      });

      // Reset form
      setFormData({
        paper_code: "",
        start_time: "",
        duration_minutes: 60,
        notes: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Study Session</DialogTitle>
          <DialogDescription>
            Create a study session for {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="paper">Paper</Label>
            <Select
              value={formData.paper_code}
              onValueChange={(value) => setFormData({ ...formData, paper_code: value })}
              required
            >
              <SelectTrigger id="paper">
                <SelectValue placeholder="Select a paper" />
              </SelectTrigger>
              <SelectContent>
                {userPapers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.paper_code}>
                    {paper.paper_code} - {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_time">Start Time (Optional)</Label>
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="240"
              step="15"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or focus areas for this session..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !formData.paper_code} className="flex-1">
              {isCreating ? "Creating..." : "Schedule Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
