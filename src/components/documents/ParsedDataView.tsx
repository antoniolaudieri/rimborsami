import { 
  Plane, 
  ShoppingBag, 
  FileText, 
  Receipt, 
  Building2, 
  Shield, 
  HelpCircle,
  AlertTriangle,
  Tag,
  Calendar,
  DollarSign,
  Hash,
  Building,
  Home,
  Briefcase,
  HeartPulse,
  Car,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CondominiumAnalysisCard } from './CondominiumAnalysisCard';
import { WorkAnalysisCard } from './WorkAnalysisCard';
import { HealthAnalysisCard } from './HealthAnalysisCard';
import { AutoAnalysisCard } from './AutoAnalysisCard';
import { BankAnomalyCard } from './BankAnomalyCard';
import { RiskScoreGauge } from './RiskScoreGauge';
import type { ParsedDocumentData } from '@/hooks/useDocuments';
import { getRiskScore, getRiskLevel, getDocumentAnomalies } from '@/hooks/useDocuments';
import { cn } from '@/lib/utils';

interface ParsedDataViewProps {
  data: ParsedDocumentData;
}

const typeIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-4 h-4" />,
  biglietto_aereo: <Plane className="w-4 h-4" />,
  carta_imbarco: <Plane className="w-4 h-4" />,
  order: <ShoppingBag className="w-4 h-4" />,
  conferma_ordine: <ShoppingBag className="w-4 h-4" />,
  ricevuta_ecommerce: <ShoppingBag className="w-4 h-4" />,
  bill: <FileText className="w-4 h-4" />,
  bolletta_telefono: <FileText className="w-4 h-4" />,
  bolletta_luce: <FileText className="w-4 h-4" />,
  bolletta_gas: <FileText className="w-4 h-4" />,
  receipt: <Receipt className="w-4 h-4" />,
  scontrino: <Receipt className="w-4 h-4" />,
  fattura: <Receipt className="w-4 h-4" />,
  bank_statement: <Building2 className="w-4 h-4" />,
  estratto_conto: <Building2 className="w-4 h-4" />,
  mutuo: <Building2 className="w-4 h-4" />,
  prestito: <Building2 className="w-4 h-4" />,
  fido: <Building2 className="w-4 h-4" />,
  carta_credito: <Building2 className="w-4 h-4" />,
  warranty: <Shield className="w-4 h-4" />,
  garanzia: <Shield className="w-4 h-4" />,
  condominium: <Home className="w-4 h-4" />,
  verbale_assemblea: <Home className="w-4 h-4" />,
  rendiconto_condominiale: <Home className="w-4 h-4" />,
  convocazione_assemblea: <Home className="w-4 h-4" />,
  busta_paga: <Briefcase className="w-4 h-4" />,
  contratto_lavoro: <Briefcase className="w-4 h-4" />,
  cud: <Briefcase className="w-4 h-4" />,
  fattura_medica: <HeartPulse className="w-4 h-4" />,
  referto_medico: <HeartPulse className="w-4 h-4" />,
  bollo: <Car className="w-4 h-4" />,
  bollo_auto: <Car className="w-4 h-4" />,
  assicurazione: <Car className="w-4 h-4" />,
  revisione: <Car className="w-4 h-4" />,
  multa: <Car className="w-4 h-4" />,
  altro: <HelpCircle className="w-4 h-4" />,
  other: <HelpCircle className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  flight: 'Volo / Biglietto aereo',
  biglietto_aereo: 'Biglietto Aereo',
  carta_imbarco: 'Carta d\'Imbarco',
  order: 'Ordine E-commerce',
  conferma_ordine: 'Conferma Ordine',
  ricevuta_ecommerce: 'Ricevuta E-commerce',
  bill: 'Bolletta',
  bolletta_telefono: 'Bolletta Telefono',
  bolletta_luce: 'Bolletta Luce',
  bolletta_gas: 'Bolletta Gas',
  receipt: 'Scontrino / Ricevuta',
  scontrino: 'Scontrino',
  fattura: 'Fattura',
  bank_statement: 'Estratto conto',
  estratto_conto: 'Estratto Conto',
  mutuo: 'Mutuo',
  prestito: 'Prestito',
  fido: 'Fido',
  carta_credito: 'Carta di Credito',
  warranty: 'Garanzia',
  garanzia: 'Garanzia',
  condominium: 'Documento condominiale',
  verbale_assemblea: 'Verbale Assemblea',
  rendiconto_condominiale: 'Rendiconto Condominiale',
  convocazione_assemblea: 'Convocazione Assemblea',
  busta_paga: 'Busta Paga',
  contratto_lavoro: 'Contratto di Lavoro',
  cud: 'CUD / Certificazione Unica',
  fattura_medica: 'Fattura Medica',
  referto_medico: 'Referto Medico',
  bollo: 'Bollo Auto',
  bollo_auto: 'Bollo Auto',
  assicurazione: 'Assicurazione',
  revisione: 'Revisione Auto',
  multa: 'Multa',
  altro: 'Altro documento',
  other: 'Altro documento',
};

const categoryColors: Record<string, string> = {
  flight: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  ecommerce: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  telecom: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  energy: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  bank: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  insurance: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warranty: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  condominium: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  work: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  health: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  auto: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  automotive: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  transport: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  ecommerce: 'E-commerce',
  telecom: 'Telefonia',
  energy: 'Energia',
  bank: 'Banche',
  insurance: 'Assicurazioni',
  warranty: 'Garanzie',
  condominium: 'Condominio',
  work: 'Lavoro',
  health: 'Sanità',
  auto: 'Auto',
  automotive: 'Auto',
  transport: 'Trasporti',
  class_action: 'Class Action',
  tech: 'Tecnologia',
  other: 'Altro',
};

const riskLevelConfig = {
  low: { 
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    icon: CheckCircle2,
    label: 'Nessuna anomalia'
  },
  medium: { 
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    icon: AlertCircle,
    label: 'Anomalie minori'
  },
  high: { 
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-400',
    icon: AlertTriangle,
    label: 'Anomalie significative'
  },
  critical: { 
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    icon: ShieldAlert,
    label: 'Anomalie critiche'
  },
};

export function ParsedDataView({ data }: ParsedDataViewProps) {
  const docType = data.document_type || 'other';
  const extracted = data.extracted_data || {};
  
  const riskScore = getRiskScore(data);
  const riskLevel = getRiskLevel(data);
  const anomalies = getDocumentAnomalies(data);
  const riskConfig = riskLevel ? riskLevelConfig[riskLevel] : null;

  // Check for specialized analysis cards
  const hasCondominiumAnalysis = !!data.condominium_analysis;
  const hasWorkAnalysis = !!data.work_analysis;
  const hasHealthAnalysis = !!data.health_analysis;
  const hasAutoAnalysis = !!data.auto_analysis;
  const hasBankAnalysis = !!data.bank_analysis;
  const hasSpecializedAnalysis = hasCondominiumAnalysis || hasWorkAnalysis || hasHealthAnalysis || hasAutoAnalysis || hasBankAnalysis;

  // Estimated refund from any source
  const estimatedRefund = data.bank_analysis?.estimated_refund || 
                          (data as Record<string, unknown>).estimated_refund as number | undefined;

  return (
    <div className="pt-4 space-y-4">
      {/* Document type header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {typeIcons[docType] || typeIcons.other}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{typeLabels[docType] || docType}</p>
          {data.confidence !== undefined && (
            <p className="text-xs text-muted-foreground">
              Affidabilità: {Math.round(data.confidence * 100)}%
            </p>
          )}
        </div>
        {data.summary && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI
          </Badge>
        )}
      </div>

      {/* Valutazione Anomalie Card - ALWAYS SHOW */}
      {riskConfig && (
        <div className={cn(
          'rounded-lg border p-4',
          riskConfig.bg,
          riskConfig.border
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-full', riskConfig.bg)}>
                <riskConfig.icon className={cn('w-5 h-5', riskConfig.text)} />
              </div>
              <div>
                <p className={cn('font-semibold', riskConfig.text)}>
                  {riskConfig.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {riskLevel === 'low' && 'Il documento non presenta problemi rilevanti.'}
                  {riskLevel === 'medium' && 'Rilevati alcuni aspetti da verificare.'}
                  {riskLevel === 'high' && 'Identificate anomalie che richiedono attenzione.'}
                  {riskLevel === 'critical' && 'Rilevate gravi irregolarità. Azione consigliata.'}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <RiskScoreGauge score={riskScore} size="sm" showLabel />
            </div>
          </div>
          
          {/* Estimated refund highlight */}
          {estimatedRefund && estimatedRefund > 0 && (
            <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Rimborso stimato:</span>
              <span className="text-lg font-bold text-green-600">€{estimatedRefund.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* AI Summary */}
      {data.summary && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Sintesi AI
          </p>
          <p className="text-sm text-muted-foreground">{data.summary}</p>
        </div>
      )}

      {/* Anomalies List (when no specialized card but anomalies present) */}
      {!hasSpecializedAnalysis && anomalies.length > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-amber-700 dark:text-amber-400">
              Anomalie rilevate ({anomalies.length})
            </span>
          </div>
          <ul className="space-y-2">
            {anomalies.map((issue, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-amber-600 mt-0.5">•</span>
                <span className="text-amber-800 dark:text-amber-300">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Specialized Analysis Cards */}
      {hasCondominiumAnalysis && data.condominium_analysis && (
        <CondominiumAnalysisCard analysis={data.condominium_analysis} />
      )}

      {hasWorkAnalysis && data.work_analysis && (
        <WorkAnalysisCard analysis={data.work_analysis} />
      )}

      {hasHealthAnalysis && data.health_analysis && (
        <HealthAnalysisCard analysis={data.health_analysis} />
      )}

      {hasAutoAnalysis && data.auto_analysis && (
        <AutoAnalysisCard analysis={data.auto_analysis} />
      )}

      {hasBankAnalysis && data.bank_analysis && (
        <BankAnomalyCard analysis={data.bank_analysis} />
      )}

      {/* Extracted data (for documents without specialized analysis) */}
      {!hasSpecializedAnalysis && Object.keys(extracted).length > 0 && extracted.source !== 'fallback' && (
        <div className="grid grid-cols-2 gap-3">
          {extracted.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Azienda:</span>
              <span className="font-medium">{String(extracted.company)}</span>
            </div>
          )}
          
          {extracted.date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {new Date(String(extracted.date)).toLocaleDateString('it-IT')}
              </span>
            </div>
          )}
          
          {extracted.amount !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Importo:</span>
              <span className="font-medium">€{Number(extracted.amount).toFixed(2)}</span>
            </div>
          )}
          
          {extracted.reference_number && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Riferimento:</span>
              <span className="font-medium font-mono">{String(extracted.reference_number)}</span>
            </div>
          )}
        </div>
      )}

      {/* Suggested categories */}
      {data.suggested_categories && data.suggested_categories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="w-4 h-4 text-primary" />
            <span>Categorie</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.suggested_categories.map((category) => (
              <Badge
                key={category}
                className={categoryColors[category] || categoryColors.other}
              >
                {categoryLabels[category] || category}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}