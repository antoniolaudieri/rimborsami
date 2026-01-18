import { Shield, Plane, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackAffiliateClick, getAffiliateUrl } from "@/lib/affiliateAnalytics";

interface InsuranceAffiliateProps {
  articleSlug?: string;
  source?: 'article' | 'opportunity' | 'sidebar';
  variant?: 'compact' | 'full';
}

export function InsuranceAffiliate({ 
  articleSlug, 
  source = 'article',
  variant = 'full' 
}: InsuranceAffiliateProps) {
  const handleClick = () => {
    trackAffiliateClick({
      partner: 'heymondo',
      source,
      articleSlug,
      category: 'flight',
      timestamp: new Date(),
    });
    
    window.open(getAffiliateUrl('heymondo', 'flight'), '_blank', 'noopener');
  };

  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Proteggi il tuo viaggio</p>
            <p className="text-xs text-muted-foreground">Assicurazione viaggio da €3/giorno</p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleClick}
            className="shrink-0"
          >
            Scopri
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 overflow-hidden my-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
            <Shield className="h-7 w-7 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Partner consigliato
              </span>
            </div>
            
            <h4 className="font-semibold text-lg mb-2">
              Proteggi il tuo prossimo viaggio
            </h4>
            
            <p className="text-muted-foreground text-sm mb-4">
              Evita problemi futuri con un'assicurazione viaggio completa. 
              Copertura per cancellazioni, ritardi, bagagli e spese mediche.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                'Cancellazione volo',
                'Ritardo bagagli',
                'Spese mediche',
                'Assistenza 24/7'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleClick}
                className="bg-primary hover:bg-primary/90"
              >
                <Plane className="h-4 w-4 mr-2" />
                Ottieni preventivo gratuito
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Da €3/giorno
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground/60 mt-4 pt-3 border-t border-border/50">
          Annuncio • Rimborsami potrebbe ricevere una commissione per gli acquisti effettuati tramite questo link
        </p>
      </CardContent>
    </Card>
  );
}
