import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import Footer from "@/components/Footer";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful payment
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 md:p-12 max-w-2xl text-center shadow-card animate-fade-in">
          {/* Success Icon */}
          <div className="relative mb-6 inline-block">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            {/* Confetti effect */}
            <Sparkles className="absolute top-0 left-0 w-6 h-6 text-primary animate-pulse" />
            <Sparkles className="absolute top-2 right-2 w-5 h-5 text-primary animate-pulse delay-100" />
            <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-primary animate-pulse delay-200" />
            <Sparkles className="absolute bottom-2 right-8 w-6 h-6 text-primary animate-pulse delay-300" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Welcome to your upgraded ACCA experience
          </p>
          <p className="text-muted-foreground mb-8">
            Your account has been upgraded and you now have access to premium features.
            Start exploring your unlocked content!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-primary hover:bg-primary/90"
            >
              Go to Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/flashcards")}
            >
              Start Learning
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email shortly with your payment details.
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </>
  );
}
