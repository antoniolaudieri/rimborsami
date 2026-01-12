import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Paywall } from '@/components/Paywall';
import { CompanyLogo } from '@/components/opportunities/CompanyLogo';
import {
  Search,
  ChevronRight,
  Clock,
  Euro,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';

interface UserOpportunity {
  id: string;
  status: string;
  estimated_amount: number;
  deadline: string | null;
  created_at: string;
  matched_data: Record<string, unknown> | null;
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

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  ecommerce: 'E-commerce',
  bank: 'Banche',
  insurance: 'Assicurazioni',
  warranty: 'Garanzia',
  telecom: 'Telecomunicazioni',
  energy: 'Energia',
  transport: 'Trasporti',
  automotive: 'Auto',
  tech: 'Tech/Privacy',
  class_action: 'Class Action',
  other: 'Altro',
};

export default function DashboardOpportunities() {
  const { user } = useAuth();
  const { isPremium, isFree } = useSubscription();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<UserOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showPaywall, setShowPaywall] = useState(false);

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
          matched_data,
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

  // Calculate ranges for free users
  const totalEstimatedMin = filteredOpportunities.reduce((sum, o) => 
    sum + (o.opportunities?.min_amount || o.estimated_amount || 0), 0);
  const totalEstimatedMax = filteredOpportunities.reduce((sum, o) => 
    sum + (o.opportunities?.max_amount || o.estimated_amount || 0), 0);

  const handleOpportunityClick = (oppId: string) => {
    if (isFree) {
      setShowPaywall(true);
    } else {
      navigate(`/dashboard/opportunities/${oppId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Paywall Modal */}
      {showPaywall && (
        <Paywall
          opportunitiesCount={opportunities.length}
          estimatedRange={{ min: totalEstimatedMin, max: totalEstimatedMax }}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Le tue opportunità</h1>
          <p className="text-muted-foreground mt-1">
            {isFree 
              ? 'Passa a Premium per vedere i dettagli e avviare le pratiche' 
              : 'Gestisci e monitora tutte le tue richieste di rimborso'}
          </p>
        </div>
        {isFree && (
          <Button onClick={() => setShowPaywall(true)} className="bg-gradient-hero hover:opacity-90">
            <Sparkles className="w-4 h-4 mr-2" />
            Sblocca dettagli
          </Button>
        )}
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
                <p className="text-white/80 text-sm">
                  {isFree ? 'Range recuperabile stimato' : 'Totale recuperabile'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <Euro className="w-6 h-6" />
                  {isFree ? (
                    <span className="text-3xl font-bold">
                      {totalEstimatedMin.toLocaleString('it-IT')} - {totalEstimatedMax.toLocaleString('it-IT')}
                    </span>
                  ) : (
                    <span className="text-4xl font-bold">{totalEstimatedMax.toLocaleString('it-IT')}</span>
                  )}
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

      {/* Filters - Only searchable for premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isPremium ? "Cerca opportunità..." : "Cerca (Premium)"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={isFree}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Tutte</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">In corso</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">Completate</TabsTrigger>
          <TabsTrigger value="flight" className="text-xs sm:text-sm">Voli</TabsTrigger>
          <TabsTrigger value="ecommerce" className="text-xs sm:text-sm">E-commerce</TabsTrigger>
          <TabsTrigger value="bank" className="text-xs sm:text-sm">Banche</TabsTrigger>
          <TabsTrigger value="class_action" className="text-xs sm:text-sm">Class Action</TabsTrigger>
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
                  <div onClick={() => handleOpportunityClick(opp.id)} className="cursor-pointer">
                    <Card className={`hover:shadow-md transition-all ${isFree ? 'hover:border-primary/30' : 'hover:border-primary/30'}`}>
                      <CardContent className="py-3 px-3 sm:py-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          {/* Company logo or category icon */}
                          <CompanyLogo 
                            category={opp.opportunities?.category || 'other'}
                            matchedData={opp.matched_data as Record<string, unknown> | undefined}
                            opportunityTitle={opp.opportunities?.title}
                            size="md"
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                              <div className="min-w-0">
                                {isFree ? (
                                  <>
                                    <h3 className="font-semibold text-muted-foreground text-sm sm:text-base">
                                      Opportunità • {categoryLabels[opp.opportunities?.category || 'other']}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5 blur-[3px] select-none">
                                      Nome azienda nascosto
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 sm:line-clamp-1">
                                      {opp.opportunities?.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                      {categoryLabels[opp.opportunities?.category || 'other']}
                                      <span className="hidden sm:inline">
                                        {opp.opportunities?.legal_reference && (
                                          <span className="ml-2">• {opp.opportunities.legal_reference}</span>
                                        )}
                                      </span>
                                    </p>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                <Badge className={`${statusColors[opp.status]} text-xs`}>
                                  {statusLabels[opp.status]}
                                </Badge>
                                {isFree && <Lock className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </div>

                            {/* Hide description on mobile for cleaner cards */}
                            {isFree ? (
                              <p className="hidden sm:block text-sm text-muted-foreground mt-2 blur-[3px] select-none">
                                Descrizione dettagliata dell'opportunità nascosta. Sblocca per vedere...
                              </p>
                            ) : (
                              <p className="hidden sm:block text-sm text-muted-foreground mt-2 line-clamp-2">
                                {opp.opportunities?.short_description}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-2 sm:mt-3">
                              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                {isFree ? (
                                  <span className="flex items-center gap-1 font-medium text-primary">
                                    <Euro className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {opp.opportunities?.min_amount?.toLocaleString('it-IT')} - {opp.opportunities?.max_amount?.toLocaleString('it-IT')}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 font-medium text-primary">
                                    <Euro className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {opp.estimated_amount?.toLocaleString('it-IT')}
                                  </span>
                                )}
                                {isPremium && opp.deadline && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Scade:</span> {new Date(opp.deadline).toLocaleDateString('it-IT')}
                                  </span>
                                )}
                                {isFree && (
                                  <span className="hidden sm:flex items-center gap-1 text-muted-foreground blur-[3px]">
                                    <Clock className="w-4 h-4" />
                                    Scadenza nascosta
                                  </span>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bottom CTA for free users */}
      {isFree && filteredOpportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="py-6 text-center">
              <Lock className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-lg mb-2">
                Sblocca i dettagli di tutte le {filteredOpportunities.length} opportunità
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Vedi il nome delle aziende, gli importi esatti, le scadenze e genera 
                automaticamente le richieste di rimborso.
              </p>
              <Button onClick={() => setShowPaywall(true)} size="lg" className="bg-gradient-hero hover:opacity-90">
                <Sparkles className="w-4 h-4 mr-2" />
                Passa a Premium
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
