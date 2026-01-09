import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';

interface DashboardStats {
  totalOpportunities: number;
  completedOpportunities: number;
  pendingOpportunities: number;
  estimatedRecovery: number;
  actualRecovery: number;
  unreadNotifications: number;
}

interface UserOpportunity {
  id: string;
  status: string;
  estimated_amount: number;
  deadline: string | null;
  created_at: string;
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
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    completedOpportunities: 0,
    pendingOpportunities: 0,
    estimatedRecovery: 0,
    actualRecovery: 0,
    unreadNotifications: 0,
  });
  const [recentOpportunities, setRecentOpportunities] = useState<UserOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; onboarding_completed: boolean } | null>(null);

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
          opportunities (
            title,
            category,
            short_description
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
        
        setStats({
          totalOpportunities: opportunities.length,
          completedOpportunities: completed.length,
          pendingOpportunities: pending.length,
          estimatedRecovery: opportunities.reduce((sum, o) => sum + (o.estimated_amount || 0), 0),
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

  return (
    <div className="space-y-6">
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
        {!profile?.onboarding_completed && (
          <Button asChild>
            <Link to="/quiz">
              <Sparkles className="w-4 h-4 mr-2" />
              Completa il quiz
            </Link>
          </Button>
        )}
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
              <CardDescription className="text-white/80">Importo stimato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <Euro className="w-5 h-5" />
                <span className="text-3xl font-bold">{stats.estimatedRecovery.toLocaleString('it-IT')}</span>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
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
                    Cerca nuove opportunità
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
                    <Link
                      key={opp.id}
                      to={`/dashboard/opportunities/${opp.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                        {categoryIcons[opp.opportunities?.category || 'other']}
                      </div>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips section */}
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
    </div>
  );
}
