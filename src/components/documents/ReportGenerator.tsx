import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, FileCheck } from 'lucide-react';
import { generateAnomalyReport } from '@/lib/generateAnomalyReport';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Document, ParsedDocumentData } from '@/hooks/useDocuments';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReportGeneratorProps {
  documents: Document[];
  className?: string;
  variant?: 'default' | 'compact';
}

export function ReportGenerator({ 
  documents, 
  className,
  variant = 'default' 
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerateReport = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setIsComplete(false);

    try {
      // Prepare documents with proper typing
      const docsForReport = documents.map((doc) => ({
        id: doc.id,
        file_name: doc.file_name,
        created_at: doc.created_at,
        parsed_data: doc.parsed_data as ParsedDocumentData | null,
      }));

      // Get user info
      const userInfo = {
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utente',
        email: user?.email || '',
      };

      await generateAnomalyReport(docsForReport, userInfo);

      setIsComplete(true);
      toast({
        title: 'Report generato con successo',
        description: 'Il file PDF è stato scaricato automaticamente',
      });

      // Reset complete state after animation
      setTimeout(() => setIsComplete(false), 3000);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Errore nella generazione',
        description: 'Si è verificato un errore durante la creazione del report. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        onClick={handleGenerateReport}
        disabled={isGenerating || documents.length === 0}
        variant="outline"
        size="sm"
        className={cn('gap-2', className)}
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <FileCheck className="w-4 h-4 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <FileDown className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        {isGenerating ? 'Generazione...' : isComplete ? 'Scaricato!' : 'Scarica Report PDF'}
      </Button>
    );
  }

  return (
    <motion.div
      className={cn('relative', className)}
      initial={false}
      animate={isComplete ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Button
        onClick={handleGenerateReport}
        disabled={isGenerating || documents.length === 0}
        className={cn(
          'gap-2 transition-all duration-300',
          isComplete && 'bg-green-600 hover:bg-green-700'
        )}
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generazione report...</span>
            </motion.div>
          ) : isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Report scaricato!</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Scarica Report PDF</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Tooltip */}
      {!isGenerating && !isComplete && documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 left-0 right-0 text-center"
        >
          <span className="text-xs text-muted-foreground">
            Report completo con riferimenti normativi
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
