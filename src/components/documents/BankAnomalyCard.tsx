import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Receipt, Clock, Euro, BadgeAlert, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RiskScoreGauge } from './RiskScoreGauge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BankAnalysis {
  account_type: string;
  bank_name: string | null;
  period: { from: string | null; to: string | null };
  interest_analysis: {
    nominal_rate: number | null;
    effective_rate: number | null;
    usury_threshold: number;
    is_usurious: boolean;
    excess_amount: number | null;
  };
  fees_analysis: {
    total_fees: number | null;
    suspicious_fees: Array<{
      name: string;
      amount: number;
      issue: string;
    }>;
  };
  late_fees_analysis: {
    total_late_fees: number | null;
    legal_limit: number;
    excess_amount: number | null;
    is_excessive: boolean;
  };
  risk_score: number;
  risk_level: string;
  estimated_refund: number;
  anomalies_found: string[];
}

interface BankAnomalyCardProps {
  analysis: BankAnalysis;
}

const accountTypeLabels: Record<string, string> = {
  conto_corrente: 'Conto Corrente',
  mutuo: 'Mutuo',
  prestito: 'Prestito Personale',
  fido: 'Fido Bancario',
  carta_credito: 'Carta di Credito',
  unknown: 'Documento Bancario',
};

export function BankAnomalyCard({ analysis }: BankAnomalyCardProps) {
  const hasAnomalies = analysis.risk_score > 25;
  const hasSuspiciousFees = analysis.fees_analysis.suspicious_fees.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`overflow-hidden ${hasAnomalies ? 'border-destructive/50' : 'border-green-500/30'}`}>
        {/* Header with risk score */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                {hasAnomalies ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <BadgeAlert className="h-5 w-5 text-green-500" />
                )}
                Analisi {accountTypeLabels[analysis.account_type] || 'Documento Bancario'}
              </CardTitle>
              {analysis.bank_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.bank_name}
                </p>
              )}
              {analysis.period.from && (
                <p className="text-xs text-muted-foreground">
                  Periodo: {analysis.period.from} - {analysis.period.to || 'presente'}
                </p>
              )}
            </div>
            <RiskScoreGauge score={analysis.risk_score} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Anomalies summary */}
          {analysis.anomalies_found.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {analysis.anomalies_found.map((anomaly, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Badge variant="destructive" className="text-xs">
                    {anomaly}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Interest analysis */}
          {(analysis.interest_analysis.effective_rate !== null || analysis.interest_analysis.is_usurious) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Analisi Tassi
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Confronto con soglie usura Banca d'Italia</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                {analysis.interest_analysis.nominal_rate !== null && (
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">TAN Nominale</p>
                    <p className="font-medium">{analysis.interest_analysis.nominal_rate}%</p>
                  </div>
                )}
                {analysis.interest_analysis.effective_rate !== null && (
                  <div className={`p-2 rounded-lg ${analysis.interest_analysis.is_usurious ? 'bg-destructive/10' : 'bg-muted/50'}`}>
                    <p className="text-xs text-muted-foreground">TAEG Effettivo</p>
                    <p className={`font-medium ${analysis.interest_analysis.is_usurious ? 'text-destructive' : ''}`}>
                      {analysis.interest_analysis.effective_rate}%
                    </p>
                  </div>
                )}
              </div>

              {analysis.interest_analysis.is_usurious && (
                <motion.div
                  className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded-lg text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Tasso supera soglia usura ({analysis.interest_analysis.usury_threshold}%)
                    {analysis.interest_analysis.excess_amount && (
                      <> - Eccedenza: €{analysis.interest_analysis.excess_amount}</>
                    )}
                  </span>
                </motion.div>
              )}
            </div>
          )}

          <Separator />

          {/* Suspicious fees */}
          {hasSuspiciousFees && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Receipt className="h-4 w-4" />
                Commissioni Sospette
              </div>
              
              <div className="space-y-2">
                {analysis.fees_analysis.suspicious_fees.map((fee, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div>
                      <p className="font-medium">{fee.name}</p>
                      <p className="text-xs text-muted-foreground">{fee.issue}</p>
                    </div>
                    <span className="font-medium text-orange-600">€{fee.amount}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Late fees analysis */}
          {analysis.late_fees_analysis.is_excessive && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Interessi di Mora
              </div>
              
              <motion.div
                className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between items-center">
                  <span>Totale more addebitate</span>
                  <span className="font-medium">€{analysis.late_fees_analysis.total_late_fees}</span>
                </div>
                {analysis.late_fees_analysis.excess_amount && (
                  <div className="flex justify-between items-center text-destructive mt-1">
                    <span>Importo eccedente limite legale ({analysis.late_fees_analysis.legal_limit}%)</span>
                    <span className="font-medium">€{analysis.late_fees_analysis.excess_amount}</span>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          <Separator />

          {/* Estimated refund */}
          {analysis.estimated_refund > 0 && (
            <motion.div
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Stima Rimborso Potenziale</p>
                  <p className="text-xs text-muted-foreground">Basato sulle anomalie rilevate</p>
                </div>
              </div>
              <motion.span
                className="text-2xl font-bold text-green-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
              >
                €{analysis.estimated_refund}
              </motion.span>
            </motion.div>
          )}

          {/* No anomalies */}
          {!hasAnomalies && (
            <motion.div
              className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <BadgeAlert className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-600">Nessuna anomalia rilevata</p>
                <p className="text-sm text-muted-foreground">
                  Il documento non presenta irregolarità evidenti
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
