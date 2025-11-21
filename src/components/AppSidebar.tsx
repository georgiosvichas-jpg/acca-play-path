import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  GraduationCap,
  Brain,
  Target,
  BarChart3,
  CalendarDays,
  Award,
  Settings as SettingsIcon,
  LogOut,
  Crown,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { NavLink } from "@/components/NavLink";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo-new.png";
import XPDisplay from "./XPDisplay";
import PeerComparisonDrawer from "./PeerComparisonDrawer";

const mainNavItems = [
  { 
    path: "/dashboard", 
    label: "Dashboard", 
    icon: Home,
  },
  { 
    path: "/study", 
    label: "Study", 
    icon: GraduationCap,
    children: [
      { path: "/study?tab=practice", label: "Practice Quiz" },
      { path: "/study?tab=flashcards", label: "Flashcards" },
      { path: "/study?tab=mock", label: "Mock Exam" },
      { path: "/study?tab=review", label: "Spaced Repetition" },
      { path: "/study?tab=browse", label: "Question Browser" },
    ]
  },
  { 
    path: "/analytics", 
    label: "Analytics", 
    icon: BarChart3,
    children: [
      { path: "/analytics?tab=overview", label: "Question Analytics" },
      { path: "/analytics?tab=progress", label: "Progress Tracking" },
      { path: "/analytics?tab=trends", label: "Trends" },
    ]
  },
  { 
    path: "/planner", 
    label: "Planner", 
    icon: CalendarDays,
  },
  { 
    path: "/badges", 
    label: "Badges", 
    icon: Award,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { planType, openCustomerPortal } = useSubscription();
  const collapsed = state === "collapsed";

  // Persistent collapsible state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("sidebar-expanded-sections");
    return saved ? JSON.parse(saved) : { study: true, analytics: true };
  });

  const toggleSection = (section: string, isOpen: boolean) => {
    const newState = { ...expandedSections, [section]: isOpen };
    setExpandedSections(newState);
    localStorage.setItem("sidebar-expanded-sections", JSON.stringify(newState));
  };

  const getPlanBadge = () => {
    if (planType === "elite") return <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">Elite</Badge>;
    if (planType === "pro") return <Badge className="bg-primary text-white text-xs">Pro</Badge>;
    return <Badge variant="outline" className="text-xs">Free</Badge>;
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email[0].toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 group">
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
            <img 
              src={logo} 
              alt="Outcomeo" 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg leading-tight">Outcomeo</span>
              <span className="text-xs text-muted-foreground">ACCA Study Platform</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* XP & Rank Section */}
        {!collapsed && (
          <div className="px-3 py-4 space-y-2 border-b">
            <XPDisplay />
            <PeerComparisonDrawer />
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const sectionKey = item.label.toLowerCase();
                
                if (item.children) {
                  return (
                    <Collapsible 
                      key={item.path} 
                      className="group/collapsible"
                      open={expandedSections[sectionKey]}
                      onOpenChange={(isOpen) => toggleSection(sectionKey, isOpen)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <Icon className="h-4 w-4" />
                            {!collapsed && <span>{item.label}</span>}
                            {!collapsed && (
                              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.path}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink 
                                      to={child.path}
                                      activeClassName="bg-muted text-primary font-medium"
                                    >
                                      {child.label}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path}
                        end
                        activeClassName="bg-primary text-primary-foreground font-medium"
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Group */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/settings"
                    activeClassName="bg-muted text-primary font-medium"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-sm font-medium truncate">{user?.email}</span>
                      <span className="text-xs text-muted-foreground">{getPlanBadge()}</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" side="right">
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
                
                {(planType === "pro" || planType === "elite") && (
                  <DropdownMenuItem onClick={openCustomerPortal}>
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <SettingsIcon className="w-4 h-4 mr-2" />
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
