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
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkAnalysis {
  document_subtype: string;
  employee_info?: {
    name: string;
    fiscal_code?: string;
    hire_date?: string;
    contract_type?: string;
    level?: string;
    ccnl?: string;
  };
  salary_info?: {
    gross_salary: number;
    net_salary: number;
    month: string;
    year: number;
    worked_days: number;
    overtime_hours?: number;
    deductions: Array<{
      type: string;
      amount: number;
    }>;
    allowances: Array<{
      type: string;
      amount: number;
    }>;
  };
  tfr_info?: {
    accrued_amount: number;
    year_contribution: number;
  };
  leave_info?: {
    vacation_remaining: number;
    vacation_accrued: number;
    sick_days_used: number;
    permits_remaining: number;
  };
  irregularities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  estimated_annual_gross?: number;
}

interface WorkAnalysisCardProps {
  analysis: WorkAnalysis;
}

const subtypeLabels: Record<string, string> = {
  busta_paga: 'Busta Paga',
  contratto_lavoro: 'Contratto di Lavoro',
  cud: 'CUD / Certificazione Unica',
  lettera_licenziamento: 'Lettera di Licenziamento',
  tfr: 'TFR'
};

const severityConfig = {
  low: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/30', label: 'Basso' },
  medium: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30', label: 'Medio' },
  high: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/30', label: 'Alto' },
  critical: { color: 'bg-red-500/10 text-red-700 border-red-500/30', label: 'Critico' }
};

export const WorkAnalysisCard: React.FC<WorkAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="border-l-4 border-l-pink-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-pink-500" />
            Analisi Documento Lavoro
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {subtypeLabels[analysis.document_subtype] || analysis.document_subtype}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Employee Info */}
        {analysis.employee_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4" />
              Informazioni Dipendente
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {analysis.employee_info.name && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="ml-2 font-medium">{analysis.employee_info.name}</span>
                </div>
              )}
              {analysis.employee_info.contract_type && (
                <div>
                  <span className="text-muted-foreground">Contratto:</span>
                  <span className="ml-2 font-medium capitalize">{analysis.employee_info.contract_type}</span>
                </div>
              )}
              {analysis.employee_info.level && (
                <div>
                  <span className="text-muted-foreground">Livello:</span>
                  <span className="ml-2 font-medium">{analysis.employee_info.level}</span>
                </div>
              )}
              {analysis.employee_info.ccnl && (
                <div>
                  <span className="text-muted-foreground">CCNL:</span>
                  <span className="ml-2 font-medium">{analysis.employee_info.ccnl}</span>
                </div>
              )}
              {analysis.employee_info.hire_date && (
                <div>
                  <span className="text-muted-foreground">Assunzione:</span>
                  <span className="ml-2 font-medium">{analysis.employee_info.hire_date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Salary Info */}
        {analysis.salary_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Euro className="h-4 w-4" />
              Retribuzione - {analysis.salary_info.month} {analysis.salary_info.year}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded bg-muted/50 text-center">
                <p className="text-muted-foreground text-xs">Lordo</p>
                <p className="text-lg font-bold">€{analysis.salary_info.gross_salary.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded bg-green-500/10 text-center">
                <p className="text-green-700 text-xs">Netto</p>
                <p className="text-lg font-bold text-green-700">€{analysis.salary_info.net_salary.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Giorni lavorati:</span>
                <span className="ml-2 font-medium">{analysis.salary_info.worked_days}</span>
              </div>
              {analysis.salary_info.overtime_hours !== undefined && (
                <div>
                  <span className="text-muted-foreground">Straordinari:</span>
                  <span className="ml-2 font-medium">{analysis.salary_info.overtime_hours} ore</span>
                </div>
              )}
            </div>

            {/* Deductions */}
            {analysis.salary_info.deductions && analysis.salary_info.deductions.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Trattenute</p>
                <div className="space-y-1">
                  {analysis.salary_info.deductions.map((ded, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{ded.type}</span>
                      <span className="text-red-600">-€{ded.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allowances */}
            {analysis.salary_info.allowances && analysis.salary_info.allowances.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Indennità</p>
                <div className="space-y-1">
                  {analysis.salary_info.allowances.map((all, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{all.type}</span>
                      <span className="text-green-600">+€{all.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leave Info */}
        {analysis.leave_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Umbrella className="h-4 w-4" />
              Ferie e Permessi
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="text-muted-foreground text-xs">Ferie Residue</p>
                <p className="font-bold">{analysis.leave_info.vacation_remaining} giorni</p>
              </div>
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="text-muted-foreground text-xs">Ferie Maturate</p>
                <p className="font-bold">{analysis.leave_info.vacation_accrued} giorni</p>
              </div>
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="text-muted-foreground text-xs">Malattia Usata</p>
                <p className="font-bold">{analysis.leave_info.sick_days_used} giorni</p>
              </div>
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="text-muted-foreground text-xs">Permessi Residui</p>
                <p className="font-bold">{analysis.leave_info.permits_remaining} ore</p>
              </div>
            </div>
          </div>
        )}

        {/* TFR Info */}
        {analysis.tfr_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              TFR Maturato
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 rounded bg-primary/10 text-center">
                <p className="text-primary text-xs">Totale Accantonato</p>
                <p className="font-bold text-primary">€{analysis.tfr_info.accrued_amount.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="text-muted-foreground text-xs">Quota Anno</p>
                <p className="font-bold">€{analysis.tfr_info.year_contribution.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Annual */}
        {analysis.estimated_annual_gross && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">RAL Stimata</span>
              <span className="text-lg font-bold text-primary">
                €{analysis.estimated_annual_gross.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Irregularities */}
        {analysis.irregularities && analysis.irregularities.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Anomalie Rilevate
            </h4>
            {analysis.irregularities.map((irreg, idx) => {
              const config = severityConfig[irreg.severity];
              return (
                <div key={idx} className={cn("p-3 rounded-lg border", config.color)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm capitalize">
                      {irreg.type.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm">{irreg.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkAnalysisCard;
