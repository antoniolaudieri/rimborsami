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
  Gavel,
  AlertOctagon,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AutoAnalysis } from '@/hooks/useDocuments';

interface AutoAnalysisCardProps {
  analysis: AutoAnalysis;
}

const subtypeLabels: Record<string, string> = {
  bollo: 'Bollo Auto',
  assicurazione: 'Assicurazione Auto',
  revisione: 'Revisione',
  multa: 'Multa / Verbale',
  finanziamento: 'Finanziamento Auto'
};

const severityConfig = {
  low: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/30', icon: Info, label: 'Basso' },
  medium: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30', icon: AlertTriangle, label: 'Medio' },
  high: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/30', icon: AlertOctagon, label: 'Alto' },
  critical: { color: 'bg-red-500/10 text-red-700 border-red-500/30', icon: XCircle, label: 'Critico' }
};

export const AutoAnalysisCard: React.FC<AutoAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="border-l-4 border-l-slate-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-slate-600" />
            Analisi Documento Auto
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {subtypeLabels[analysis.document_subtype || ''] || analysis.document_subtype || 'Documento'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Vehicle Info */}
        {analysis.vehicle_info && (
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              {analysis.vehicle_info.plate && (
                <div className="px-3 py-1.5 bg-background rounded border font-mono font-bold text-lg">
                  {analysis.vehicle_info.plate}
                </div>
              )}
              <div className="text-sm">
                {analysis.vehicle_info.brand && analysis.vehicle_info.model && (
                  <p className="font-medium">{analysis.vehicle_info.brand} {analysis.vehicle_info.model}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deadline */}
        {analysis.deadline && (
          <div className="flex items-center gap-2 text-sm p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <Calendar className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-700 font-medium">Scadenza: {analysis.deadline}</span>
          </div>
        )}

        {/* Amount */}
        {analysis.amount !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Importo:</span>
            <span className="font-bold">€{analysis.amount.toLocaleString()}</span>
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
              {analysis.insurance_info.company && (
                <div>
                  <span className="text-muted-foreground">Compagnia:</span>
                  <span className="ml-2 font-medium">{analysis.insurance_info.company}</span>
                </div>
              )}
              {analysis.insurance_info.policy_number && (
                <div>
                  <span className="text-muted-foreground">N. Polizza:</span>
                  <span className="ml-2 font-medium font-mono">{analysis.insurance_info.policy_number}</span>
                </div>
              )}
              {analysis.insurance_info.coverage_type && (
                <div>
                  <span className="text-muted-foreground">Copertura:</span>
                  <span className="ml-2 font-medium">{analysis.insurance_info.coverage_type}</span>
                </div>
              )}
              {analysis.insurance_info.premium !== undefined && (
                <div>
                  <span className="text-muted-foreground">Premio:</span>
                  <span className="ml-2 font-medium">€{analysis.insurance_info.premium.toLocaleString()}</span>
                </div>
              )}
              {analysis.insurance_info.start_date && (
                <div>
                  <span className="text-muted-foreground">Inizio:</span>
                  <span className="ml-2 font-medium">{analysis.insurance_info.start_date}</span>
                </div>
              )}
              {analysis.insurance_info.end_date && (
                <div>
                  <span className="text-muted-foreground">Scadenza:</span>
                  <span className="ml-2 font-medium">{analysis.insurance_info.end_date}</span>
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
            <div className="space-y-3 text-sm">
              {analysis.fine_info.violation && (
                <div>
                  <span className="text-muted-foreground">Violazione:</span>
                  <p className="font-medium mt-0.5">{analysis.fine_info.violation}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {analysis.fine_info.date && (
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <span className="ml-2 font-medium">{analysis.fine_info.date}</span>
                  </div>
                )}
                {analysis.fine_info.original_amount !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Importo:</span>
                    <span className="ml-2 font-medium">€{analysis.fine_info.original_amount.toLocaleString()}</span>
                  </div>
                )}
                {analysis.fine_info.reduced_amount !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Ridotto:</span>
                    <span className="ml-2 font-medium text-green-600">€{analysis.fine_info.reduced_amount.toLocaleString()}</span>
                  </div>
                )}
                {analysis.fine_info.payment_deadline && (
                  <div>
                    <span className="text-muted-foreground">Scadenza pag.:</span>
                    <span className="ml-2 font-medium">{analysis.fine_info.payment_deadline}</span>
                  </div>
                )}
              </div>
              
              {analysis.fine_info.contestable !== undefined && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  {analysis.fine_info.contestable ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-700 font-medium">Contestabile</span>
                      {analysis.fine_info.contest_deadline && (
                        <span className="text-muted-foreground">entro {analysis.fine_info.contest_deadline}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-700 font-medium">Non contestabile</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Irregularities */}
        {analysis.irregularities && analysis.irregularities.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Anomalie Rilevate
            </h4>
            {analysis.irregularities.map((irreg, idx) => {
              const config = severityConfig[irreg.severity];
              return (
                <div key={idx} className={cn("p-2 rounded border text-sm", config.color)}>
                  <div className="font-medium capitalize">{irreg.type.replace(/_/g, ' ')}</div>
                  <p className="mt-1">{irreg.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Actionable Advice */}
        {analysis.actionable_advice && analysis.actionable_advice.length > 0 && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
            <h4 className="font-medium flex items-center gap-2 mb-2 text-primary">
              <Gavel className="h-4 w-4" />
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