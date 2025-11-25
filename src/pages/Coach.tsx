import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CoachChat from "@/components/CoachChat";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, MessageSquare, Sparkles, Zap } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeaturePaywallModal } from "@/components/FeaturePaywallModal";

export default function Coach() {
  const { hasFeature, isLoading } = useFeatureAccess();
  const [showPaywall, setShowPaywall] = useState(false);
  const canAccessAITutor = hasFeature("aiTutor");

  // Show locked preview for non-Elite users
  if (!isLoading && !canAccessAITutor) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-background/80 flex items-center justify-center z-10">
                <div className="text-center space-y-4 p-8 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">AI Tutor Chat</h3>
                  <p className="text-muted-foreground">
                    Get unlimited 24/7 access to your personal ACCA tutor. Ask questions, get explanations, and receive personalized study advice.
                  </p>
                  <Button 
                    onClick={() => setShowPaywall(true)}
                    size="lg"
                    className="w-full"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Unlock with Elite
                  </Button>
                </div>
              </div>

              {/* Blurred preview content */}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      Study Coach
                    </CardTitle>
                    <CardDescription>Your AI-powered study companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 opacity-40">
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg max-w-[80%]">
                      <p className="text-sm">Hi! I'm your AI study coach. How can I help you today?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-4 rounded-lg max-w-[80%]">
                      <p className="text-sm">Can you explain management accounting?</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg max-w-[80%]">
                      <p className="text-sm">I'd be happy to help explain management accounting concepts...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <FeaturePaywallModal 
          open={showPaywall} 
          onOpenChange={setShowPaywall}
          paywallType="ai-tutor"
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <CoachChat />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}