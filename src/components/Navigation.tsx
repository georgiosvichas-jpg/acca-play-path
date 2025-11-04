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
import XPDisplay from "./XPDisplay";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/flashcards", label: "Flashcards", icon: BookOpen },
  { path: "/badges", label: "Badges", icon: Trophy },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
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
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
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
              );
            })}
            
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
