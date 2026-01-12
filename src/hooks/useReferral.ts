import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  successful_referrals: number;
  total_recovered: number;
  badges: string[];
}

export interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: 'pending' | 'registered' | 'converted';
  source: string;
  created_at: string;
}

export interface LeaderboardEntry {
  referral_code: string;
  successful_referrals: number;
  total_recovered: number;
  badges: string[];
}

const BADGE_THRESHOLDS = {
  pioneer: { referrals: 1, label: 'Pioniere', icon: '🚀' },
  influencer: { referrals: 5, label: 'Influencer', icon: '⭐' },
  champion: { referrals: 10, label: 'Campione', icon: '🏆' },
  legend: { referrals: 25, label: 'Leggenda', icon: '👑' },
  millionaire: { recovered: 1000, label: 'Milionario', icon: '💰' },
};

export function useReferral() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchReferrals();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setUserStats({
        ...data,
        badges: Array.isArray(data.badges) ? data.badges as string[] : [],
      });
    }
    setLoading(false);
  };

  const fetchReferrals = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setReferrals(data as ReferralData[]);
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('user_stats')
      .select('referral_code, successful_referrals, total_recovered, badges')
      .order('successful_referrals', { ascending: false })
      .limit(10);

    if (data) {
      setLeaderboard(data.map(d => ({
        ...d,
        badges: Array.isArray(d.badges) ? d.badges as string[] : [],
      })));
    }
  };

  const trackShare = async (source: string, opportunityId?: string) => {
    if (!user || !userStats) return;

    await supabase.from('referrals').insert({
      referrer_id: user.id,
      referral_code: userStats.referral_code,
      source,
      opportunity_id: opportunityId || null,
      status: 'pending',
    });
  };

  const getShareUrl = (opportunityId?: string) => {
    if (!userStats) return window.location.origin;
    const base = window.location.origin;
    const params = new URLSearchParams({ ref: userStats.referral_code });
    if (opportunityId) params.set('opp', opportunityId);
    return `${base}/?${params.toString()}`;
  };

  const getShareMessage = (amount?: number, company?: string) => {
    if (amount && company) {
      return `🎉 Ho appena recuperato ${amount}€ da ${company}! Scopri se anche tu hai diritto a rimborsi nascosti:`;
    }
    return `💰 Ho scoperto che posso recuperare soldi da aziende! Scopri anche tu se hai diritto a rimborsi:`;
  };

  const calculateBadges = (stats: UserStats): string[] => {
    const badges: string[] = [];
    
    if (stats.successful_referrals >= BADGE_THRESHOLDS.pioneer.referrals) {
      badges.push('pioneer');
    }
    if (stats.successful_referrals >= BADGE_THRESHOLDS.influencer.referrals) {
      badges.push('influencer');
    }
    if (stats.successful_referrals >= BADGE_THRESHOLDS.champion.referrals) {
      badges.push('champion');
    }
    if (stats.successful_referrals >= BADGE_THRESHOLDS.legend.referrals) {
      badges.push('legend');
    }
    if (stats.total_recovered >= BADGE_THRESHOLDS.millionaire.recovered) {
      badges.push('millionaire');
    }
    
    return badges;
  };

  const getBadgeInfo = (badge: string) => {
    return BADGE_THRESHOLDS[badge as keyof typeof BADGE_THRESHOLDS] || null;
  };

  return {
    userStats,
    referrals,
    leaderboard,
    loading,
    trackShare,
    getShareUrl,
    getShareMessage,
    calculateBadges,
    getBadgeInfo,
    refetch: fetchUserStats,
    BADGE_THRESHOLDS,
  };
}
