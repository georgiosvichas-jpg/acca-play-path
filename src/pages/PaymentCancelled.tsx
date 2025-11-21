import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/20 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-2 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center animate-scale-in">
            <XCircle className="w-12 h-12 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-lg">
            Your subscription checkout was cancelled
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              No charges have been made to your account. Your payment was cancelled before completion.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Need help?
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• If you experienced any issues during checkout, please try again</li>
              <li>• Make sure your payment method is valid and has sufficient funds</li>
              <li>• You can still use the free tier to explore Outcomeo</li>
              <li>• Contact support if you continue to experience problems</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1" 
              onClick={() => navigate("/pricing")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 mt-6">
            <p className="text-sm font-medium mb-2">Still want to upgrade?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Join thousands of ACCA students who are already using Outcomeo to pass their exams faster.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/pricing")}
              className="w-full"
            >
              View Plans Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
