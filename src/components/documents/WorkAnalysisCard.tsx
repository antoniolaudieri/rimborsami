import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Euro, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Umbrella,
  AlertOctagon,
  Info,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkAnalysis } from '@/hooks/useDocuments';

interface WorkAnalysisCardProps {
  analysis: WorkAnalysis;
}

const subtypeLabels: Record<string, string> = {
  busta_paga: 'Busta Paga',
  contratto_lavoro: 'Contratto di Lavoro',
  cud: 'CUD / Certificazione Unica',
  tfr: 'Prospetto TFR',
  lettera_licenziamento: 'Lettera di Licenziamento'
};

const severityConfig = {
  low: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/30', icon: Info, label: 'Basso' },
  medium: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30', icon: AlertTriangle, label: 'Medio' },
  high: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/30', icon: AlertOctagon, label: 'Alto' },
  critical: { color: 'bg-red-500/10 text-red-700 border-red-500/30', icon: XCircle, label: 'Critico' }
};

export const WorkAnalysisCard: React.FC<WorkAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-teal-500" />
            Analisi Documento Lavoro
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {subtypeLabels[analysis.document_subtype || ''] || analysis.document_subtype || 'Documento'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Employer Info */}
        {analysis.employer && (
          <div className="p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Datore di lavoro:</span>
            <p className="font-medium">{analysis.employer}</p>
          </div>
        )}

        {/* Period */}
        {analysis.period && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Periodo:</span>
            {analysis.period.month && analysis.period.year ? (
              <span className="font-medium">{analysis.period.month}/{analysis.period.year}</span>
            ) : analysis.period.from && analysis.period.to ? (
              <span className="font-medium">{analysis.period.from} - {analysis.period.to}</span>
            ) : null}
          </div>
        )}

        {/* Salary Info */}
        {analysis.salary_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Euro className="h-4 w-4" />
              Informazioni Retributive
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {analysis.salary_info.gross_salary !== undefined && (
                <div>
                  <span className="text-muted-foreground">Lordo:</span>
                  <span className="ml-2 font-medium">€{analysis.salary_info.gross_salary.toLocaleString()}</span>
                </div>
              )}
              {analysis.salary_info.net_salary !== undefined && (
                <div>
                  <span className="text-muted-foreground">Netto:</span>
                  <span className="ml-2 font-medium text-green-600">€{analysis.salary_info.net_salary.toLocaleString()}</span>
                </div>
              )}
              {analysis.salary_info.inps_contributions !== undefined && (
                <div>
                  <span className="text-muted-foreground">INPS:</span>
                  <span className="ml-2 font-medium">€{analysis.salary_info.inps_contributions.toLocaleString()}</span>
                </div>
              )}
              {analysis.salary_info.irpef !== undefined && (
                <div>
                  <span className="text-muted-foreground">IRPEF:</span>
                  <span className="ml-2 font-medium">€{analysis.salary_info.irpef.toLocaleString()}</span>
                </div>
              )}
              {analysis.salary_info.tfr_accrued !== undefined && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">TFR Maturato:</span>
                  <span className="ml-2 font-medium">€{analysis.salary_info.tfr_accrued.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leave Info */}
        {(analysis.salary_info?.remaining_holidays !== undefined || analysis.salary_info?.remaining_permits !== undefined) && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Umbrella className="h-4 w-4" />
              Ferie e Permessi
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {analysis.salary_info.remaining_holidays !== undefined && (
                <div>
                  <span className="text-muted-foreground">Ferie residue:</span>
                  <span className="ml-2 font-medium">{analysis.salary_info.remaining_holidays} ore</span>
                </div>
              )}
              {analysis.salary_info.remaining_permits !== undefined && (
                <div>
                  <span className="text-muted-foreground">Permessi residui:</span>
                  <span className="ml-2 font-medium">{analysis.salary_info.remaining_permits} ore</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contract Info */}
        {analysis.contract_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              Informazioni Contratto
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {analysis.contract_info.type && (
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="ml-2 font-medium">{analysis.contract_info.type}</span>
                </div>
              )}
              {analysis.contract_info.level && (
                <div>
                  <span className="text-muted-foreground">Livello:</span>
                  <span className="ml-2 font-medium">{analysis.contract_info.level}</span>
                </div>
              )}
              {analysis.contract_info.ccnl && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">CCNL:</span>
                  <span className="ml-2 font-medium">{analysis.contract_info.ccnl}</span>
                </div>
              )}
              {analysis.contract_info.start_date && (
                <div>
                  <span className="text-muted-foreground">Inizio:</span>
                  <span className="ml-2 font-medium">{analysis.contract_info.start_date}</span>
                </div>
              )}
              {analysis.contract_info.end_date && (
                <div>
                  <span className="text-muted-foreground">Scadenza:</span>
                  <span className="ml-2 font-medium">{analysis.contract_info.end_date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Irregularities */}
        {analysis.irregularities && analysis.irregularities.length > 0 && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
            <h4 className="font-medium flex items-center gap-2 mb-3 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Irregolarità Rilevate
            </h4>
            <div className="space-y-2">
              {analysis.irregularities.map((irreg, idx) => {
                const config = severityConfig[irreg.severity];
                return (
                  <div key={idx} className={cn("p-2 rounded border text-sm", config.color)}>
                    <div className="font-medium capitalize">{irreg.type.replace(/_/g, ' ')}</div>
                    <p className="mt-1">{irreg.description}</p>
                    {irreg.legal_reference && (
                      <p className="text-xs mt-1 opacity-80">Rif: {irreg.legal_reference}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actionable Advice */}
        {analysis.actionable_advice && analysis.actionable_advice.length > 0 && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
            <h4 className="font-medium flex items-center gap-2 mb-2 text-primary">
              <Clock className="h-4 w-4" />
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

export default WorkAnalysisCard;