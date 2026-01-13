import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, Euro, Sparkles } from 'lucide-react';

export function NewsCTA() {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Hai diritto a un rimborso?
            </h3>
            <p className="text-muted-foreground mb-4">
              Scopri gratuitamente se puoi recuperare soldi da voli, bollette, banche e molto altro. 
              Rimborsami analizza le tue opportunità in pochi secondi.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-primary" />
                100% Sicuro
              </span>
              <span className="flex items-center gap-1">
                <Euro className="h-4 w-4 text-primary" />
                €847 recupero medio
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Analisi gratuita
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link to="/auth">
              <Button size="lg" className="gap-2 shadow-lg">
                Scopri i tuoi rimborsi
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
