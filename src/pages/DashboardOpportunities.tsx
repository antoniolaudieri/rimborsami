import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  ChevronRight,
  Clock,
  Euro,
  AlertCircle,
  CheckCircle2,
  Plane,
  ShoppingCart,
  Landmark,
  Shield,
  Package,
  FileQuestion,
} from 'lucide-react';

interface UserOpportunity {
  id: string;
  status: string;
  estimated_amount: number;
  deadline: string | null;
  created_at: string;
  opportunities: {
    id: string;
    title: string;
    category: string;
    short_description: string;
    description: string;
    min_amount: number;
    max_amount: number;
    legal_reference: string | null;
  } | null;
}

const statusColors: Record<string, string> = {
  found: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  started: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  sent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const statusLabels: Record<string, string> = {
  found: 'Trovata',
  started: 'Avviata',
  sent: 'Inviata',
  completed: 'Completata',
  expired: 'Scaduta',
};

const categoryIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-5 h-5" />,
  ecommerce: <ShoppingCart className="w-5 h-5" />,
  bank: <Landmark className="w-5 h-5" />,
  insurance: <Shield className="w-5 h-5" />,
  warranty: <Package className="w-5 h-5" />,
  other: <FileQuestion className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  ecommerce: 'E-commerce',
  bank: 'Banche',
  insurance: 'Assicurazioni',
  warranty: 'Garanzia',
  other: 'Altro',
};

export default function DashboardOpportunities() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<UserOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_opportunities')
        .select(`
          id,
          status,
          estimated_amount,
          deadline,
          created_at,
          opportunities (
            id,
            title,
            category,
            short_description,
            description,
            min_amount,
            max_amount,
            legal_reference
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data as UserOpportunity[] || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = 
      opp.opportunities?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.opportunities?.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && ['found', 'started', 'sent'].includes(opp.status);
    if (activeTab === 'completed') return matchesSearch && opp.status === 'completed';
    return matchesSearch && opp.opportunities?.category === activeTab;
  });

  const totalEstimated = filteredOpportunities.reduce((sum, o) => sum + (o.estimated_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Le tue opportunità</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci e monitora tutte le tue richieste di rimborso
        </p>
      </motion.div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-hero text-white">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm">Totale recuperabile (filtro attuale)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <Euro className="w-6 h-6" />
                  <span className="text-4xl font-bold">{totalEstimated.toLocaleString('it-IT')}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{filteredOpportunities.length}</p>
                  <p className="text-sm text-white/80">Opportunità</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {filteredOpportunities.filter(o => o.status === 'completed').length}
                  </p>
                  <p className="text-sm text-white/80">Completate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca opportunità..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Tutte</TabsTrigger>
          <TabsTrigger value="pending">In corso</TabsTrigger>
          <TabsTrigger value="completed">Completate</TabsTrigger>
          <TabsTrigger value="flight">Voli</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="bank">Banche</TabsTrigger>
          <TabsTrigger value="insurance">Assicurazioni</TabsTrigger>
          <TabsTrigger value="warranty">Garanzia</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessuna opportunità trovata</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Completa il quiz per scoprire le opportunità di rimborso disponibili per te'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/quiz">Inizia il quiz</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOpportunities.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/dashboard/opportunities/${opp.id}`}>
                    <Card className="hover:shadow-md transition-all hover:border-primary/30">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          {/* Category icon */}
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            {categoryIcons[opp.opportunities?.category || 'other']}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold truncate">
                                  {opp.opportunities?.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {categoryLabels[opp.opportunities?.category || 'other']}
                                  {opp.opportunities?.legal_reference && (
                                    <span className="ml-2">• {opp.opportunities.legal_reference}</span>
                                  )}
                                </p>
                              </div>
                              <Badge className={statusColors[opp.status]}>
                                {statusLabels[opp.status]}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {opp.opportunities?.short_description}
                            </p>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 font-medium text-primary">
                                  <Euro className="w-4 h-4" />
                                  {opp.estimated_amount?.toLocaleString('it-IT')}
                                </span>
                                {opp.deadline && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    Scade: {new Date(opp.deadline).toLocaleDateString('it-IT')}
                                  </span>
                                )}
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
