import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useReferral } from '@/hooks/useReferral';
import { Trophy, Users, TrendingUp, Medal, Crown, Award } from 'lucide-react';

export function LeaderboardCard() {
  const { leaderboard, userStats, getBadgeInfo } = useReferral();
  const [activeTab, setActiveTab] = useState('referrals');

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-muted-foreground">{index + 1}</span>;
    }
  };

  const sortedByReferrals = [...leaderboard].sort((a, b) => b.successful_referrals - a.successful_referrals);
  const sortedByRecovered = [...leaderboard].sort((a, b) => b.total_recovered - a.total_recovered);

  // Find current user's rank
  const userRankReferrals = userStats 
    ? sortedByReferrals.findIndex(l => l.referral_code === userStats.referral_code) + 1
    : 0;
  const userRankRecovered = userStats
    ? sortedByRecovered.findIndex(l => l.referral_code === userStats.referral_code) + 1
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <CardTitle>Classifica</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="referrals" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Inviti</span>
            </TabsTrigger>
            <TabsTrigger value="recovered" className="gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Recuperati</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="mt-0">
            <div className="space-y-2">
              {sortedByReferrals.slice(0, 5).map((entry, i) => {
                const isCurrentUser = userStats?.referral_code === entry.referral_code;
                return (
                  <div
                    key={entry.referral_code}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isCurrentUser 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(i)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                          {isCurrentUser ? 'Tu' : `Utente #${entry.referral_code.slice(0, 4)}`}
                        </span>
                        {entry.badges.slice(0, 2).map((badge, bi) => {
                          const info = getBadgeInfo(badge);
                          return info ? (
                            <span key={bi} title={info.label}>{info.icon}</span>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {entry.successful_referrals} inviti
                    </Badge>
                  </div>
                );
              })}

              {userStats && userRankReferrals > 5 && (
                <>
                  <div className="text-center text-muted-foreground text-sm py-1">• • •</div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-8 flex justify-center">
                      <span className="text-sm font-medium">{userRankReferrals}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-primary">Tu</span>
                    </div>
                    <Badge variant="secondary">
                      {userStats.successful_referrals} inviti
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recovered" className="mt-0">
            <div className="space-y-2">
              {sortedByRecovered.slice(0, 5).map((entry, i) => {
                const isCurrentUser = userStats?.referral_code === entry.referral_code;
                return (
                  <div
                    key={entry.referral_code}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isCurrentUser 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(i)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                        {isCurrentUser ? 'Tu' : `Utente #${entry.referral_code.slice(0, 4)}`}
                      </span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {formatAmount(entry.total_recovered)}
                    </Badge>
                  </div>
                );
              })}

              {userStats && userRankRecovered > 5 && (
                <>
                  <div className="text-center text-muted-foreground text-sm py-1">• • •</div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-8 flex justify-center">
                      <span className="text-sm font-medium">{userRankRecovered}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-primary">Tu</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {formatAmount(userStats.total_recovered)}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
