import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  ShoppingCart, 
  Phone, 
  Zap, 
  Building, 
  Shield, 
  Car, 
  Building2, 
  Briefcase, 
  Receipt, 
  Heart,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Euro,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDocumentCategory } from '@/hooks/useDocuments';

interface DocumentSummaryCardProps {
  document: {
    id: string;
    file_name: string;
    parsed_data: any;
    created_at: string;
    processing_status: string;
  };
  onClick?: () => void;
  compact?: boolean;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  flight: { icon: Plane, color: 'bg-sky-500/10 text-sky-700 border-sky-500/30', label: 'Voli' },
  ecommerce: { icon: ShoppingCart, color: 'bg-purple-500/10 text-purple-700 border-purple-500/30', label: 'E-commerce' },
  telecom: { icon: Phone, color: 'bg-blue-500/10 text-blue-700 border-blue-500/30', label: 'Telecom' },
  energy: { icon: Zap, color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30', label: 'Energia' },
  bank: { icon: Building, color: 'bg-green-500/10 text-green-700 border-green-500/30', label: 'Banche' },
  insurance: { icon: Shield, color: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30', label: 'Assicurazioni' },
  auto: { icon: Car, color: 'bg-orange-500/10 text-orange-700 border-orange-500/30', label: 'Auto' },
  condominium: { icon: Building2, color: 'bg-teal-500/10 text-teal-700 border-teal-500/30', label: 'Condominio' },
  work: { icon: Briefcase, color: 'bg-pink-500/10 text-pink-700 border-pink-500/30', label: 'Lavoro' },
  fiscal: { icon: Receipt, color: 'bg-red-500/10 text-red-700 border-red-500/30', label: 'Fisco' },
  health: { icon: Heart, color: 'bg-rose-500/10 text-rose-700 border-rose-500/30', label: 'Sanità' },
  other: { icon: FileText, color: 'bg-gray-500/10 text-gray-700 border-gray-500/30', label: 'Altro' }
};

export const DocumentSummaryCard: React.FC<DocumentSummaryCardProps> = ({ 
  document, 
  onClick,
  compact = false 
}) => {
  const parsedData = document.parsed_data || {};
  const category = getDocumentCategory(parsedData);
  const config = categoryConfig[category] || categoryConfig.other;
  const IconComponent = config.icon;
  
  // Count issues/anomalies
  const hasIssues = (parsedData.potential_issues?.length > 0) ||
    (parsedData.bank_analysis?.anomalies?.length > 0) ||
    (parsedData.condominium_analysis?.irregularities?.length > 0) ||
    (parsedData.work_analysis?.irregularities?.length > 0) ||
    (parsedData.auto_analysis?.irregularities?.length > 0);
  
  const issueCount = 
    (parsedData.potential_issues?.length || 0) +
    (parsedData.bank_analysis?.anomalies?.length || 0) +
    (parsedData.condominium_analysis?.irregularities?.length || 0) +
    (parsedData.work_analysis?.irregularities?.length || 0) +
    (parsedData.auto_analysis?.irregularities?.length || 0);
  
  // Get key extracted data
  const extractedData = parsedData.extracted_data || {};
  const amount = extractedData.amount || 
    parsedData.bank_analysis?.closing_balance ||
    parsedData.condominium_analysis?.financial_info?.total_expenses ||
    parsedData.work_analysis?.salary_info?.net_salary;
  
  const date = extractedData.date || 
    parsedData.condominium_analysis?.assembly_info?.date ||
    parsedData.work_analysis?.salary_info?.month;
  
  const company = extractedData.company ||
    parsedData.condominium_analysis?.contract_info?.supplier;

  // Get risk level
  const riskLevel = parsedData.bank_analysis?.risk_level ||
    parsedData.condominium_analysis?.risk_level ||
    null;

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer",
          hasIssues && "border-l-4 border-l-yellow-500"
        )}
        onClick={onClick}
      >
        <div className={cn("p-2 rounded-lg", config.color)}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{document.file_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {parsedData.document_type?.replace(/_/g, ' ') || 'Documento'}
          </p>
        </div>
        {hasIssues && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30 shrink-0">
            {issueCount}
          </Badge>
        )}
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer",
        hasIssues && "border-l-4 border-l-yellow-500"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2.5 rounded-lg shrink-0", config.color)}>
            <IconComponent className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
              {document.processing_status === 'completed' && parsedData.summary && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI
                </Badge>
              )}
              {riskLevel && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs capitalize", riskColors[riskLevel])}
                >
                  Rischio {riskLevel}
                </Badge>
              )}
            </div>
            
            <p className="font-medium text-sm truncate mb-1">
              {parsedData.document_type?.replace(/_/g, ' ') || document.file_name}
            </p>
            
            {parsedData.summary && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {parsedData.summary}
              </p>
            )}
            
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {company && (
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {company}
                </span>
              )}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {date}
                </span>
              )}
              {amount && (
                <span className="flex items-center gap-1">
                  <Euro className="h-3 w-3" />
                  {typeof amount === 'number' ? amount.toLocaleString() : amount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            {hasIssues ? (
              <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {issueCount} {issueCount === 1 ? 'problema' : 'problemi'}
              </Badge>
            ) : (
              <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                OK
              </Badge>
            )}
            
            <span className="text-xs text-muted-foreground">
              {new Date(document.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSummaryCard;
