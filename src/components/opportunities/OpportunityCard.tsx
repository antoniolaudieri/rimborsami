import { motion } from "framer-motion";
import { ChevronRight, Euro, Lock, FileCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/opportunities/CompanyLogo";
import DeadlineCountdown from "@/components/opportunities/DeadlineCountdown";
import { differenceInDays, parseISO } from "date-fns";

interface OpportunityCardProps {
  opportunity: {
    id: string;
    status: string;
    estimated_amount: number | null;
    deadline: string | null;
    created_at: string;
    matched_data: Record<string, unknown> | null;
    opportunities: {
      id: string;
      title: string;
      category: string;
      short_description: string | null;
      description: string | null;
      min_amount: number | null;
      max_amount: number | null;
      legal_reference: string | null;
    } | null;
  };
  isFree: boolean;
  isPremium: boolean;
  onClick: () => void;
  index: number;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  categoryLabels: Record<string, string>;
}

const OpportunityCard = ({
  opportunity: opp,
  isFree,
  isPremium,
  onClick,
  index,
  statusColors,
  statusLabels,
  categoryLabels,
}: OpportunityCardProps) => {
  // Check if opportunity is new (less than 7 days old)
  const isNew = differenceInDays(new Date(), parseISO(opp.created_at)) < 7;
  
  // Check if deadline is urgent
  const isUrgent = opp.deadline && differenceInDays(parseISO(opp.deadline), new Date()) <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div onClick={onClick} className="cursor-pointer">
        <Card className={`hover:shadow-md transition-all relative overflow-hidden ${
          isUrgent ? 'border-orange-300 dark:border-orange-700' : 'hover:border-primary/30'
        }`}>
          <CardContent className="py-4 px-4 sm:px-6">
            <div className="flex items-start gap-4">
              {/* Company logo */}
              <CompanyLogo 
                category={opp.opportunities?.category || 'other'}
                matchedData={opp.matched_data as Record<string, unknown> | undefined}
                opportunityTitle={opp.opportunities?.title}
                size="md"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {isFree ? (
                      <>
                        <h3 className="font-semibold text-muted-foreground">
                          Opportunità • {categoryLabels[opp.opportunities?.category || 'other']}
                        </h3>
                        <p className="text-sm text-muted-foreground/70 mt-0.5 blur-[3px] select-none">
                          Nome azienda nascosto
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold line-clamp-2 sm:line-clamp-1 pr-8">
                          {opp.opportunities?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {categoryLabels[opp.opportunities?.category || 'other']}
                          {opp.opportunities?.legal_reference && (
                            <span className="hidden sm:inline ml-2">• {opp.opportunities.legal_reference}</span>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    {isNew && (
                      <Badge className="bg-gradient-hero text-white border-0 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Nuovo
                      </Badge>
                    )}
                    <Badge className={`${statusColors[opp.status]} text-xs`}>
                      {statusLabels[opp.status]}
                    </Badge>
                    {isFree && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Description - hidden on mobile */}
                {!isFree && opp.opportunities?.short_description && (
                  <p className="hidden sm:block text-sm text-muted-foreground mt-2 line-clamp-2">
                    {opp.opportunities.short_description}
                  </p>
                )}
                {isFree && (
                  <p className="hidden sm:block text-sm text-muted-foreground mt-2 blur-[3px] select-none">
                    Descrizione dettagliata dell'opportunità nascosta...
                  </p>
                )}

                {/* Bottom row with amount, deadline, proof */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {/* Amount */}
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                    <Euro className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      {isFree ? (
                        `${opp.opportunities?.min_amount?.toLocaleString('it-IT')} - ${opp.opportunities?.max_amount?.toLocaleString('it-IT')}`
                      ) : (
                        opp.estimated_amount?.toLocaleString('it-IT') || 'Variabile'
                      )}
                    </span>
                  </div>

                  {/* Deadline countdown */}
                  {isPremium && opp.deadline && (
                    <DeadlineCountdown deadline={opp.deadline} compact />
                  )}
                  {isFree && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground blur-[3px]">
                      Scadenza nascosta
                    </span>
                  )}

                  {/* Proof indicator */}
                  {isPremium && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <FileCheck className="w-3.5 h-3.5" />
                      Prova: Auto
                    </span>
                  )}

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto flex-shrink-0" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default OpportunityCard;
