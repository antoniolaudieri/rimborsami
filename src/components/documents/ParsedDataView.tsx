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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  other: <HelpCircle className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  flight: 'Volo / Biglietto aereo',
  order: 'Ordine E-commerce',
  bill: 'Bolletta',
  receipt: 'Scontrino / Ricevuta',
  bank_statement: 'Estratto conto',
  warranty: 'Garanzia',
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
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function ParsedDataView({ data }: ParsedDataViewProps) {
  const docType = data.document_type || 'other';
  const extracted = data.extracted_data || {};

  return (
    <div className="pt-4 space-y-4">
      {/* Document type header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {typeIcons[docType] || typeIcons.other}
        </div>
        <div>
          <p className="font-medium text-sm">{typeLabels[docType] || 'Documento'}</p>
          {data.confidence !== undefined && (
            <p className="text-xs text-muted-foreground">
              Affidabilità: {Math.round(data.confidence * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* Extracted data */}
      {Object.keys(extracted).length > 0 && extracted.source !== 'fallback' && (
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
