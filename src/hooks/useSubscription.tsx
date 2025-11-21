import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { PlanType, SubscriptionInfo } from "@/lib/stripe-config";

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isSubscribed: false,
    planType: "free",
    subscriptionEnd: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscriptionInfo({
        isSubscribed: false,
        planType: "free",
        subscriptionEnd: null,
        isLoading: false,
      });
      return;
    }

    try {
      // Try edge function first
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Edge function error, falling back to database:", error);
        
        // Fallback: read directly from user_profiles
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("plan_type, subscription_status, subscription_end_date")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;

        setSubscriptionInfo({
          isSubscribed: profileData.subscription_status === "active",
          planType: (profileData.plan_type as PlanType) || "free",
          subscriptionEnd: profileData.subscription_end_date || null,
          isLoading: false,
        });
        return;
      }

      setSubscriptionInfo({
        isSubscribed: data.subscribed || false,
        planType: data.plan_type || "free",
        subscriptionEnd: data.subscription_end || null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      
      // Final fallback: try database again
      try {
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("plan_type, subscription_status, subscription_end_date")
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          setSubscriptionInfo({
            isSubscribed: profileData.subscription_status === "active",
            planType: (profileData.plan_type as PlanType) || "free",
            subscriptionEnd: profileData.subscription_end_date || null,
            isLoading: false,
          });
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
      
      setSubscriptionInfo((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();

    // Set up realtime subscription for user_profiles changes
    if (user) {
      const channel = supabase
        .channel(`user-profile-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Subscription status changed in realtime:', payload);
            
            // Extract the new data from the payload
            const newData = payload.new as any;
            if (newData) {
              setSubscriptionInfo({
                isSubscribed: newData.subscription_status === "active",
                planType: (newData.plan_type as PlanType) || "free",
                subscriptionEnd: newData.subscription_end_date || null,
                isLoading: false,
              });
              
              // Show a toast notification when plan changes
              if (payload.eventType === 'UPDATE' && newData.plan_type !== payload.old?.plan_type) {
                const planNames = { free: "Free", per_paper: "Per Paper", pro: "Pro", elite: "Elite" };
                toast({
                  title: "Plan Updated!",
                  description: `Your plan has been upgraded to ${planNames[newData.plan_type as keyof typeof planNames] || newData.plan_type}`,
                });
              }
            }
          }
        )
        .subscribe();

      // Auto-refresh every 60 seconds as backup
      const interval = setInterval(checkSubscription, 60000);
      
      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }

    // Auto-refresh every 60 seconds if no user
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription, user]);

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: "Failed to open subscription management portal",
        variant: "destructive",
      });
    }
  };

  return {
    ...subscriptionInfo,
    refreshSubscription: checkSubscription,
    openCustomerPortal,
  };
}
