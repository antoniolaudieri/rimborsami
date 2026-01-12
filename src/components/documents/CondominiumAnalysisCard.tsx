import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Scale,
  Euro,
  Calendar,
  Gavel,
  AlertOctagon,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CondominiumIrregularity {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  legal_reference?: string;
  action_deadline?: string;
}

interface CondominiumDeliberation {
  topic: string;
  votes_favor: number;
  votes_against: number;
  votes_abstained?: number;
  required_majority: string;
  is_valid: boolean;
  invalidation_reason?: string;
}

interface CondominiumAnalysis {
  document_subtype: string;
  assembly_info?: {
    date: string;
    type: 'ordinaria' | 'straordinaria';
    convocation: 'prima' | 'seconda';
    quorum_reached: boolean;
    attendees_count: number;
    delegations_count?: number;
    millesimi_present: number;
    millesimi_total: number;
    president?: string;
    secretary?: string;
  };
  deliberations?: CondominiumDeliberation[];
  financial_info?: {
    period: string;
    total_expenses: number;
    reserve_fund: number;
    per_millesimo_cost: number;
    main_expense_categories?: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    suspicious_entries?: Array<{
      description: string;
      amount: number;
      issue: string;
    }>;
  };
  contract_info?: {
    supplier: string;
    service_type: string;
    start_date: string;
    end_date: string;
    total_value: number;
    auto_renewal: boolean;
    notice_period_days: number;
    problematic_clauses?: string[];
  };
  irregularities: CondominiumIrregularity[];
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  actionable_advice: string[];
  legal_deadlines?: Array<{
    action: string;
    deadline: string;
    days_remaining: number;
  }>;
}

interface CondominiumAnalysisCardProps {
  analysis: CondominiumAnalysis;
}

const severityConfig = {
  low: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/30', icon: Info, label: 'Basso' },
  medium: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30', icon: AlertTriangle, label: 'Medio' },
  high: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/30', icon: AlertOctagon, label: 'Alto' },
  critical: { color: 'bg-red-500/10 text-red-700 border-red-500/30', icon: XCircle, label: 'Critico' }
};

const subtypeLabels: Record<string, string> = {
  verbale_assemblea: 'Verbale Assemblea',
  convocazione_assemblea: 'Convocazione Assemblea',
  rendiconto_condominiale: 'Rendiconto Condominiale',
  bilancio_preventivo: 'Bilancio Preventivo',
  tabella_millesimale: 'Tabella Millesimale',
  contratto_fornitore: 'Contratto Fornitore',
  regolamento_condominiale: 'Regolamento Condominiale'
};

export const CondominiumAnalysisCard: React.FC<CondominiumAnalysisCardProps> = ({ analysis }) => {
  const [isDeliberationsOpen, setIsDeliberationsOpen] = React.useState(false);
  const [isFinancialOpen, setIsFinancialOpen] = React.useState(false);
  const [isIrregularitiesOpen, setIsIrregularitiesOpen] = React.useState(true);

  const riskColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  };

  const riskBg = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Analisi Condominiale
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {subtypeLabels[analysis.document_subtype] || analysis.document_subtype}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Risk Score */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Punteggio Rischio</span>
              <span className={cn("font-bold", riskColor[analysis.risk_level])}>
                {analysis.risk_score}/100
              </span>
            </div>
            <Progress value={analysis.risk_score} className="h-2" />
          </div>
          <Badge className={cn("capitalize", severityConfig[analysis.risk_level].color)}>
            {severityConfig[analysis.risk_level].label}
          </Badge>
        </div>

        {/* Assembly Info */}
        {analysis.assembly_info && (
          <div className="p-3 rounded-lg border bg-card">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              Informazioni Assemblea
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Data:</span>
                <span className="ml-2 font-medium">{analysis.assembly_info.date}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <span className="ml-2 font-medium capitalize">{analysis.assembly_info.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Convocazione:</span>
                <span className="ml-2 font-medium capitalize">{analysis.assembly_info.convocation}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Presenti:</span>
                <span className="ml-2 font-medium">
                  {analysis.assembly_info.attendees_count}
                  {analysis.assembly_info.delegations_count && ` (+${analysis.assembly_info.delegations_count} deleghe)`}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Millesimi:</span>
                <span className="ml-2 font-medium">
                  {analysis.assembly_info.millesimi_present}/{analysis.assembly_info.millesimi_total}
                  <span className="text-muted-foreground ml-1">
                    ({((analysis.assembly_info.millesimi_present / analysis.assembly_info.millesimi_total) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-muted-foreground">Quorum:</span>
                {analysis.assembly_info.quorum_reached ? (
                  <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Raggiunto
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-700 border-red-500/30">
                    <XCircle className="h-3 w-3 mr-1" />
                    Non Raggiunto
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deliberations */}
        {analysis.deliberations && analysis.deliberations.length > 0 && (
          <Collapsible open={isDeliberationsOpen} onOpenChange={setIsDeliberationsOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <h4 className="font-medium flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Delibere ({analysis.deliberations.length})
                </h4>
                {isDeliberationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {analysis.deliberations.map((delib, idx) => (
                <div key={idx} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium">{delib.topic}</span>
                    {delib.is_valid ? (
                      <Badge className="bg-green-500/10 text-green-700 border-green-500/30 shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valida
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-700 border-red-500/30 shrink-0">
                        <XCircle className="h-3 w-3 mr-1" />
                        Non Valida
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>✓ {delib.votes_favor}</span>
                    <span>✗ {delib.votes_against}</span>
                    {delib.votes_abstained !== undefined && <span>○ {delib.votes_abstained}</span>}
                    <span className="text-xs">({delib.required_majority})</span>
                  </div>
                  {delib.invalidation_reason && (
                    <p className="mt-2 text-red-600 text-xs">{delib.invalidation_reason}</p>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Financial Info */}
        {analysis.financial_info && (
          <Collapsible open={isFinancialOpen} onOpenChange={setIsFinancialOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <h4 className="font-medium flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Informazioni Finanziarie
                </h4>
                {isFinancialOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 rounded-lg border space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Periodo:</span>
                    <span className="ml-2 font-medium">{analysis.financial_info.period}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Totale Spese:</span>
                    <span className="ml-2 font-medium">€{analysis.financial_info.total_expenses.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fondo Riserva:</span>
                    <span className="ml-2 font-medium">€{analysis.financial_info.reserve_fund.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Costo/Millesimo:</span>
                    <span className="ml-2 font-medium">€{analysis.financial_info.per_millesimo_cost.toFixed(2)}</span>
                  </div>
                </div>

                {analysis.financial_info.main_expense_categories && analysis.financial_info.main_expense_categories.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Categorie Spesa Principali</p>
                    <div className="space-y-1">
                      {analysis.financial_info.main_expense_categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{cat.category}</span>
                          <span className="text-muted-foreground">
                            €{cat.amount.toLocaleString()} ({cat.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.financial_info.suspicious_entries && analysis.financial_info.suspicious_entries.length > 0 && (
                  <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                    <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Voci Sospette
                    </p>
                    <div className="space-y-2">
                      {analysis.financial_info.suspicious_entries.map((entry, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{entry.description}</span>
                            <span className="text-red-600">€{entry.amount.toLocaleString()}</span>
                          </div>
                          <p className="text-red-600/80 text-xs">{entry.issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Irregularities */}
        {analysis.irregularities && analysis.irregularities.length > 0 && (
          <Collapsible open={isIrregularitiesOpen} onOpenChange={setIsIrregularitiesOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                <h4 className="font-medium flex items-center gap-2 text-red-700">
                  <AlertOctagon className="h-4 w-4" />
                  Irregolarità Rilevate ({analysis.irregularities.length})
                </h4>
                {isIrregularitiesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {analysis.irregularities.map((irreg, idx) => {
                const config = severityConfig[irreg.severity];
                const IconComponent = config.icon;
                
                return (
                  <div key={idx} className={cn("p-3 rounded-lg border", config.color)}>
                    <div className="flex items-start gap-2">
                      <IconComponent className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium capitalize">{irreg.type.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{irreg.description}</p>
                        {irreg.legal_reference && (
                          <p className="text-xs mt-1 opacity-80 flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {irreg.legal_reference}
                          </p>
                        )}
                        {irreg.action_deadline && (
                          <p className="text-xs mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scadenza: {irreg.action_deadline}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Legal Deadlines */}
        {analysis.legal_deadlines && analysis.legal_deadlines.length > 0 && (
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <h4 className="font-medium flex items-center gap-2 mb-3 text-yellow-700">
              <Calendar className="h-4 w-4" />
              Scadenze Legali
            </h4>
            <div className="space-y-2">
              {analysis.legal_deadlines.map((deadline, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{deadline.action}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{deadline.deadline}</span>
                    <Badge variant={deadline.days_remaining <= 7 ? "destructive" : "secondary"}>
                      {deadline.days_remaining} giorni
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Advice */}
        {analysis.actionable_advice && analysis.actionable_advice.length > 0 && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
            <h4 className="font-medium flex items-center gap-2 mb-3 text-primary">
              <FileText className="h-4 w-4" />
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

export default CondominiumAnalysisCard;
