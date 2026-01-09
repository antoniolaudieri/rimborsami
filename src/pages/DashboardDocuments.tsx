import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  Image,
  Mail,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  File,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  type: string;
  source: string;
  file_name: string | null;
  file_url: string | null;
  processing_status: string;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'In attesa',
  processing: 'Elaborazione',
  completed: 'Completato',
  error: 'Errore',
};

export default function DashboardDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];

    try {
      // Determine file type
      let fileType: 'pdf' | 'image' | 'email' = 'pdf';
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type === 'application/pdf') {
        fileType = 'pdf';
      }

      // For now, just create a document record (storage bucket would be needed for actual upload)
      const { error } = await supabase.from('documents').insert({
        user_id: user?.id,
        type: fileType,
        source: 'upload',
        file_name: file.name,
        processing_status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Documento caricato',
        description: 'Il documento verrà analizzato a breve',
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare il documento',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await supabase.from('documents').delete().eq('id', id);
      setDocuments(documents.filter(d => d.id !== id));
      toast({
        title: 'Eliminato',
        description: 'Il documento è stato eliminato',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold">Documenti</h1>
        <p className="text-muted-foreground mt-1">
          Carica documenti per trovare nuove opportunità di rimborso
        </p>
      </motion.div>

      {/* Upload area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Carica documenti
            </CardTitle>
            <CardDescription>
              Carica scontrini, conferme di prenotazione, estratti conto e altri documenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="block">
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">Trascina qui i tuoi file</p>
                    <p className="text-sm text-muted-foreground">
                      oppure clicca per selezionare
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, JPG, PNG fino a 10MB
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connect email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Collega la tua email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Scansiona automaticamente conferme di volo, ricevute e documenti bancari
                </p>
              </div>
              <Button variant="outline" disabled>
                <Mail className="w-4 h-4 mr-2" />
                Prossimamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>I tuoi documenti</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <File className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">Nessun documento</h3>
                <p className="text-sm text-muted-foreground">
                  Carica il tuo primo documento per iniziare
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                      {typeIcons[doc.type] || <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {doc.file_name || 'Documento'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <Badge className={statusColors[doc.processing_status]}>
                      {statusLabels[doc.processing_status]}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
