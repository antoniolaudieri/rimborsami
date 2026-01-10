import { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Document, ParsedDocumentData } from '@/hooks/useDocuments';
import { ParsedDataView } from './ParsedDataView';

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

export function DocumentCard({
  document,
  onDelete,
  onReprocess,
  onPreview,
}: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  const status = document.processing_status || 'pending';
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const parsedData = document.parsed_data as ParsedDocumentData | null;

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(document.id, document.file_url);
    setDeleting(false);
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    await onReprocess(document.id);
    setReprocessing(false);
  };

  const handlePreview = () => {
    if (document.file_url) {
      onPreview(document.file_url);
    }
  };

  const hasResults = status === 'completed' && parsedData;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'rounded-xl border bg-card transition-all',
        expanded && 'shadow-lg'
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          {typeIcons[document.type] || <FileText className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{document.file_name || 'Documento'}</p>
          <div className="flex items-center gap-2 mt-1">
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

      {/* Expanded content */}
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
    </motion.div>
  );
}
