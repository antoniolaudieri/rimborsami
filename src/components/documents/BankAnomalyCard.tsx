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
      </Card>
    </motion.div>
  );
}

export default BankAnomalyCard;