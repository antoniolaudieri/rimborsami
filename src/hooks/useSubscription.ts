import { useEffect, useState } from 'react';
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
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isPremium = subscription?.plan === 'monthly' || subscription?.plan === 'annual';
  const isFree = !isPremium;

  return {
    subscription,
    isPremium,
    isFree,
    loading,
    refetch: fetchSubscription,
  };
}
