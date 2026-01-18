import { Zap, Phone, ArrowRight, TrendingDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackAffiliateClick, getAffiliateUrl } from "@/lib/affiliateAnalytics";

interface UtilityComparatorProps {
  category: 'energy' | 'telecom';
  opportunityId?: string;
  source?: 'opportunity' | 'sidebar' | 'article';
}

export function UtilityComparator({ 
  category, 
  opportunityId,
  source = 'opportunity' 
}: UtilityComparatorProps) {
  const isEnergy = category === 'energy';
  
  const handleClick = () => {
    trackAffiliateClick({
      partner: 'segugio',
      source,
      opportunityId,
      category,
      timestamp: new Date(),
    });
    
    window.open(getAffiliateUrl('segugio', category), '_blank', 'noopener');
  };

  const Icon = isEnergy ? Zap : Phone;
  const title = isEnergy 
    ? "Stai pagando troppo per luce e gas?" 
    : "Hai la tariffa migliore per il tuo telefono?";
  const description = isEnergy
    ? "Confronta le offerte luce e gas e risparmia fino a €300/anno"
    : "Confronta le tariffe telefoniche e trova l'offerta perfetta per te";
  const savings = isEnergy ? "€300/anno" : "€120/anno";

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 border-amber-500/20 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">
                Risparmio medio: {savings}
              </span>
            </div>
            
            <h4 className="font-semibold text-base mb-1.5">
              {title}
            </h4>
            
            <p className="text-muted-foreground text-sm mb-4">
              {description}
            </p>
            
            <Button 
              onClick={handleClick}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Confronta offerte gratis
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground/60 mt-4 pt-3 border-t border-border/50">
          Annuncio • Servizio di comparazione partner
        </p>
      </CardContent>
    </Card>
  );
}
