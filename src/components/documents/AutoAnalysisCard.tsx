import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Euro, 
  Calendar, 
  AlertTriangle,
  Shield,
  FileWarning,
  Clock,
  CheckCircle,
  XCircle,
  Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoAnalysis {
  document_subtype: string;
  vehicle_info?: {
    plate: string;
    brand?: string;
    model?: string;
    year?: number;
  };
  insurance_info?: {
    company: string;
    policy_number: string;
    start_date: string;
    end_date: string;
    premium: number;
    coverage_type: string;
    franchise?: number;
  };
  fine_info?: {
    date: string;
    violation: string;
    amount: number;
    reduced_amount?: number;
    payment_deadline: string;
    points_deducted: number;
    contestable: boolean;
    contestation_deadline?: string;
  };
  irregularities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  actionable_advice: string[];
}

interface AutoAnalysisCardProps {
  analysis: AutoAnalysis;
}

const subtypeLabels: Record<string, string> = {
  bollo_auto: 'Bollo Auto',
  assicurazione_auto: 'Assicurazione Auto',
  multa: 'Multa / Verbale',
  revisione: 'Revisione',
  passaggio_proprieta: 'Passaggio Proprietà'
};

const severityConfig = {
  low: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
  medium: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' },
  high: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
  critical: { color: 'bg-red-500/10 text-red-700 border-red-500/30' }
};

export const AutoAnalysisCard: React.FC<AutoAnalysisCardProps> = ({ analysis }) => {
  // Calculate days until deadline for fine
  const daysUntilDeadline = analysis.fine_info?.payment_deadline 
    ? Math.ceil((new Date(analysis.fine_info.payment_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-orange-500" />
            Analisi Documento Auto
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {subtypeLabels[analysis.document_subtype] || analysis.document_subtype}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Vehicle Info */}
        {analysis.vehicle_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Car className="h-4 w-4" />
              Veicolo
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <span className="text-muted-foreground">Targa:</span>
                <span className="ml-2 font-bold text-lg">{analysis.vehicle_info.plate}</span>
              </div>
              {analysis.vehicle_info.brand && (
                <div>
                  <span className="text-muted-foreground">Marca:</span>
                  <span className="ml-2 font-medium">{analysis.vehicle_info.brand}</span>
                </div>
              )}
              {analysis.vehicle_info.model && (
                <div>
                  <span className="text-muted-foreground">Modello:</span>
                  <span className="ml-2 font-medium">{analysis.vehicle_info.model}</span>
                </div>
              )}
              {analysis.vehicle_info.year && (
                <div>
                  <span className="text-muted-foreground">Anno:</span>
                  <span className="ml-2 font-medium">{analysis.vehicle_info.year}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insurance Info */}
        {analysis.insurance_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4" />
              Polizza Assicurativa
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <span className="text-muted-foreground">Compagnia:</span>
                <span className="ml-2 font-medium">{analysis.insurance_info.company}</span>
              </div>
              <div>
                <span className="text-muted-foreground">N° Polizza:</span>
                <span className="ml-2 font-medium">{analysis.insurance_info.policy_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <span className="ml-2 font-medium">{analysis.insurance_info.coverage_type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Inizio:</span>
                <span className="ml-2 font-medium">{analysis.insurance_info.start_date}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Scadenza:</span>
                <span className="ml-2 font-medium">{analysis.insurance_info.end_date}</span>
              </div>
              <div className="col-span-2 p-2 rounded bg-primary/10 text-center">
                <p className="text-primary text-xs">Premio Annuo</p>
                <p className="font-bold text-primary text-lg">€{analysis.insurance_info.premium.toLocaleString()}</p>
              </div>
              {analysis.insurance_info.franchise && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Franchigia:</span>
                  <span className="ml-2 font-medium">€{analysis.insurance_info.franchise.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fine Info */}
        {analysis.fine_info && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
            <h4 className="font-medium flex items-center gap-2 mb-3 text-red-700">
              <FileWarning className="h-4 w-4" />
              Dettagli Multa
            </h4>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Data infrazione:</span>
                <span className="ml-2 font-medium">{analysis.fine_info.date}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Violazione:</span>
                <p className="font-medium mt-1">{analysis.fine_info.violation}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-red-500/10 text-center">
                  <p className="text-red-700 text-xs">Importo</p>
                  <p className="font-bold text-red-700 text-lg">€{analysis.fine_info.amount}</p>
                </div>
                {analysis.fine_info.reduced_amount && (
                  <div className="p-2 rounded bg-green-500/10 text-center">
                    <p className="text-green-700 text-xs">Ridotto (5gg)</p>
                    <p className="font-bold text-green-700 text-lg">€{analysis.fine_info.reduced_amount}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Scadenza pagamento:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analysis.fine_info.payment_deadline}</span>
                  {daysUntilDeadline !== null && (
                    <Badge variant={daysUntilDeadline <= 5 ? "destructive" : "secondary"}>
                      {daysUntilDeadline} giorni
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Punti decurtati:</span>
                <Badge variant="destructive">{analysis.fine_info.points_deducted} punti</Badge>
              </div>

              <div className="p-3 rounded-lg border mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Contestabile</span>
                  {analysis.fine_info.contestable ? (
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sì
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-700 border-red-500/30">
                      <XCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                {analysis.fine_info.contestable && analysis.fine_info.contestation_deadline && (
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Scadenza ricorso:</span>
                    <span className="font-medium">{analysis.fine_info.contestation_deadline}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Irregularities */}
        {analysis.irregularities && analysis.irregularities.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Problemi Rilevati
            </h4>
            {analysis.irregularities.map((irreg, idx) => (
              <div key={idx} className={cn("p-3 rounded-lg border", severityConfig[irreg.severity].color)}>
                <span className="font-medium text-sm capitalize">{irreg.type.replace(/_/g, ' ')}</span>
                <p className="text-sm mt-1">{irreg.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actionable Advice */}
        {analysis.actionable_advice && analysis.actionable_advice.length > 0 && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
            <h4 className="font-medium flex items-center gap-2 mb-2 text-primary">
              <CheckCircle className="h-4 w-4" />
              Cosa Fare
            </h4>
            <ul className="space-y-1">
              {analysis.actionable_advice.map((advice, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoAnalysisCard;
