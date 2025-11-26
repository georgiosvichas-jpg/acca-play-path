import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Calendar, Target, ExternalLink } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface AIPathSummaryProps {
  examDate: string;
  progress: number;
  onViewTimeline: () => void;
  onRegenerate: () => void;
}

export default function AIPathSummary({
  examDate,
  progress,
  onViewTimeline,
  onRegenerate,
}: AIPathSummaryProps) {
  const daysUntilExam = differenceInDays(parseISO(examDate), new Date());

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">AI Study Path Active</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Exam in <span className="font-semibold text-foreground">{daysUntilExam}</span> days
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{Math.round(progress)}%</span> complete
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={onViewTimeline}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Timeline
            </Button>
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              Regenerate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
