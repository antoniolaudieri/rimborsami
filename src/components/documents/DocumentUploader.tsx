import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, FileText, Image, X, CheckCircle2, Plane, ShoppingBag, Smartphone, Zap, Building2, Shield, Car, Sparkles, Home, Briefcase, HeartPulse, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onUpload: (file: File) => Promise<boolean>;
  uploading: boolean;
  uploadProgress: number;
  disabled?: boolean;
}

interface QueuedFile {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  preview?: string;
}

const SUPPORTED_CATEGORIES = [
  { id: 'flight', label: 'Voli', icon: Plane, examples: 'Biglietti aerei, carte imbarco' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, examples: 'Ordini Amazon, Zalando, eBay' },
  { id: 'telecom', label: 'Telecom', icon: Smartphone, examples: 'Bollette TIM, Vodafone, Wind' },
  { id: 'energy', label: 'Energia', icon: Zap, examples: 'Bollette luce e gas' },
  { id: 'bank', label: 'Banche', icon: Building2, examples: 'Estratti conto, mutui, prestiti' },
  { id: 'insurance', label: 'Assicurazioni', icon: Shield, examples: 'Polizze, contratti' },
  { id: 'automotive', label: 'Auto', icon: Car, examples: 'Bollo, assicurazione, multe, revisione' },
  { id: 'condominium', label: 'Condominio', icon: Home, examples: 'Verbali assemblea, rendiconti, tabelle millesimali' },
  { id: 'work', label: 'Lavoro', icon: Briefcase, examples: 'Buste paga, contratti, CUD, TFR' },
  { id: 'health', label: 'Sanità', icon: HeartPulse, examples: 'Fatture mediche, referti, ticket' },
  { id: 'fiscal', label: 'Fisco', icon: FileSpreadsheet, examples: '730, F24, visure catastali' },
];

export function DocumentUploader({
  onUpload,
  uploading,
  uploadProgress,
  disabled,
}: DocumentUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const processFile = async (file: File) => {
    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    const queueItem: QueuedFile = { file, status: 'pending', preview };
    setQueue((prev) => [...prev, queueItem]);

    // Upload file
    setQueue((prev) =>
      prev.map((q) =>
        q.file === file ? { ...q, status: 'uploading' } : q
      )
    );

    const success = await onUpload(file);

    setQueue((prev) =>
      prev.map((q) =>
        q.file === file
          ? { ...q, status: success ? 'completed' : 'error' }
          : q
      )
    );

    // Remove from queue after 2 seconds
    setTimeout(() => {
      setQueue((prev) => prev.filter((q) => q.file !== file));
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    }, 2000);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled || uploading) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(
        (f) =>
          f.type === 'application/pdf' ||
          f.type.startsWith('image/')
      );

      for (const file of validFiles) {
        await processFile(file);
      }
    },
    [disabled, uploading, onUpload]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await processFile(file);
    }

    e.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Carica documenti
            </CardTitle>
            <CardDescription className="mt-1">
              Carica i tuoi documenti e scopriremo automaticamente nuove opportunità di rimborso
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Analysis
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'block cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <motion.div
            animate={{
              borderColor: isDragOver ? 'hsl(var(--primary))' : 'hsl(var(--border))',
              backgroundColor: isDragOver ? 'hsl(var(--primary) / 0.05)' : 'transparent',
            }}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
              !disabled && 'hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <AnimatePresence mode="wait">
              {uploading ? (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="font-medium">Caricamento in corso...</p>
                  <Progress value={uploadProgress} className="w-48 h-2" />
                  <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                </motion.div>
              ) : isDragOver ? (
                <motion.div
                  key="dragover"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Upload className="w-10 h-10 text-primary" />
                  <p className="font-medium text-primary">Rilascia per caricare</p>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium">Trascina qui i tuoi documenti</p>
                  <p className="text-sm text-muted-foreground">
                    oppure clicca per selezionare
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </span>
                    <span className="flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" /> JPG, PNG
                    </span>
                    <span>Max 10MB</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />
        </label>

        {/* Categories info */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showCategories ? 'Nascondi categorie supportate' : 'Quali documenti posso caricare?'}
          </button>
          
          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
                  {SUPPORTED_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-start gap-2 p-2 rounded-md bg-background"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <cat.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{cat.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{cat.examples}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  💡 Ogni documento caricato viene analizzato dall'AI per trovare nuove opportunità di rimborso
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upload queue */}
        <AnimatePresence>
          {queue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {queue.map((item, index) => (
                <motion.div
                  key={`${item.file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {/* Preview */}
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center overflow-hidden">
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>

                  {/* Status */}
                  {item.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  )}
                  {item.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <X className="w-5 h-5 text-destructive" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
