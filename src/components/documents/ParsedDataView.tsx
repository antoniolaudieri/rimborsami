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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CondominiumAnalysisCard } from './CondominiumAnalysisCard';
import { WorkAnalysisCard } from './WorkAnalysisCard';
import { HealthAnalysisCard } from './HealthAnalysisCard';
import { AutoAnalysisCard } from './AutoAnalysisCard';
import { BankAnomalyCard } from './BankAnomalyCard';
import type { ParsedDocumentData } from '@/hooks/useDocuments';

interface ParsedDataViewProps {
  data: ParsedDocumentData;
}

const typeIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-4 h-4" />,
  order: <ShoppingBag className="w-4 h-4" />,
  bill: <FileText className="w-4 h-4" />,
  receipt: <Receipt className="w-4 h-4" />,
  bank_statement: <Building2 className="w-4 h-4" />,
  warranty: <Shield className="w-4 h-4" />,
  condominium: <Home className="w-4 h-4" />,
  verbale_assemblea: <Home className="w-4 h-4" />,
  rendiconto: <Home className="w-4 h-4" />,
  busta_paga: <Briefcase className="w-4 h-4" />,
  contratto_lavoro: <Briefcase className="w-4 h-4" />,
  cud: <Briefcase className="w-4 h-4" />,
  fattura_medica: <HeartPulse className="w-4 h-4" />,
  referto: <HeartPulse className="w-4 h-4" />,
  bollo: <Car className="w-4 h-4" />,
  assicurazione_auto: <Car className="w-4 h-4" />,
  multa: <Car className="w-4 h-4" />,
  other: <HelpCircle className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  flight: 'Volo / Biglietto aereo',
  order: 'Ordine E-commerce',
  bill: 'Bolletta',
  receipt: 'Scontrino / Ricevuta',
  bank_statement: 'Estratto conto',
  warranty: 'Garanzia',
  condominium: 'Documento condominiale',
  verbale_assemblea: 'Verbale Assemblea',
  rendiconto: 'Rendiconto Condominiale',
  preventivo: 'Bilancio Preventivo',
  busta_paga: 'Busta Paga',
  contratto_lavoro: 'Contratto di Lavoro',
  cud: 'CUD / Certificazione Unica',
  fattura_medica: 'Fattura Medica',
  referto: 'Referto Medico',
  bollo: 'Bollo Auto',
  assicurazione_auto: 'Assicurazione Auto',
  multa: 'Multa',
  revisione: 'Revisione Auto',
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
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function ParsedDataView({ data }: ParsedDataViewProps) {
  const docType = data.document_type || 'other';
  const extracted = data.extracted_data || {};

  // Check for specialized analysis cards
  const hasCondominiumAnalysis = !!data.condominium_analysis;
  const hasWorkAnalysis = !!data.work_analysis;
  const hasHealthAnalysis = !!data.health_analysis;
  const hasAutoAnalysis = !!data.auto_analysis;
  const hasBankAnalysis = !!data.bank_analysis;

  return (
    <div className="pt-4 space-y-4">
      {/* Document type header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {typeIcons[docType] || typeIcons.other}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{typeLabels[docType] || 'Documento'}</p>
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
      {!hasCondominiumAnalysis && !hasWorkAnalysis && !hasHealthAnalysis && !hasAutoAnalysis && !hasBankAnalysis && 
       Object.keys(extracted).length > 0 && extracted.source !== 'fallback' && (
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

      {/* Potential issues */}
      {data.potential_issues && data.potential_issues.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Potenziali problemi rilevati</span>
          </div>
          <ul className="space-y-1">
            {data.potential_issues.map((issue, index) => (
              <li key={index} className="text-sm text-muted-foreground pl-6">
                • {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested categories */}
      {data.suggested_categories && data.suggested_categories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="w-4 h-4 text-primary" />
            <span>Categorie suggerite</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.suggested_categories.map((category) => (
              <Badge
                key={category}
                className={categoryColors[category] || categoryColors.other}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}