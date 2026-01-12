import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Paywall, LockedContent, PremiumBadge } from '@/components/Paywall';
import { CompanyLogo } from '@/components/opportunities/CompanyLogo';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  FileSearch,
  Bell,
  ArrowRight,
  Euro,
  Lock,
} from 'lucide-react';

interface DashboardStats {
  totalOpportunities: number;
  completedOpportunities: number;
  pendingOpportunities: number;
  estimatedRecoveryMin: number;
  estimatedRecoveryMax: number;
  actualRecovery: number;
  unreadNotifications: number;
}

interface UserOpportunity {
  id: string;
  status: string;
  estimated_amount: number;
  deadline: string | null;
  created_at: string;
  matched_data: Record<string, unknown> | null;
  opportunities: {
    title: string;
    category: string;
    short_description: string;
  } | null;
}

const statusColors: Record<string, string> = {
  found: 'bg-blue-100 text-blue-700',
  started: 'bg-amber-100 text-amber-700',
  sent: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  found: 'Trovata',
  started: 'Avviata',
  sent: 'Inviata',
  completed: 'Completata',
  expired: 'Scaduta',
};

const categoryIcons: Record<string, string> = {
  flight: '✈️',
  ecommerce: '🛒',
  bank: '🏦',
  insurance: '🛡️',
  warranty: '📦',
  other: '📋',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isPremium, isFree, loading: subscriptionLoading } = useSubscription();
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    completedOpportunities: 0,
    pendingOpportunities: 0,
    estimatedRecoveryMin: 0,
    estimatedRecoveryMax: 0,
    actualRecovery: 0,
    unreadNotifications: 0,
  });
  const [recentOpportunities, setRecentOpportunities] = useState<UserOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; onboarding_completed: boolean } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, onboarding_completed')
        .eq('user_id', user?.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch user opportunities with opportunity details
      const { data: opportunities } = await supabase
        .from('user_opportunities')
        .select(`
          id,
          status,
          estimated_amount,
          actual_amount,
          deadline,
          created_at,
          matched_data,
          opportunities (
            title,
            category,
            short_description,
            min_amount,
            max_amount
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch unread notifications count
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (opportunities) {
        const completed = opportunities.filter(o => o.status === 'completed');
        const pending = opportunities.filter(o => o.status !== 'completed' && o.status !== 'expired');
        
        // Calculate min/max ranges for free users
        const minTotal = opportunities.reduce((sum, o) => {
          const opp = o.opportunities as { min_amount?: number } | null;
          return sum + (opp?.min_amount || o.estimated_amount || 0);
        }, 0);
        const maxTotal = opportunities.reduce((sum, o) => {
          const opp = o.opportunities as { max_amount?: number } | null;
          return sum + (opp?.max_amount || o.estimated_amount || 0);
        }, 0);
        
        setStats({
          totalOpportunities: opportunities.length,
          completedOpportunities: completed.length,
          pendingOpportunities: pending.length,
          estimatedRecoveryMin: minTotal,
          estimatedRecoveryMax: maxTotal,
          actualRecovery: completed.reduce((sum, o) => sum + (o.actual_amount || o.estimated_amount || 0), 0),
          unreadNotifications: notifCount || 0,
        });

        setRecentOpportunities(opportunities.slice(0, 5) as UserOpportunity[]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.totalOpportunities > 0
    ? Math.round((stats.completedOpportunities / stats.totalOpportunities) * 100)
    : 0;

  const firstName = profile?.full_name?.split(' ')[0] || 'Utente';

  const handleLockedClick = () => {
    setShowPaywall(true);
  };

  return (
    <div className="space-y-6">
      {/* Paywall Modal */}
      {showPaywall && (
        <Paywall
          opportunitiesCount={stats.totalOpportunities}
          estimatedRange={{ min: stats.estimatedRecoveryMin, max: stats.estimatedRecoveryMax }}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Ciao {firstName}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Ecco il riepilogo dei tuoi rimborsi
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFree && (
            <Button variant="outline" onClick={() => setShowPaywall(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Passa a Premium
            </Button>
          )}
          {!profile?.onboarding_completed && (
            <Button asChild>
              <Link to="/quiz">
                <Sparkles className="w-4 h-4 mr-2" />
                Completa il quiz
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-hero text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/80">
                {isFree ? 'Range stimato' : 'Importo stimato'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <Euro className="w-5 h-5" />
                {isFree ? (
                  <span className="text-2xl font-bold">
                    {stats.estimatedRecoveryMin.toLocaleString('it-IT')} - {stats.estimatedRecoveryMax.toLocaleString('it-IT')}
                  </span>
                ) : (
                  <span className="text-3xl font-bold">
                    {stats.estimatedRecoveryMax.toLocaleString('it-IT')}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/80 mt-1">recuperabile</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Opportunità trovate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">{stats.totalOpportunities}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.pendingOpportunities} in corso
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isPremium ? (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tasso di successo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="mt-2 h-2" />
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden cursor-pointer" onClick={handleLockedClick}>
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Lock className="w-4 h-4" />
                  <span>Sblocca con Premium</span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardDescription>Tasso di successo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold blur-sm">75%</span>
                </div>
                <Progress value={75} className="mt-2 h-2 blur-sm" />
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {isPremium ? (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Recuperato</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-primary">€{stats.actualRecovery.toLocaleString('it-IT')}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  da {stats.completedOpportunities} pratiche
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden cursor-pointer" onClick={handleLockedClick}>
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Lock className="w-4 h-4" />
                  <span>Sblocca con Premium</span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardDescription>Recuperato</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-primary blur-sm">€1.250</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 blur-sm">
                  da 3 pratiche
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Quick actions + Recent opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Azioni rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link to="/dashboard/opportunities">
                  <span className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4" />
                    Vedi opportunità
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link to="/dashboard/documents">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Carica documenti
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link to="/dashboard/notifications">
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifiche
                    {stats.unreadNotifications > 0 && (
                      <Badge variant="destructive" className="ml-1">
                        {stats.unreadNotifications}
                      </Badge>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Ultime opportunità</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/opportunities">
                  Vedi tutte <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOpportunities.length === 0 ? (
                <div className="text-center py-8">
                  <FileSearch className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Nessuna opportunità trovata</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Completa il quiz per scoprire i rimborsi che ti spettano
                  </p>
                  <Button asChild>
                    <Link to="/quiz">Inizia il quiz</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      onClick={isFree ? handleLockedClick : undefined}
                      className={isFree ? 'cursor-pointer' : ''}
                    >
                      {isFree ? (
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 relative">
                          <CompanyLogo
                            category={opp.opportunities?.category || 'other'}
                            matchedData={opp.matched_data as Record<string, unknown> | undefined}
                            opportunityTitle={opp.opportunities?.title}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-muted-foreground">
                              Opportunità di rimborso
                            </p>
                            <p className="text-sm text-muted-foreground/70 blur-[3px]">
                              {opp.opportunities?.short_description || 'Dettagli nascosti'}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <Badge className={statusColors[opp.status]}>
                              {statusLabels[opp.status]}
                            </Badge>
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ) : (
                        <Link
                          to={`/dashboard/opportunities/${opp.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <CompanyLogo
                            category={opp.opportunities?.category || 'other'}
                            matchedData={opp.matched_data as Record<string, unknown> | undefined}
                            opportunityTitle={opp.opportunities?.title}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {opp.opportunities?.title || 'Opportunità'}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {opp.opportunities?.short_description}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={statusColors[opp.status]}>
                              {statusLabels[opp.status]}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              €{opp.estimated_amount?.toLocaleString('it-IT')}
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upgrade CTA for free users */}
      {isFree && stats.totalOpportunities > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Sblocca il tuo potenziale di recupero</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hai trovato <strong>{stats.totalOpportunities} opportunità</strong> per un valore 
                    tra <strong>€{stats.estimatedRecoveryMin.toLocaleString('it-IT')}</strong> e{' '}
                    <strong>€{stats.estimatedRecoveryMax.toLocaleString('it-IT')}</strong>. 
                    Passa a Premium per sbloccare i dettagli e iniziare a recuperare i tuoi soldi.
                  </p>
                </div>
                <Button onClick={() => setShowPaywall(true)} size="lg" className="bg-gradient-hero hover:opacity-90">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sblocca tutto
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tips section - Only for premium */}
      {isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Suggerimento del giorno</h3>
                  <p className="text-sm text-muted-foreground">
                    Collega la tua email per scansionare automaticamente conferme di volo, 
                    ricevute e documenti bancari. Troveremo rimborsi che potresti aver dimenticato!
                  </p>
                  <Button variant="link" className="px-0 mt-2" asChild>
                    <Link to="/dashboard/documents">
                      Collega email <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
