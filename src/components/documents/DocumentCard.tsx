import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Image,
  Mail,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Document, ParsedDocumentData } from '@/hooks/useDocuments';
import { hasAnomalies, getRiskScore, getRiskLevel } from '@/hooks/useDocuments';
import { ParsedDataView } from './ParsedDataView';
import { RiskBadge } from './RiskScoreGauge';
import { ProcessingAnimation } from './ProcessingAnimation';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string, fileUrl: string | null) => Promise<boolean>;
  onReprocess: (id: string) => Promise<boolean>;
  onPreview: (fileUrl: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'In attesa',
  },
  processing: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    label: 'Elaborazione',
  },
  completed: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Completato',
  },
  error: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: 'Errore',
  },
};

const documentTypeLabels: Record<string, string> = {
  flight: 'Volo / Biglietto aereo',
  order: 'Ordine / E-commerce',
  bill: 'Bolletta',
  receipt: 'Scontrino / Ricevuta',
  bank_statement: 'Estratto conto',
  warranty: 'Garanzia',
  other: 'Altro documento',
};

const riskLevelConfig = {
  low: { 
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
    border: 'border-green-200 dark:border-green-800'
  },
  medium: { 
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: AlertTriangle,
    border: 'border-amber-200 dark:border-amber-800'
  },
  high: { 
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertTriangle,
    border: 'border-orange-200 dark:border-orange-800'
  },
  critical: { 
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: ShieldAlert,
    border: 'border-red-200 dark:border-red-800'
  },
};

export function DocumentCard({
  document,
  onDelete,
  onReprocess,
  onPreview,
}: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const status = document.processing_status || 'pending';
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const parsedData = document.parsed_data as ParsedDocumentData | null;
  
  const documentHasAnomalies = hasAnomalies(parsedData);
  const riskScore = getRiskScore(parsedData);
  const riskLevel = getRiskLevel(parsedData);

  // Show processing animation when status is processing
  useEffect(() => {
    if (status === 'processing') {
      setShowProcessingAnimation(true);
    } else if (status === 'completed' && showProcessingAnimation) {
      // Keep animation briefly to show completion
      const timer = setTimeout(() => {
        setShowProcessingAnimation(false);
        // Trigger shake if anomalies found
        if (documentHasAnomalies) {
          setShouldShake(true);
          setTimeout(() => setShouldShake(false), 600);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (status !== 'processing') {
      setShowProcessingAnimation(false);
    }
  }, [status, documentHasAnomalies, showProcessingAnimation]);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(document.id, document.file_url);
    setDeleting(false);
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    setShowProcessingAnimation(true);
    await onReprocess(document.id);
    setReprocessing(false);
  };

  const handlePreview = () => {
    if (document.file_url) {
      onPreview(document.file_url);
    }
  };

  const hasResults = status === 'completed' && parsedData;
  const riskConfig = riskLevel ? riskLevelConfig[riskLevel] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: shouldShake ? [0, -5, 5, -5, 5, 0] : 0,
      }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        x: { duration: 0.5, ease: "easeInOut" }
      }}
      className={cn(
        'rounded-xl border bg-card transition-all overflow-hidden',
        expanded && 'shadow-lg',
        riskConfig?.border,
        documentHasAnomalies && riskLevel === 'critical' && 'ring-2 ring-red-500/20',
        documentHasAnomalies && riskLevel === 'high' && 'ring-2 ring-orange-500/20'
      )}
    >
      {/* Processing Animation Overlay */}
      <AnimatePresence>
        {showProcessingAnimation && status === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <ProcessingAnimation 
              status="processing"
              documentType={parsedData?.document_type}
              hasAnomalies={documentHasAnomalies}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main row */}
      {(!showProcessingAnimation || status !== 'processing') && (
        <div className="flex items-center gap-4 p-4">
          {/* Icon with risk indicator */}
          <div className="relative">
            <div className={cn(
              'w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 transition-colors',
              documentHasAnomalies && riskLevel === 'critical' && 'bg-red-100 dark:bg-red-900/30',
              documentHasAnomalies && riskLevel === 'high' && 'bg-orange-100 dark:bg-orange-900/30'
            )}>
              {typeIcons[document.type] || <FileText className="w-5 h-5" />}
            </div>
            {/* Anomaly indicator dot */}
            {documentHasAnomalies && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                  riskLevel === 'critical' && 'bg-red-500',
                  riskLevel === 'high' && 'bg-orange-500',
                  riskLevel === 'medium' && 'bg-amber-500'
                )}
              >
                <AlertTriangle className="w-2.5 h-2.5 text-white" />
              </motion.div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{document.file_name || 'Documento'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {new Date(document.created_at).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {document.file_size && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {(document.file_size / 1024).toFixed(0)} KB
                  </span>
                </>
              )}
              {parsedData?.document_type && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-primary font-medium">
                    {documentTypeLabels[parsedData.document_type] || parsedData.document_type}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Risk Badge (for completed documents with risk) */}
          {hasResults && riskScore > 0 && (
            <RiskBadge score={riskScore} />
          )}

          {/* Status badge */}
          <Badge className={cn('gap-1', statusInfo.color)}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {document.file_url && (
              <Button size="icon" variant="ghost" onClick={handlePreview}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            
            {status === 'error' && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleReprocess}
                disabled={reprocessing}
              >
                {reprocessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>

            {hasResults && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Anomaly Alert Banner */}
      <AnimatePresence>
        {hasResults && documentHasAnomalies && !expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              'px-4 py-2 border-t flex items-center gap-2 text-sm cursor-pointer',
              riskLevel === 'critical' && 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
              riskLevel === 'high' && 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
              riskLevel === 'medium' && 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
            )}
            onClick={() => setExpanded(true)}
          >
            <ShieldAlert className={cn(
              'w-4 h-4',
              riskLevel === 'critical' && 'text-red-600',
              riskLevel === 'high' && 'text-orange-600',
              riskLevel === 'medium' && 'text-amber-600'
            )} />
            <span className={cn(
              'font-medium',
              riskLevel === 'critical' && 'text-red-700 dark:text-red-400',
              riskLevel === 'high' && 'text-orange-700 dark:text-orange-400',
              riskLevel === 'medium' && 'text-amber-700 dark:text-amber-400'
            )}>
              {riskLevel === 'critical' && 'Anomalie critiche rilevate'}
              {riskLevel === 'high' && 'Anomalie importanti rilevate'}
              {riskLevel === 'medium' && 'Potenziali anomalie rilevate'}
            </span>
            <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && hasResults && parsedData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t px-4 pb-4"
          >
            <ParsedDataView data={parsedData} />
            
            {/* Link to opportunities */}
            {parsedData.suggested_categories && parsedData.suggested_categories.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                  <Sparkles className="w-4 h-4" />
                  Opportunità correlate trovate
                </div>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href="/dashboard/opportunities">
                    Vai alle opportunità
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
