import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Receipt, Clock, Euro, BadgeAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RiskScoreGauge } from './RiskScoreGauge';
import { RefundBreakdown } from './RefundBreakdown';
import { calculateRefundFromBankAnalysis } from '@/lib/refundCalculator';
import type { BankAnalysis } from '@/hooks/useDocuments';

interface BankAnomalyCardProps {
  analysis: BankAnalysis;
}

const accountTypeLabels: Record<string, string> = {
  conto_corrente: 'Conto Corrente',
  mutuo: 'Mutuo',
  prestito: 'Prestito Personale',
  fido: 'Fido Bancario',
  carta_credito: 'Carta di Credito',
  cessione_quinto: 'Cessione del Quinto',
  leasing: 'Leasing',
};

export function BankAnomalyCard({ analysis }: BankAnomalyCardProps) {
  const riskScore = analysis.risk_score ?? 0;
  const riskLevel = analysis.risk_level ?? 'low';

  // Calculate realistic refund using official formulas
  const refundEstimate = calculateRefundFromBankAnalysis({
    taeg: analysis.interest_analysis?.effective_rate,
    tan: analysis.interest_analysis?.nominal_rate,
    accountType: analysis.account_type,
    totalInterest: analysis.interest_analysis?.excess_amount ? 
      (analysis.interest_analysis.excess_amount / ((analysis.interest_analysis.effective_rate! - analysis.interest_analysis.usury_threshold!) / analysis.interest_analysis.effective_rate!)) : 
      undefined,
    usuriousRates: analysis.interest_analysis?.is_usurious ? [{
      description: 'Tasso usurario',
      value: analysis.interest_analysis.effective_rate!,
      threshold: analysis.interest_analysis.usury_threshold!
    }] : undefined,
    estimatedRefund: analysis.estimated_refund,
  });

  const riskColors = {
    low: 'text-green-600 bg-green-500/10',
    medium: 'text-yellow-600 bg-yellow-500/10',
    high: 'text-orange-600 bg-orange-500/10',
    critical: 'text-red-600 bg-red-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-emerald-500 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="h-5 w-5 text-emerald-600" />
              Analisi Documento Bancario
            </CardTitle>
            <Badge variant="outline">
              {accountTypeLabels[analysis.account_type ?? ''] || analysis.account_type || 'Documento'}
            </Badge>
          </div>
          {analysis.bank_name && (
            <p className="text-sm text-muted-foreground">{analysis.bank_name}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Period */}
          {analysis.period && (analysis.period.from || analysis.period.to) && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Periodo:</span>
              <span className="font-medium">
                {analysis.period.from || '?'} - {analysis.period.to || '?'}
              </span>
            </div>
          )}

          {/* Risk Score */}
          {riskScore > 0 && (
            <div className="flex items-center gap-4">
              <RiskScoreGauge score={riskScore} size="sm" />
              <div>
                <p className="text-sm font-medium">Punteggio Rischio</p>
                <Badge className={riskColors[riskLevel]}>
                  {riskLevel === 'low' && 'Basso'}
                  {riskLevel === 'medium' && 'Medio'}
                  {riskLevel === 'high' && 'Alto'}
                  {riskLevel === 'critical' && 'Critico'}
                </Badge>
              </div>
            </div>
          )}

          {/* Realistic Refund Breakdown */}
          {refundEstimate.amount > 0 && (
            <RefundBreakdown estimate={refundEstimate} showDetails={true} />
          )}

          <Separator />

          {/* Interest Analysis */}
          {analysis.interest_analysis && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analisi Interessi
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {analysis.interest_analysis.nominal_rate !== undefined && analysis.interest_analysis.nominal_rate !== null && (
                  <div>
                    <span className="text-muted-foreground">Tasso nominale:</span>
                    <span className="ml-2 font-medium">{analysis.interest_analysis.nominal_rate.toFixed(2)}%</span>
                  </div>
                )}
                {analysis.interest_analysis.effective_rate !== undefined && analysis.interest_analysis.effective_rate !== null && (
                  <div>
                    <span className="text-muted-foreground">Tasso effettivo:</span>
                    <span className="ml-2 font-medium">{analysis.interest_analysis.effective_rate.toFixed(2)}%</span>
                  </div>
                )}
                {analysis.interest_analysis.usury_threshold !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Soglia usura:</span>
                    <span className="ml-2 font-medium">{analysis.interest_analysis.usury_threshold.toFixed(2)}%</span>
                  </div>
                )}
                {analysis.interest_analysis.is_usurious && (
                  <div className="col-span-2 p-2 rounded bg-red-500/10 border border-red-500/30 text-red-700">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">TASSO USURARIO RILEVATO</span>
                    </div>
                    {analysis.interest_analysis.excess_amount !== undefined && analysis.interest_analysis.excess_amount !== null && (
                      <p className="text-sm mt-1">
                        Eccesso: €{analysis.interest_analysis.excess_amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fees Analysis */}
          {analysis.fees_analysis && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Analisi Commissioni
              </h4>
              {analysis.fees_analysis.total_fees !== undefined && analysis.fees_analysis.total_fees !== null && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Totale commissioni:</span>
                  <span className="ml-2 font-medium">€{analysis.fees_analysis.total_fees.toLocaleString()}</span>
                </p>
              )}
              {analysis.fees_analysis.suspicious_fees && analysis.fees_analysis.suspicious_fees.length > 0 && (
                <div className="space-y-1 mt-2">
                  <p className="text-sm font-medium text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Commissioni sospette:
                  </p>
                  {analysis.fees_analysis.suspicious_fees.map((fee, idx) => (
                    <div key={idx} className="text-sm p-2 rounded bg-orange-500/10 border border-orange-500/30">
                      <div className="flex justify-between">
                        <span>{fee.name}</span>
                        <span className="font-medium">€{fee.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-0.5">{fee.issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Late Fees Analysis */}
          {analysis.late_fees_analysis && analysis.late_fees_analysis.is_excessive && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
              <h4 className="font-medium flex items-center gap-2 text-red-700 mb-2">
                <BadgeAlert className="h-4 w-4" />
                Interessi di Mora Eccessivi
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {analysis.late_fees_analysis.total_late_fees !== undefined && analysis.late_fees_analysis.total_late_fees !== null && (
                  <div>
                    <span className="text-muted-foreground">Totale mora:</span>
                    <span className="ml-2 font-medium">€{analysis.late_fees_analysis.total_late_fees.toLocaleString()}</span>
                  </div>
                )}
                {analysis.late_fees_analysis.legal_limit !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Limite legale:</span>
                    <span className="ml-2 font-medium">€{analysis.late_fees_analysis.legal_limit.toLocaleString()}</span>
                  </div>
                )}
                {analysis.late_fees_analysis.excess_amount !== undefined && analysis.late_fees_analysis.excess_amount !== null && (
                  <div className="col-span-2">
                    <span className="text-red-600 font-medium">
                      Eccesso recuperabile: €{analysis.late_fees_analysis.excess_amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Anomalies Found */}
          {analysis.anomalies_found && analysis.anomalies_found.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Anomalie Rilevate
              </h4>
              <ul className="space-y-1">
                {analysis.anomalies_found.map((anomaly, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{anomaly}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BankAnomalyCard;