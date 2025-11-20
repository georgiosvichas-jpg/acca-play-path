import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
      <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-shrink-0">
            <Cookie className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Cookie Preferences</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your experience, analyze site usage, and provide personalized content. 
              By clicking "Accept All", you consent to our use of cookies. 
              Read our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              {" "}to learn more.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              onClick={handleDecline} 
              variant="outline" 
              size="sm"
              className="rounded-xl"
            >
              Decline
            </Button>
            <Button 
              onClick={handleAccept} 
              size="sm"
              className="rounded-xl"
            >
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
