import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, FileText, Image, CheckCircle2, Sparkles, X, Camera, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DocumentFormFillerProps {
  category: string;
  onDataExtracted: (data: Record<string, string>) => void;
}

type ExtractionStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function DocumentFormFiller({ category, onDataExtracted }: DocumentFormFillerProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedFields, setExtractedFields] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file) return;

    // Validate file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato non supportato',
        description: 'Carica un PDF o un\'immagine (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File troppo grande',
        description: 'Il file deve essere inferiore a 10MB',
        variant: 'destructive',
      });
      return;
    }

    setStatus('uploading');
    setProgress(20);
    setErrorMessage(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      setStatus('processing');
      setProgress(50);

      // Call extraction API
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-form-data`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Errore ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && Object.keys(result.data).length > 0) {
        setProgress(100);
        setStatus('success');
        setExtractedFields(Object.keys(result.data));
        
        // Pass extracted data to parent
        onDataExtracted(result.data);
        
        toast({
          title: '✨ Dati estratti!',
          description: `Trovati ${Object.keys(result.data).length} campi dal documento`,
        });

        // Reset after delay
        setTimeout(() => {
          setStatus('idle');
          setProgress(0);
          setExtractedFields([]);
        }, 3000);
      } else {
        throw new Error('Nessun dato trovato nel documento');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Errore nell\'estrazione');
      toast({
        title: 'Estrazione fallita',
        description: error instanceof Error ? error.message : 'Impossibile estrarre i dati',
        variant: 'destructive',
      });

      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'idle') {
      setIsDragOver(true);
    }
  }, [status]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (status !== 'idle') return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, [status, category]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    e.target.value = '';
  };

  const getHelpText = () => {
    const texts: Record<string, string> = {
      flight: 'carta d\'imbarco, conferma prenotazione, email della compagnia',
      ecommerce: 'conferma ordine, email di spedizione, fattura',
      bank: 'estratto conto, contabile bonifico, riepilogo spese',
      telecom: 'bolletta telefonica, fattura operatore',
      energy: 'bolletta luce/gas, fattura fornitore',
      insurance: 'polizza, certificato assicurativo, preventivo',
      warranty: 'scontrino, fattura, garanzia prodotto',
    };
    return texts[category] || 'documento, fattura, scontrino';
  };

  return (
    <div className="mb-6">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'block cursor-pointer transition-all',
          status !== 'idle' && 'pointer-events-none'
        )}
      >
        <motion.div
          animate={{
            borderColor: isDragOver ? 'hsl(var(--primary))' : status === 'success' ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(var(--border))',
            backgroundColor: isDragOver 
              ? 'hsl(var(--primary) / 0.05)' 
              : status === 'success' 
                ? 'hsl(142.1 76.2% 36.3% / 0.05)' 
                : 'hsl(var(--muted) / 0.3)',
          }}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center transition-all',
            status === 'idle' && 'hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <ScanLine className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-2 justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Compila automaticamente con un documento
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Carica {getHelpText()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </span>
                  <span className="flex items-center gap-1">
                    <Image className="w-3.5 h-3.5" /> Immagine
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> Foto
                  </span>
                </div>
              </motion.div>
            )}

            {(status === 'uploading' || status === 'processing') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3 py-2"
              >
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {status === 'uploading' ? 'Caricamento...' : 'Estrazione dati con AI...'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status === 'processing' && 'Analisi OCR in corso'}
                  </p>
                </div>
                <Progress value={progress} className="w-48 h-2" />
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3 py-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <div>
                  <p className="font-medium text-sm text-green-600">
                    ✨ {extractedFields.length} campi compilati!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verifica i dati e completa i campi mancanti
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3 py-2"
              >
                <X className="w-10 h-10 text-destructive" />
                <div>
                  <p className="font-medium text-sm text-destructive">
                    Estrazione fallita
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {errorMessage || 'Riprova con un documento più chiaro'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          disabled={status !== 'idle'}
        />
      </label>
    </div>
  );
}
