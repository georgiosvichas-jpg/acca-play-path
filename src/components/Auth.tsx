import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, CheckCircle, Lock, Globe, Loader2 } from "lucide-react";
import studyDesk from "@/assets/study-desk.png";
import featureAnalytics from "@/assets/feature-analytics.png";
import featureFlashcards from "@/assets/feature-flashcards.png";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast.error("Please agree to the Terms and Privacy Policy");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Signing you in...");
      // Create user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_profiles").insert({
          user_id: user.id,
          total_xp: 0,
          study_streak: 0,
        });
      }
      
      // Auto sign in and redirect to onboarding
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!signInError) {
        navigate("/onboarding");
      }
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("selected_paper")
        .single();
      
      // Redirect to onboarding if user hasn't selected a paper yet
      if (!profile?.selected_paper) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }

    setLoading(false);
  };

  const handleSocialLogin = async (provider: "google" | "linkedin_oidc" | "apple") => {
    setSocialLoading(provider);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      toast.error(error.message);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#00A67E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00A67E]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <Card className="overflow-hidden rounded-[24px] shadow-2xl border-0 bg-white animate-fade-in">
            <div className="grid lg:grid-cols-2 min-h-[600px]">
              {/* Left Column - Visual/Messaging (Desktop only) */}
              <div className="hidden lg:flex relative bg-gradient-to-br from-[#00A67E] to-[#009D73] p-12 flex-col justify-between overflow-hidden">
                {/* Geometric texture overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full" 
                       style={{ 
                         backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)` 
                       }} 
                  />
                </div>

                <div className="relative z-10">
                  {/* Logo */}
                  <div className="flex items-center gap-3 mb-12">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">ACCA Study Buddy</h1>
                      <p className="text-white/80 text-sm">Your gamified study companion</p>
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="mb-8">
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                      Your smarter path to ACCA success
                    </h2>
                    <p className="text-lg text-white/90 leading-relaxed">
                      Personalized, gamified, and built around how real ACCA students learn best.
                    </p>
                  </div>

                  {/* Feature bullets */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                      <span className="text-white/90">Smart Planner</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                      <span className="text-white/90">Flashcards & mini-problems</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                      <span className="text-white/90">Readiness Analytics</span>
                    </div>
                  </div>
                </div>

                {/* Screenshots */}
                <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                  <img 
                    src={featureAnalytics} 
                    alt="Analytics" 
                    className="rounded-lg shadow-xl w-full h-32 object-cover border-2 border-white/20"
                  />
                  <img 
                    src={featureFlashcards} 
                    alt="Flashcards" 
                    className="rounded-lg shadow-xl w-full h-32 object-cover border-2 border-white/20"
                  />
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {/* Mobile Header */}
                <div className="lg:hidden text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="bg-[#00A67E]/10 p-3 rounded-xl">
                      <Sparkles className="w-6 h-6 text-[#00A67E]" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">ACCA Study Buddy</h1>
                  <p className="text-[#64748B] text-sm mt-2">Your gamified study companion</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-[#F1F5F9] p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("signin")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeTab === "signin"
                        ? "bg-white text-[#00A67E] shadow-sm"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab("signup")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeTab === "signup"
                        ? "bg-white text-[#00A67E] shadow-sm"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Sign In Form */}
                {activeTab === "signin" && (
                  <form onSubmit={handleSignIn} className="space-y-5 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="email-signin" className="text-[#0F172A] font-medium">
                        Email
                      </Label>
                      <Input
                        id="email-signin"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-signin" className="text-[#0F172A] font-medium">
                          Password
                        </Label>
                        <button
                          type="button"
                          className="text-sm text-[#64748B] hover:text-[#00A67E] transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password-signin"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E]"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#00A67E] hover:bg-[#009D73] text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.03] shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                    <p className="text-center text-sm text-[#64748B]">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("signup")}
                        className="text-[#00A67E] hover:underline font-medium"
                      >
                        Sign Up
                      </button>
                    </p>
                  </form>
                )}

                {/* Sign Up Form */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignUp} className="space-y-5 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="fullname-signup" className="text-[#0F172A] font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="fullname-signup"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup" className="text-[#0F172A] font-medium">
                        Email
                      </Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="text-[#0F172A] font-medium">
                        Password
                      </Label>
                      <Input
                        id="password-signup"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E]"
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                        className="mt-1 border-[#E5E7EB] data-[state=checked]:bg-[#00A67E] data-[state=checked]:border-[#00A67E]"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-[#64748B] leading-relaxed cursor-pointer"
                      >
                        I agree to the{" "}
                        <a href="#" className="text-[#00A67E] hover:underline">
                          Terms & Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-[#00A67E] hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#00A67E] hover:bg-[#009D73] text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.03] shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    <p className="text-center text-sm text-[#64748B]">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("signin")}
                        className="text-[#00A67E] hover:underline font-medium"
                      >
                        Sign In
                      </button>
                    </p>
                  </form>
                )}

                {/* Social Login Section */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E7EB]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-[#64748B]">or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("google")}
                      disabled={socialLoading !== null}
                      className="h-12 border-[#E5E7EB] hover:bg-[#F8FBFA] hover:border-[#00A67E] rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      {socialLoading === "google" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span className="hidden sm:inline">Google</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("linkedin_oidc")}
                      disabled={socialLoading !== null}
                      className="h-12 bg-[#0A66C2] hover:bg-[#004182] text-white border-[#0A66C2] rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      {socialLoading === "linkedin_oidc" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          <span className="hidden sm:inline">LinkedIn</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("apple")}
                      disabled={socialLoading !== null}
                      className="h-12 bg-black hover:bg-[#1a1a1a] text-white border-black rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      {socialLoading === "apple" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                          </svg>
                          <span className="hidden sm:inline">Apple</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-[#64748B]">
                    <Lock className="w-4 h-4" />
                    <span>Secure login. Your data and progress are always private.</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-[#64748B]">
                    <Globe className="w-4 h-4" />
                    <span>Used by ACCA students in 30+ countries.</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
