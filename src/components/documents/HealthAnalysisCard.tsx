import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Euro, 
  Calendar, 
  Building2,
  Receipt,
  Percent,
  PiggyBank,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthAnalysis {
  document_subtype: string;
  provider?: string;
  date?: string;
  total_cost?: number;
  deductible_amount?: number;
  services: Array<{
    description: string;
    cost: number;
    deductible: boolean;
  }>;
  deduction_info: {
    total_deductible: number;
    deduction_percentage: number;
    estimated_savings: number;
  };
}

interface HealthAnalysisCardProps {
  analysis: HealthAnalysis;
}

const subtypeLabels: Record<string, string> = {
  fattura_medica: 'Fattura Medica',
  referto: 'Referto',
  ricetta: 'Ricetta',
  ticket_sanitario: 'Ticket Sanitario'
};

export const HealthAnalysisCard: React.FC<HealthAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="border-l-4 border-l-rose-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-rose-500" />
            Analisi Documento Sanitario
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {subtypeLabels[analysis.document_subtype] || analysis.document_subtype}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Info */}
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

        {/* Cost Summary */}
        {analysis.total_cost !== undefined && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border text-center">
              <p className="text-muted-foreground text-xs">Totale Pagato</p>
              <p className="font-bold text-lg">€{analysis.total_cost.toLocaleString()}</p>
            </div>
            {analysis.deductible_amount !== undefined && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <p className="text-green-700 text-xs">Detraibile</p>
                <p className="font-bold text-lg text-green-700">€{analysis.deductible_amount.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Services List */}
        {analysis.services && analysis.services.length > 0 && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Receipt className="h-4 w-4" />
              Prestazioni
            </h4>
            <div className="space-y-2">
              {analysis.services.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {service.deductible ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className={cn(service.deductible && "text-green-700")}>
                      {service.description}
                    </span>
                  </div>
                  <span className={cn("font-medium", service.deductible && "text-green-700")}>
                    €{service.cost.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deduction Info */}
        {analysis.deduction_info && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/30">
            <h4 className="font-medium flex items-center gap-2 mb-3 text-primary">
              <PiggyBank className="h-4 w-4" />
              Beneficio Fiscale
            </h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Totale Detraibile</p>
                <p className="font-bold">€{analysis.deduction_info.total_deductible.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Aliquota</p>
                <p className="font-bold">{analysis.deduction_info.deduction_percentage}%</p>
              </div>
              <div className="text-center bg-green-500/10 rounded p-2">
                <p className="text-green-700 text-xs">Risparmio Stimato</p>
                <p className="font-bold text-green-700">€{analysis.deduction_info.estimated_savings.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Ricorda di conservare questo documento per la dichiarazione dei redditi
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthAnalysisCard;
