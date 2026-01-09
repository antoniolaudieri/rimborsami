import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Mail,
  Send,
  Loader2,
  Copy,
  ExternalLink,
  FileQuestion,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedRequest {
  id: string;
  type: string;
  content: string;
  recipient: string | null;
  subject: string | null;
  created_at: string;
  user_opportunity_id: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-5 h-5" />,
  pec: <Send className="w-5 h-5" />,
  form: <FileText className="w-5 h-5" />,
};

const typeLabels: Record<string, string> = {
  email: 'Email',
  pec: 'PEC',
  form: 'Modulo',
};

export default function DashboardRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<GeneratedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      // First get user's opportunities
      const { data: opportunities } = await supabase
        .from('user_opportunities')
        .select('id')
        .eq('user_id', user?.id);

      if (!opportunities || opportunities.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const opportunityIds = opportunities.map(o => o.id);

      const { data, error } = await supabase
        .from('generated_requests')
        .select('*')
        .in('user_opportunity_id', opportunityIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: 'Copiato!',
      description: 'Il testo è stato copiato negli appunti',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">Richieste generate</h1>
        <p className="text-muted-foreground mt-1">
          Tutte le richieste di rimborso che hai generato
        </p>
      </motion.div>

      {/* Requests list */}
      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessuna richiesta generata</h3>
              <p className="text-muted-foreground mb-6">
                Vai alle tue opportunità per generare le richieste di rimborso
              </p>
              <Button asChild>
                <Link to="/dashboard/opportunities">Vedi opportunità</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {typeIcons[request.type] || <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {typeLabels[request.type]} generata
                        </CardTitle>
                        <CardDescription>
                          {new Date(request.created_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {typeLabels[request.type]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono max-h-48 overflow-y-auto">
                      {request.content}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(request.content)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copia
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/opportunities/${request.user_opportunity_id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Vedi opportunità
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
