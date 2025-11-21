import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useSubscription();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Refresh subscription status after successful payment
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-2 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Payment Successful! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            Welcome to your upgraded ACCA preparation experience
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Your subscription is now active</h3>
                <p className="text-sm text-muted-foreground">
                  You now have full access to all premium features. Your account has been automatically upgraded.
                </p>
              </div>
            </div>

            {sessionId && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <span className="font-medium">Transaction ID:</span> {sessionId}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">What's next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Start practicing with unlimited question banks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Review your analytics and performance heatmaps</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Take unlimited timed mock exams</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Get AI-powered explanations and coaching</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1" 
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/study")}
            >
              Start Studying
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4">
            A confirmation email has been sent to your inbox with your receipt and subscription details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
