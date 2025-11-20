import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 md:p-12 max-w-2xl text-center shadow-card animate-fade-in">
          {/* Error Icon */}
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your payment was not completed
          </p>
          <p className="text-muted-foreground mb-8">
            Don't worry, no charges were made to your account. You can try again
            whenever you're ready.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/checkout")}
              className="bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Having trouble with payment?{" "}
              <a
                href="mailto:support@accahub.com"
                className="text-primary hover:underline"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </>
  );
}
