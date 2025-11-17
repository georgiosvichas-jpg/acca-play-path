import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart3,
  Sparkles,
  LogOut,
  Settings,
  Crown,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Brain,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import XPDisplay from "./XPDisplay";
import PeerComparisonDrawer from "./PeerComparisonDrawer";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview of your study progress and daily goals" },
  { path: "/coach", label: "Coach", icon: MessageSquare, description: "AI-powered study assistant for personalized guidance" },
  { path: "/practice-quiz", label: "Practice", icon: BookOpen, description: "Practice questions with immediate feedback" },
  { path: "/spaced-repetition", label: "Review", icon: Brain, description: "Spaced repetition system for mastering difficult questions" },
  { path: "/mock-exam", label: "Mock Exam", icon: Clock, description: "Full 2-hour timed exam simulation with 50 questions" },
  { path: "/question-browser", label: "Questions", icon: BookOpen, description: "Browse and filter the complete question bank" },
  { path: "/question-analytics", label: "Progress", icon: BarChart3, description: "Detailed analytics and accuracy trends over time" },
  { path: "/badges", label: "Badges", icon: Trophy, description: "View achievements and earned milestone badges" },
  { path: "/study-path", label: "Study Path", icon: Calendar, description: "AI-generated personalized study plan" },
  { path: "/progress-tracking", label: "Trends", icon: TrendingUp, description: "Visualize your performance trends and improvements" },
  { path: "/planner", label: "Planner", icon: Calendar, description: "Schedule and track your study sessions" },
  { path: "/flashcards", label: "Flashcards", icon: BookOpen, description: "Study with flashcards for quick review" },
];

export default function Navigation() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { planType, openCustomerPortal } = useSubscription();

  // Don't show navigation on onboarding or auth pages
  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  const getPlanBadge = () => {
    if (planType === "pro") return <Badge className="bg-primary text-white">Pro</Badge>;
    if (planType === "per_paper") return <Badge variant="secondary">Per Paper</Badge>;
    return <Badge variant="outline">Free</Badge>;
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-extrabold text-xl hidden sm:block">
              ACCA Master
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            <XPDisplay />
            <PeerComparisonDrawer />
            
            <TooltipProvider delayDuration={200}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        asChild
                        className={`rounded-xl ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Link to={item.path}>
                          <Icon className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-xl hover:bg-muted"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <span>My Account</span>
                    {getPlanBadge()}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {planType === "free" && (
                  <DropdownMenuItem asChild>
                    <Link to="/checkout" className="cursor-pointer">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {planType === "pro" && (
                  <DropdownMenuItem onClick={openCustomerPortal}>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
