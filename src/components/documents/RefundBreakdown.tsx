import { motion } from 'framer-motion';
import { Calculator, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, TrendingUp, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { RefundEstimate, RefundBreakdownItem } from '@/lib/refundCalculator';

interface RefundBreakdownProps {
  estimate: RefundEstimate;
  showDetails?: boolean;
  className?: string;
}

const confidenceConfig = {
  high: {
    label: 'Alta',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  },
  medium: {
    label: 'Media',
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  low: {
    label: 'Bassa',
    icon: HelpCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
};

export function RefundBreakdown({ estimate, showDetails = true, className = '' }: RefundBreakdownProps) {
  const config = confidenceConfig[estimate.confidence];
  const ConfidenceIcon = config.icon;

  if (estimate.amount === 0 && !estimate.breakdown?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 ${config.border} ${config.bg} p-4 ${className}`}
    >
      {/* Header with amount */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Calculator className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stima Rimborso</p>
            <p className="text-2xl font-bold text-foreground">
              €{estimate.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={`${config.badge} gap-1 cursor-help`}>
                <ConfidenceIcon className="h-3 w-3" />
                Affidabilità {config.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                {estimate.confidence === 'high' && 'Calcolo basato su dati precisi e riferimenti normativi ufficiali.'}
                {estimate.confidence === 'medium' && 'Stima ragionevole, alcuni dati potrebbero richiedere verifica.'}
                {estimate.confidence === 'low' && 'Stima approssimativa, necessaria verifica documentale.'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Formula */}
      {estimate.formula && (
        <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Formula</span>
          </div>
          <code className="text-sm font-mono text-foreground break-all">{estimate.formula}</code>
        </div>
      )}

      {/* Breakdown details */}
      {showDetails && estimate.breakdown && estimate.breakdown.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dettaglio Calcolo</span>
          </div>
          <div className="grid gap-2">
            {estimate.breakdown.map((item: RefundBreakdownItem, index: number) => (
              <div 
                key={index}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">
                  {typeof item.value === 'number' 
                    ? `${item.value}${item.unit ? ` ${item.unit}` : ''}`
                    : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal reference */}
      {estimate.legalReference && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-start gap-2">
            <Scale className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Riferimento normativo:</span> {estimate.legalReference}
              </p>
              {estimate.source && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Fonte:</span> {estimate.source}
                </p>
              )}
              {estimate.validPeriod && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Periodo validità:</span> {estimate.validPeriod}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warning for low confidence */}
      {estimate.confidence === 'low' && (
        <div className="mt-3 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            Stima indicativa. Si consiglia di verificare con un professionista.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default RefundBreakdown;
