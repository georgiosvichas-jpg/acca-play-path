import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Brain, TrendingUp, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdvancedSpacedRepetitionProps {
  onSettingsChange?: (settings: any) => void;
}

export function AdvancedSpacedRepetition({ onSettingsChange }: AdvancedSpacedRepetitionProps) {
  const [easyBonus, setEasyBonus] = useState(130);
  const [hardInterval, setHardInterval] = useState(120);
  const [graduatingInterval, setGraduatingInterval] = useState(1);
  const [easyInterval, setEasyInterval] = useState(4);
  const [predictiveScheduling, setPredictiveScheduling] = useState(true);
  const [conceptTracking, setConceptTracking] = useState(true);

  const handleSave = () => {
    const settings = {
      easyBonus,
      hardInterval,
      graduatingInterval,
      easyInterval,
      predictiveScheduling,
      conceptTracking,
    };
    onSettingsChange?.(settings);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          Advanced spaced repetition settings let you customize the algorithm to match your learning style.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Interval Multipliers
          </CardTitle>
          <CardDescription>Fine-tune how intervals are calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Easy Bonus</Label>
              <span className="text-sm font-medium">{easyBonus}%</span>
            </div>
            <Slider
              value={[easyBonus]}
              onValueChange={(val) => setEasyBonus(val[0])}
              min={100}
              max={200}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Multiplier for "Easy" button. Higher values increase future intervals more.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Hard Interval</Label>
              <span className="text-sm font-medium">{hardInterval}%</span>
            </div>
            <Slider
              value={[hardInterval]}
              onValueChange={(val) => setHardInterval(val[0])}
              min={50}
              max={150}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Multiplier for "Hard" button. Lower values review material sooner.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Graduating Interval (days)</Label>
              <span className="text-sm font-medium">{graduatingInterval}</span>
            </div>
            <Slider
              value={[graduatingInterval]}
              onValueChange={(val) => setGraduatingInterval(val[0])}
              min={1}
              max={7}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Days until a card graduates from learning phase.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Easy Interval (days)</Label>
              <span className="text-sm font-medium">{easyInterval}</span>
            </div>
            <Slider
              value={[easyInterval]}
              onValueChange={(val) => setEasyInterval(val[0])}
              min={2}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Days to wait if marked "Easy" on first attempt.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI-Powered Features
          </CardTitle>
          <CardDescription>Enable intelligent scheduling enhancements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Predictive Scheduling</Label>
              <p className="text-xs text-muted-foreground">
                AI predicts optimal review times based on your performance patterns
              </p>
            </div>
            <Switch
              checked={predictiveScheduling}
              onCheckedChange={setPredictiveScheduling}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Concept-Level Tracking</Label>
              <p className="text-xs text-muted-foreground">
                Track mastery at the concept level, not just individual questions
              </p>
            </div>
            <Switch
              checked={conceptTracking}
              onCheckedChange={setConceptTracking}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Retention Analytics
          </CardTitle>
          <CardDescription>Track your long-term retention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">30-day retention</p>
            </div>
            <div>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">7-day retention</p>
            </div>
            <div>
              <div className="text-2xl font-bold">3.2x</div>
              <p className="text-xs text-muted-foreground">Efficiency gain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Save Settings
      </Button>
    </div>
  );
}
