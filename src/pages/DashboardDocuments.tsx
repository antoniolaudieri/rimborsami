import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocuments, hasAnomalies, getRiskScore, type ParsedDocumentData } from '@/hooks/useDocuments';
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
  AlertTriangle,
  ArrowUpDown,
  ShieldAlert,
  FileDown,
} from 'lucide-react';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { ReportGenerator } from '@/components/documents/ReportGenerator';
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
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'error';
type FilterType = 'all' | 'pdf' | 'image' | 'email';
type FilterAnomaly = 'all' | 'with_anomalies' | 'without_anomalies';
type SortOption = 'date_desc' | 'date_asc' | 'risk_desc' | 'risk_asc';

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
  const [filterAnomaly, setFilterAnomaly] = useState<FilterAnomaly>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Calculate anomaly stats
  const anomalyStats = useMemo(() => {
    let withAnomalies = 0;
    let criticalCount = 0;
    let highCount = 0;
    let totalEstimatedRefund = 0;

    documents.forEach((doc) => {
      const parsedData = doc.parsed_data as ParsedDocumentData | null;
      if (hasAnomalies(parsedData)) {
        withAnomalies++;
        const riskScore = getRiskScore(parsedData);
        if (riskScore >= 75) criticalCount++;
        else if (riskScore >= 50) highCount++;
        
        // Calculate estimated refund
        if (parsedData?.bank_analysis?.estimated_refund) {
          totalEstimatedRefund += parsedData.bank_analysis.estimated_refund;
        }
      }
    });

    return { withAnomalies, criticalCount, highCount, totalEstimatedRefund };
  }, [documents]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter((doc) => {
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

      // Anomaly filter
      if (filterAnomaly !== 'all') {
        const parsedData = doc.parsed_data as ParsedDocumentData | null;
        const docHasAnomalies = hasAnomalies(parsedData);
        if (filterAnomaly === 'with_anomalies' && !docHasAnomalies) return false;
        if (filterAnomaly === 'without_anomalies' && docHasAnomalies) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'risk_desc': {
          const riskA = getRiskScore(a.parsed_data as ParsedDocumentData | null);
          const riskB = getRiskScore(b.parsed_data as ParsedDocumentData | null);
          return riskB - riskA;
        }
        case 'risk_asc': {
          const riskA = getRiskScore(a.parsed_data as ParsedDocumentData | null);
          const riskB = getRiskScore(b.parsed_data as ParsedDocumentData | null);
          return riskA - riskB;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, filterStatus, filterType, filterAnomaly, sortOption]);

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
    setFilterAnomaly('all');
    setSortOption('date_desc');
  };

  const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterType !== 'all' || filterAnomaly !== 'all';

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

      {/* Anomaly Summary Banner */}
      <AnimatePresence>
        {anomalyStats.withAnomalies > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
          >
            <Card className={cn(
              'border-2 overflow-hidden',
              anomalyStats.criticalCount > 0 
                ? 'border-red-500/50 bg-gradient-to-r from-red-500/10 to-red-500/5'
                : anomalyStats.highCount > 0
                ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-orange-500/5'
                : 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-amber-500/5'
            )}>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <motion.div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      anomalyStats.criticalCount > 0 
                        ? 'bg-red-500/20'
                        : anomalyStats.highCount > 0
                        ? 'bg-orange-500/20'
                        : 'bg-amber-500/20'
                    )}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ShieldAlert className={cn(
                      'w-6 h-6',
                      anomalyStats.criticalCount > 0 
                        ? 'text-red-500'
                        : anomalyStats.highCount > 0
                        ? 'text-orange-500'
                        : 'text-amber-500'
                    )} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span>{anomalyStats.withAnomalies} documenti con anomalie rilevate</span>
                      {anomalyStats.criticalCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
                          {anomalyStats.criticalCount} critici
                        </span>
                      )}
                      {anomalyStats.highCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white">
                          {anomalyStats.highCount} alti
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {anomalyStats.totalEstimatedRefund > 0 
                        ? `Potenziale rimborso stimato: €${anomalyStats.totalEstimatedRefund.toLocaleString('it-IT')}`
                        : 'Espandi i documenti per visualizzare i dettagli delle anomalie'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <ReportGenerator 
                      documents={documents} 
                      variant="compact"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setFilterAnomaly('with_anomalies')}
                      className="gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Mostra solo anomalie
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="flex flex-col gap-3">
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
                </div>
                
                {/* Second row of filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select
                    value={filterAnomaly}
                    onValueChange={(v) => setFilterAnomaly(v as FilterAnomaly)}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Anomalie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le anomalie</SelectItem>
                      <SelectItem value="with_anomalies">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                          Con anomalie
                        </span>
                      </SelectItem>
                      <SelectItem value="without_anomalies">
                        <span className="flex items-center gap-2">
                          Senza anomalie
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={sortOption}
                    onValueChange={(v) => setSortOption(v as SortOption)}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Ordina per" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Data: più recenti</SelectItem>
                      <SelectItem value="date_asc">Data: meno recenti</SelectItem>
                      <SelectItem value="risk_desc">Rischio: più alto</SelectItem>
                      <SelectItem value="risk_asc">Rischio: più basso</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="gap-2">
                      <X className="w-4 h-4" />
                      Rimuovi filtri
                    </Button>
                  )}
                </div>
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
