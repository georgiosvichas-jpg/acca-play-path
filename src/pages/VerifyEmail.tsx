import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if user is authenticated after email verification
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Verification error:", error);
          setSuccess(false);
          setVerifying(false);
          toast.error("Email verification failed. Please try again.");
          return;
        }

        if (session?.user?.email_confirmed_at) {
          setSuccess(true);
          
          // Create user profile if it doesn't exist
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("user_id", session.user.id)
            .single();

          if (!existingProfile) {
            await supabase.from("user_profiles").insert({
              user_id: session.user.id,
              total_xp: 0,
              study_streak: 0,
            });
          }

          toast.success("Email verified successfully!");
          
          // Redirect to onboarding after 2 seconds
          setTimeout(() => {
            navigate("/onboarding");
          }, 2000);
        } else {
          setSuccess(false);
          toast.error("Email verification incomplete. Please click the link in your email.");
        }
        
        setVerifying(false);
      } catch (error) {
        console.error("Verification error:", error);
        setSuccess(false);
        setVerifying(false);
        toast.error("An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4] relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#00A67E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00A67E]/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md p-8 rounded-[24px] shadow-2xl border-0 bg-white relative z-10 animate-fade-in">
        <div className="text-center">
          {verifying ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00A67E]/10 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-[#00A67E] animate-spin" />
              </div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
                Verifying Your Email
              </h1>
              <p className="text-[#64748B]">
                Please wait while we verify your email address...
              </p>
            </>
          ) : success ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
                Email Verified!
              </h1>
              <p className="text-[#64748B] mb-6">
                Your email has been successfully verified. Redirecting you to complete your profile...
              </p>
              <div className="flex gap-1 justify-center">
                <div className="w-2 h-2 bg-[#00A67E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-[#00A67E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-[#00A67E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
                Verification Failed
              </h1>
              <p className="text-[#64748B] mb-6">
                We couldn't verify your email. The link may have expired or is invalid.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full h-12 bg-[#00A67E] hover:bg-[#009D73] text-white rounded-xl font-semibold"
                >
                  Go to Sign In
                </Button>
                <p className="text-sm text-[#64748B]">
                  Need help?{" "}
                  <a href="mailto:support@accastudy.app" className="text-[#00A67E] hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
