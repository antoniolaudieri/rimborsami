import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Paywall } from '@/components/Paywall';
import DataCollectionForm from '@/components/opportunities/DataCollectionForm';
import OutcomeFeedback from '@/components/opportunities/OutcomeFeedback';
import { generateRequestPdf } from '@/lib/generateRequestPdf';
import {
  ArrowLeft,
  Clock,
  Euro,
  FileText,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Send,
  Plane,
  ShoppingCart,
  Landmark,
  Shield,
  Package,
  FileQuestion,
  Lock,
  Sparkles,
  ClipboardList,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

interface OpportunityDetail {
  id: string;
  status: string;
  estimated_amount: number;
  deadline: string | null;
  created_at: string;
  notes: string | null;
  matched_data: Record<string, unknown>;
  opportunities: {
    id: string;
    title: string;
    category: string;
    short_description: string;
    description: string;
    min_amount: number;
    max_amount: number;
    legal_reference: string | null;
    template_email: string | null;
    template_pec: string | null;
    source_url: string | null;
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

const categoryIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-6 h-6" />,
  ecommerce: <ShoppingCart className="w-6 h-6" />,
  bank: <Landmark className="w-6 h-6" />,
  insurance: <Shield className="w-6 h-6" />,
  warranty: <Package className="w-6 h-6" />,
  other: <FileQuestion className="w-6 h-6" />,
};

export default function DashboardOpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isPremium, isFree, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedText, setGeneratedText] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedRecipient, setGeneratedRecipient] = useState('');
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [estimatedRange, setEstimatedRange] = useState({ min: 0, max: 0 });
  const [hasUserData, setHasUserData] = useState(false);
  const [activeTab, setActiveTab] = useState('data');

  useEffect(() => {
    if (user && id) {
      fetchOpportunity();
      if (isFree) {
        fetchOpportunitiesStats();
      }
    }
  }, [user, id, isFree]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from('user_opportunities')
        .select(`
          id,
          status,
          estimated_amount,
          deadline,
          created_at,
          notes,
          matched_data,
          opportunities (
            id,
            title,
            category,
            short_description,
            description,
            min_amount,
            max_amount,
            legal_reference,
            template_email,
            template_pec,
            source_url
          )
        `)
        .eq('id', id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/dashboard/opportunities');
        return;
      }

      setOpportunity(data as OpportunityDetail);
      
      // Check if user has filled in their data
      const matchedData = data.matched_data as Record<string, unknown>;
      const hasData = matchedData && Object.keys(matchedData).length > 0 && 
        !('quiz_answers' in matchedData && Object.keys(matchedData).length === 1);
      setHasUserData(hasData);
      
      // If data exists, switch to request tab
      if (hasData) {
        setActiveTab('request');
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dettagli dell\'opportunità',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunitiesStats = async () => {
    try {
      const { data } = await supabase
        .from('user_opportunities')
        .select(`
          estimated_amount,
          opportunities (min_amount, max_amount)
        `)
        .eq('user_id', user?.id);

      if (data) {
        setOpportunitiesCount(data.length);
        const min = data.reduce((sum, o) => {
          const opp = o.opportunities as { min_amount?: number } | null;
          return sum + (opp?.min_amount || o.estimated_amount || 0);
        }, 0);
        const max = data.reduce((sum, o) => {
          const opp = o.opportunities as { max_amount?: number } | null;
          return sum + (opp?.max_amount || o.estimated_amount || 0);
        }, 0);
        setEstimatedRange({ min, max });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateRequest = async (type: 'email' | 'pec') => {
    if (!opportunity?.opportunities) return;

    setGenerating(true);
    
    try {
      // Call the edge function to generate with AI and real contacts
      const { data, error } = await supabase.functions.invoke('generate-request', {
        body: {
          user_opportunity_id: opportunity.id,
          request_type: type,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.request) {
        setGeneratedText(data.request.content);
        setGeneratedSubject(data.request.subject || '');
        setGeneratedRecipient(data.request.recipient || '');
        
        toast({
          title: 'Richiesta generata',
          description: `${type.toUpperCase()} pronta con destinatario reale`,
        });

        // Update opportunity status
        if (opportunity.status === 'found') {
          await updateStatus('started');
        }
      } else {
        throw new Error(data?.error || 'Errore nella generazione');
      }
    } catch (error: any) {
      console.error('Error generating request:', error);
      toast({
        title: 'Errore',
        description: error?.message || 'Impossibile generare la richiesta',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadPdf = () => {
    if (!opportunity?.opportunities || !generatedText) return;
    
    generateRequestPdf({
      subject: generatedSubject || `Richiesta ${opportunity.opportunities.title}`,
      recipient: generatedRecipient || 'Destinatario',
      content: generatedText,
      senderName: user?.user_metadata?.full_name || 'Nome Cognome',
      senderEmail: user?.email || '',
      opportunityTitle: opportunity.opportunities.title,
      legalReference: opportunity.opportunities.legal_reference || undefined,
      sourceUrl: opportunity.opportunities.source_url || undefined,
      date: new Date().toLocaleDateString('it-IT'),
    });

    toast({
      title: 'PDF scaricato',
      description: 'Il documento è stato scaricato con successo',
    });
  };

  const updateStatus = async (newStatus: 'found' | 'started' | 'sent' | 'completed' | 'expired') => {
    if (!opportunity) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_opportunities')
        .update({ 
          status: newStatus,
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', opportunity.id);

      if (error) throw error;

      setOpportunity({ ...opportunity, status: newStatus });
      toast({
        title: 'Stato aggiornato',
        description: `La pratica è ora "${statusLabels[newStatus]}"`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedText);
    toast({
      title: 'Copiato!',
      description: 'Il testo è stato copiato negli appunti',
    });
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show paywall for free users
  if (isFree) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alle opportunità
          </Button>
        </motion.div>

        <Paywall
          opportunitiesCount={opportunitiesCount}
          estimatedRange={estimatedRange}
          variant="fullpage"
        />
      </div>
    );
  }

  if (!opportunity) {
    return null;
  }

  const opp = opportunity.opportunities;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alle opportunità
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start gap-4"
      >
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {categoryIcons[opp?.category || 'other']}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{opp?.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-muted-foreground">
                {opp?.legal_reference && <span>{opp.legal_reference}</span>}
                {opp?.source_url && (
                  <a
                    href={opp.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Fonte normativa
                  </a>
                )}
              </div>
            </div>
            <Badge className={`${statusColors[opportunity.status]} text-base px-3 py-1`}>
              {statusLabels[opportunity.status]}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-hero text-white">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Importo stimato recuperabile</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <Euro className="w-6 h-6" />
                      <span className="text-4xl font-bold">
                        {opportunity.estimated_amount?.toLocaleString('it-IT')}
                      </span>
                    </div>
                    {opp && (
                      <p className="text-sm text-white/80 mt-2">
                        Range: €{opp.min_amount} - €{opp.max_amount}
                      </p>
                    )}
                  </div>
                  {opportunity.deadline && (
                    <div className="text-right">
                      <p className="text-white/80 text-sm">Scadenza</p>
                      <p className="font-semibold flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {new Date(opportunity.deadline).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Descrizione</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {opp?.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs for data collection and request generation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  <span className="hidden sm:inline">Dati</span>
                </TabsTrigger>
                <TabsTrigger value="request" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Richiesta</span>
                </TabsTrigger>
                <TabsTrigger value="outcome" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Esito</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <DataCollectionForm
                  category={opp?.category || 'other'}
                  userOpportunityId={opportunity.id}
                  existingData={opportunity.matched_data as Record<string, unknown>}
                  opportunityTitle={opp?.title}
                  onComplete={(data) => {
                    setHasUserData(true);
                    setOpportunity(prev => prev ? { ...prev, matched_data: data } : null);
                    setActiveTab('request');
                  }}
                />
              </TabsContent>

              <TabsContent value="request">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Genera richiesta
                    </CardTitle>
                    <CardDescription>
                      {hasUserData 
                        ? 'Genera automaticamente il testo con i tuoi dati' 
                        : 'Compila prima i tuoi dati nella scheda "Dati"'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!hasUserData && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Per generare una richiesta personalizzata, inserisci prima i tuoi dati specifici.
                        <Button 
                          variant="link" 
                          className="text-amber-800 underline p-0 h-auto ml-1"
                          onClick={() => setActiveTab('data')}
                        >
                          Vai ai dati →
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => generateRequest('email')}
                        disabled={generating || !opp?.template_email}
                        variant="outline"
                        className="flex-1"
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4 mr-2" />
                        )}
                        Email
                      </Button>
                      <Button
                        onClick={() => generateRequest('pec')}
                        disabled={generating || !opp?.template_pec}
                        variant="outline"
                        className="flex-1"
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        PEC
                      </Button>
                    </div>

                    {generatedText && (
                      <div className="space-y-4">
                        {/* Recipient and Subject info */}
                        {generatedRecipient && (
                          <div className="p-3 bg-muted rounded-lg space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Destinatario:</span>{' '}
                              <span className="text-primary">{generatedRecipient}</span>
                            </p>
                            {generatedSubject && (
                              <p className="text-sm">
                                <span className="font-medium">Oggetto:</span> {generatedSubject}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <Textarea
                          value={generatedText}
                          onChange={(e) => setGeneratedText(e.target.value)}
                          rows={12}
                          className="font-mono text-sm"
                        />
                        
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={copyToClipboard} variant="secondary">
                            <Copy className="w-4 h-4 mr-2" />
                            Copia testo
                          </Button>
                          <Button onClick={downloadPdf} variant="default">
                            <Download className="w-4 h-4 mr-2" />
                            Scarica PDF
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          💡 Controlla il testo, scarica il PDF e invialo all'azienda. 
                          Una volta inviato, aggiorna lo stato a "Inviata".
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outcome">
                <OutcomeFeedback
                  userOpportunityId={opportunity.id}
                  currentOutcome={(opportunity as any).outcome || 'pending'}
                  estimatedAmount={opportunity.estimated_amount}
                  onUpdate={(outcome, actualAmount) => {
                    setOpportunity(prev => prev ? { 
                      ...prev, 
                      status: outcome === 'success' || outcome === 'partial' ? 'completed' : prev.status 
                    } : null);
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Right column - Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Aggiorna stato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['found', 'started', 'sent', 'completed'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={opportunity.status === status ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => updateStatus(status)}
                    disabled={updating || opportunity.status === status}
                  >
                    {opportunity.status === status && (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {statusLabels[status]}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Suggerimento</p>
                    <p className="text-muted-foreground">
                      Per aumentare le probabilità di successo, invia la richiesta tramite PEC 
                      se disponibile. La PEC ha valore legale.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
