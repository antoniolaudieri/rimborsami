import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionPlan = 'free' | 'monthly' | 'annual';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  starts_at: string | null;
  ends_at: string | null;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isPremium: boolean;
  isFree: boolean;
  loading: boolean;
  syncing: boolean;
  plan: SubscriptionPlan | null;
  refetch: () => Promise<void>;
  syncWithStripe: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, plan, status, starts_at, ends_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const syncWithStripe = useCallback(async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error syncing with Stripe:', error);
        return;
      }

      console.log('Stripe sync result:', data);
      
      // Refetch local subscription after sync
      await fetchSubscription();
    } catch (error) {
      console.error('Error syncing subscription:', error);
    } finally {
      setSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Sync with Stripe on mount and periodically
  useEffect(() => {
    if (user) {
      // Initial sync
      syncWithStripe();
      
      // Sync every 60 seconds
      const interval = setInterval(syncWithStripe, 60000);
      return () => clearInterval(interval);
    }
  }, [user, syncWithStripe]);

  const isPremium = subscription?.plan === 'monthly' || subscription?.plan === 'annual';
  const isFree = !isPremium;

  return {
    subscription,
    isPremium,
    isFree,
    loading,
    syncing,
    plan: subscription?.plan || null,
    refetch: fetchSubscription,
    syncWithStripe,
  };
}
