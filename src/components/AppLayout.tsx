import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AppLayoutProps {
  children: React.ReactNode;
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/study": "Study",
  "/flashcards": "Flashcards",
  "/mock-exam": "Mock Exam",
  "/analytics": "Analytics",
  "/planner": "Planner",
  "/badges": "Badges",
  "/settings": "Settings",
  "/practice-quiz": "Practice Quiz",
  "/spaced-repetition": "Spaced Repetition",
  "/question-browser": "Question Browser",
  "/question-analytics": "Question Analytics",
  "/progress-tracking": "Progress Tracking",
};

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Don't show sidebar on landing, auth, or onboarding pages
  if (
    location.pathname === "/" || 
    location.pathname === "/auth" ||
    location.pathname === "/onboarding" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/verify-email" ||
    location.pathname.startsWith("/blog")
  ) {
    return <>{children}</>;
  }

  const currentPageLabel = routeLabels[location.pathname] || "Page";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {location.pathname !== "/dashboard" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentPageLabel}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
