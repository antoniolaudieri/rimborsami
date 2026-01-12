import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HeartPulse, 
  Euro, 
  Calendar, 
  Building2,
  Receipt,
  Percent,
  PiggyBank,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HealthAnalysis } from '@/hooks/useDocuments';

interface HealthAnalysisCardProps {
  analysis: HealthAnalysis;
}

const subtypeLabels: Record<string, string> = {
  fattura_medica: 'Fattura Medica',
  referto: 'Referto Medico',
  prescrizione: 'Prescrizione',
  ticket: 'Ticket Sanitario'
};

export const HealthAnalysisCard: React.FC<HealthAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="border-l-4 border-l-rose-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartPulse className="h-5 w-5 text-rose-500" />
            Analisi Documento Sanitario
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {subtypeLabels[analysis.document_subtype || ''] || analysis.document_subtype || 'Documento'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Provider and Date */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {analysis.provider && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Struttura:</span>
              <span className="font-medium">{analysis.provider}</span>
            </div>
          )}
          {analysis.date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">{analysis.date}</span>
            </div>
          )}
        </div>

        {/* Amount Info */}
        {analysis.amount !== undefined && (
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Importo totale:</span>
              </div>
              <span className="font-bold text-lg">€{analysis.amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Deductible Info */}
        {analysis.deductible_amount !== undefined && (
          <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-green-700">
                <PiggyBank className="h-4 w-4" />
                <span className="font-medium">Importo Detraibile</span>
              </div>
              <span className="font-bold text-green-700">€{analysis.deductible_amount.toLocaleString()}</span>
            </div>
            {analysis.deduction_type && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Percent className="h-3 w-3" />
                <span>Detrazione {analysis.deduction_type}</span>
              </div>
            )}
          </div>
        )}

        {/* Services */}
        {analysis.services && analysis.services.length > 0 && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium mb-3">Prestazioni</h4>
            <div className="space-y-2">
              {analysis.services.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {service.deductible && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    <span>{service.description}</span>
                  </div>
                  <span className={cn(
                    "font-medium",
                    service.deductible && "text-green-600"
                  )}>
                    €{service.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tax Info Summary */}
        {analysis.tax_info && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
            <h4 className="font-medium flex items-center gap-2 mb-2 text-primary">
              <Euro className="h-4 w-4" />
              Riepilogo Fiscale
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {analysis.tax_info.total_deductible !== undefined && (
                <div>
                  <span className="text-muted-foreground">Totale detraibile:</span>
                  <span className="ml-2 font-medium">€{analysis.tax_info.total_deductible.toLocaleString()}</span>
                </div>
              )}
              {analysis.tax_info.estimated_refund !== undefined && (
                <div>
                  <span className="text-muted-foreground">Risparmio stimato:</span>
                  <span className="ml-2 font-medium text-green-600">€{analysis.tax_info.estimated_refund.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthAnalysisCard;