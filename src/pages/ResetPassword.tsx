import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters");

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

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    // Check if user has valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Invalid or expired reset link");
        navigate("/");
      }
    });
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const passwordValidation = passwordSchema.safeParse(password);
    
    if (!passwordValidation.success) {
      const fieldErrors: Record<string, string> = {};
      passwordValidation.error.errors.forEach((err) => {
        fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      toast.error(fieldErrors.password);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordValidation.data,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4] relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#00A67E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00A67E]/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md p-8 rounded-[24px] shadow-2xl border-0 bg-white relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00A67E]/10 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-[#00A67E]" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Reset Your Password
          </h1>
          <p className="text-[#64748B]">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0F172A] font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#0F172A] font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors(prev => ({ ...prev, confirmPassword: "" }));
                }}
                className={`h-12 pr-12 border-[#E5E7EB] focus:border-[#00A67E] focus:ring-[#00A67E] ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#00A67E] transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
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
                Updating password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
