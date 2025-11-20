import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, CheckCircle, Lock, Globe, Loader2, Eye, EyeOff, Mail } from "lucide-react";
import studyDesk from "@/assets/study-desk.png";
import featureAnalytics from "@/assets/feature-analytics.png";
import featureFlashcards from "@/assets/feature-flashcards.png";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Privacy Policy"
  })
});

const signInSchema = z.object({
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(1, "Password is required")
    .max(100, "Password must be less than 100 characters")
});

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
};

const calculatePasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  let score = 0;
  let label = "Weak";
  let color = "bg-red-500";

  if (metRequirements >= 5) {
    score = 3;
    label = "Strong";
    color = "bg-green-500";
  } else if (metRequirements >= 3) {
    score = 2;
    label = "Medium";
    color = "bg-yellow-500";
  } else if (password.length > 0) {
    score = 1;
    label = "Weak";
    color = "bg-red-500";
  }

  return { score, label, color, requirements };
};

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "reset">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "",
    color: "",
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecial: false,
    }
  });
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
    setErrors({});
    
    // Validate inputs
    const validation = signUpSchema.safeParse({
      fullName,
      email,
      password,
      agreeToTerms
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          full_name: validation.data.fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        setVerificationEmailSent(true);
        toast.success("Verification email sent! Please check your inbox.");
        setLoading(false);
      } else {
        // Auto-confirmed - create profile and sign in
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
          email: validation.data.email,
          password: validation.data.password,
        });
        
        if (!signInError) {
          navigate("/onboarding");
        }
        
        setLoading(false);
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const validation = signInSchema.safeParse({
      email,
      password
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      // Check if error is due to unverified email
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please verify your email address before signing in. Check your inbox for the verification link.");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    // Check if email is verified
    if (data.user && !data.user.email_confirmed_at) {
      toast.error("Please verify your email address before signing in. Check your inbox for the verification link.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = z.string()
      .trim()
      .email("Please enter a valid email address")
      .max(255, "Email must be less than 255 characters")
      .safeParse(email);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors.email = err.message;
      });
      setErrors(fieldErrors);
      toast.error(fieldErrors.email);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(validation.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Check your inbox.");
      setActiveTab("signin");
    }

    setLoading(false);
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
                      <h1 className="text-2xl font-bold text-white">Outcomeo</h1>
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
                  <h1 className="text-2xl font-bold text-[#0F172A]">ACCA Outcomeo</h1>
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        className={`h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E] ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-signin" className="text-[#0F172A] font-medium">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setActiveTab("reset")}
                          className="text-sm text-[#64748B] hover:text-[#00A67E] transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password-signin"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors(prev => ({ ...prev, password: "" }));
                          }}
                          className={`h-12 pr-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E] ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#00A67E] transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                      )}
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
                {activeTab === "signup" && !verificationEmailSent && (
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
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrors(prev => ({ ...prev, fullName: "" }));
                        }}
                        className={`h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E] ${errors.fullName ? "border-red-500" : ""}`}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-500">{errors.fullName}</p>
                      )}
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        className={`h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E] ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="text-[#0F172A] font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password-signup"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            const newPassword = e.target.value;
                            setPassword(newPassword);
                            setPasswordStrength(calculatePasswordStrength(newPassword));
                            setErrors(prev => ({ ...prev, password: "" }));
                          }}
                          className={`h-12 pr-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E] ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#00A67E] transition-colors"
                          aria-label={showSignupPassword ? "Hide password" : "Show password"}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                      )}
                      
                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#64748B]">Password strength:</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.score === 3 ? "text-green-600" :
                              passwordStrength.score === 2 ? "text-yellow-600" :
                              "text-red-600"
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                  level <= passwordStrength.score
                                    ? passwordStrength.color
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className={`flex items-center gap-1 ${passwordStrength.requirements.minLength ? "text-green-600" : "text-[#64748B]"}`}>
                              {passwordStrength.requirements.minLength ? "✓" : "○"} At least 8 characters
                            </div>
                            <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasUpperCase ? "text-green-600" : "text-[#64748B]"}`}>
                              {passwordStrength.requirements.hasUpperCase ? "✓" : "○"} One uppercase letter
                            </div>
                            <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasLowerCase ? "text-green-600" : "text-[#64748B]"}`}>
                              {passwordStrength.requirements.hasLowerCase ? "✓" : "○"} One lowercase letter
                            </div>
                            <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasNumber ? "text-green-600" : "text-[#64748B]"}`}>
                              {passwordStrength.requirements.hasNumber ? "✓" : "○"} One number
                            </div>
                            <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasSpecial ? "text-green-600" : "text-[#64748B]"}`}>
                              {passwordStrength.requirements.hasSpecial ? "✓" : "○"} One special character (!@#$%^&*)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => {
                          setAgreeToTerms(checked as boolean);
                          setErrors(prev => ({ ...prev, agreeToTerms: "" }));
                        }}
                        className={`mt-1 border-[#E5E7EB] data-[state=checked]:bg-[#00A67E] data-[state=checked]:border-[#00A67E] ${errors.agreeToTerms ? "border-red-500" : ""}`}
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
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-500 -mt-3">{errors.agreeToTerms}</p>
                    )}
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

                {/* Email Verification Sent */}
                {activeTab === "signup" && verificationEmailSent && (
                  <div className="space-y-5 animate-fade-in text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00A67E]/10 rounded-full mb-4">
                      <Mail className="w-8 h-8 text-[#00A67E]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                        Verify Your Email
                      </h3>
                      <p className="text-[#64748B] mb-6">
                        We've sent a verification link to <span className="font-semibold text-[#0F172A]">{email}</span>
                      </p>
                    </div>
                    
                    <div className="bg-[#F8FBFA] border border-[#00A67E]/20 rounded-xl p-4 text-left">
                      <p className="text-sm text-[#64748B] mb-3">
                        <strong className="text-[#0F172A]">What's next?</strong>
                      </p>
                      <ol className="text-sm text-[#64748B] space-y-2 list-decimal list-inside">
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>Return here to sign in and start studying!</li>
                      </ol>
                    </div>

                    <Button
                      onClick={async () => {
                        const { error } = await supabase.auth.resend({
                          type: 'signup',
                          email: email,
                        });
                        if (error) {
                          toast.error(error.message);
                        } else {
                          toast.success("Verification email resent!");
                        }
                      }}
                      variant="outline"
                      className="w-full h-12 border-[#00A67E] text-[#00A67E] hover:bg-[#00A67E]/5 rounded-xl"
                    >
                      Resend Verification Email
                    </Button>

                    <p className="text-center text-sm text-[#64748B]">
                      Already verified?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("signin");
                          setVerificationEmailSent(false);
                        }}
                        className="text-[#00A67E] hover:underline font-medium"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                )}

                {/* Password Reset Form */}
                {activeTab === "reset" && (
                  <form onSubmit={handlePasswordReset} className="space-y-5 animate-fade-in">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                        Reset Password
                      </h3>
                      <p className="text-sm text-[#64748B]">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-reset" className="text-[#0F172A] font-medium">
                        Email
                      </Label>
                      <Input
                        id="email-reset"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        className={`h-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E] ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#00A67E] hover:bg-[#009D73] text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.03] shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending reset link...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>

                    <p className="text-center text-sm text-[#64748B]">
                      Remember your password?{" "}
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
                {activeTab !== "reset" && (
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
                )}

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
