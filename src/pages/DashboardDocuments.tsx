import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocuments } from '@/hooks/useDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  File,
  Mail,
  Search,
  Filter,
  FileText,
  Image,
  X,
} from 'lucide-react';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { DocumentCard } from '@/components/documents/DocumentCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'error';
type FilterType = 'all' | 'pdf' | 'image' | 'email';

export default function DashboardDocuments() {
  const {
    documents,
    loading,
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    reprocessDocument,
    getPreviewUrl,
  } = useDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fileName = doc.file_name?.toLowerCase() || '';
      if (!fileName.includes(query)) return false;
    }

    // Status filter
    if (filterStatus !== 'all' && doc.processing_status !== filterStatus) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && doc.type !== filterType) {
      return false;
    }

    return true;
  });

  const handlePreview = async (fileUrl: string) => {
    const url = await getPreviewUrl(fileUrl);
    if (url) {
      setPreviewUrl(url);
      setPreviewOpen(true);
    }
  };

  const handleDelete = async (id: string, fileUrl: string | null) => {
    return deleteDocument(id, fileUrl);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterType('all');
  };

  const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterType !== 'all';

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
          Carica documenti per trovare automaticamente nuove opportunità di rimborso
        </p>
      </motion.div>

      {/* Upload area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DocumentUploader
          onUpload={uploadDocument}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
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
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>I tuoi documenti</CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento' : 'documenti'}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            {documents.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per nome file..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as FilterStatus)}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="pending">In attesa</SelectItem>
                    <SelectItem value="processing">Elaborazione</SelectItem>
                    <SelectItem value="completed">Completati</SelectItem>
                    <SelectItem value="error">Errori</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterType}
                  onValueChange={(v) => setFilterType(v as FilterType)}
                >
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="pdf">
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </span>
                    </SelectItem>
                    <SelectItem value="image">
                      <span className="flex items-center gap-2">
                        <Image className="w-3.5 h-3.5" /> Immagini
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Empty state */}
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nessun documento</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Carica il tuo primo documento per iniziare a trovare opportunità di rimborso automaticamente
                </p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">Nessun risultato</h3>
                <p className="text-sm text-muted-foreground">
                  Prova a modificare i filtri di ricerca
                </p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Rimuovi filtri
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onDelete={handleDelete}
                      onReprocess={reprocessDocument}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Anteprima documento</DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-auto max-h-[70vh] rounded-lg bg-muted">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Document preview"
                className="w-full h-auto object-contain"
                onError={() => {
                  // If image fails to load, it might be a PDF - open in new tab
                  window.open(previewUrl, '_blank');
                  setPreviewOpen(false);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
