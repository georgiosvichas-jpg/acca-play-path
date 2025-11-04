import { useState, useEffect } from "react";
import ProtectedRoute from "./ProtectedRoute";
import DashboardContent from "./DashboardContent";
import EmptyDashboard from "./EmptyDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user } = useAuth();
  const [hasActivity, setHasActivity] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserActivity = async () => {
      if (!user) return;

      // Check if user has any XP or completed tasks
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("total_xp")
        .eq("user_id", user.id)
        .single();

      setHasActivity((profile?.total_xp ?? 0) > 0);
    };

    checkUserActivity();
  }, [user]);

  return (
    <ProtectedRoute>
      {hasActivity === null ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-[#475569]">Loading your dashboard...</div>
        </div>
      ) : hasActivity ? (
        <DashboardContent />
      ) : (
        <EmptyDashboard />
      )}
    </ProtectedRoute>
  );
}
