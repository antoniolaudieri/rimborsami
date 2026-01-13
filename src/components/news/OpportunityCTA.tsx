import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Euro, Clock, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OpportunityData {
  id: string;
  title: string;
  short_description: string | null;
  min_amount: number | null;
  max_amount: number | null;
  category: string;
  legal_reference: string | null;
  deadline_days: number | null;
}

interface OpportunityCTAProps {
  opportunity: OpportunityData;
}

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  telecom: 'Telefonia',
  energy: 'Energia',
  bank: 'Banche',
  ecommerce: 'E-commerce',
  class_action: 'Class Action',
  insurance: 'Assicurazioni',
  transport: 'Trasporti',
  warranty: 'Garanzia',
};

export function OpportunityCTA({ opportunity }: OpportunityCTAProps) {
  const { user } = useAuth();
  
  const minAmount = opportunity.min_amount || 0;
  const maxAmount = opportunity.max_amount || 500;
  const avgAmount = Math.round((minAmount + maxAmount) / 2);
  
  const targetUrl = user 
    ? `/dashboard/opportunities/${opportunity.id}` 
    : '/quiz';

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="default" className="bg-primary/90">
            Opportunità di Rimborso
          </Badge>
          <Badge variant="outline">
            {categoryLabels[opportunity.category] || opportunity.category}
          </Badge>
        </div>
        <CardTitle className="text-xl md:text-2xl">
          {opportunity.title}
        </CardTitle>
        {opportunity.short_description && (
          <CardDescription className="text-base">
            {opportunity.short_description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-5 w-5 text-primary" />
            <div>
              <span className="text-2xl font-bold text-primary">
                €{minAmount} - €{maxAmount}
              </span>
              <p className="text-muted-foreground text-xs">Importo recuperabile</p>
            </div>
          </div>
          
          {opportunity.deadline_days && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {opportunity.deadline_days} giorni per richiedere
              </span>
            </div>
          )}
          
          {opportunity.legal_reference && (
            <div className="flex items-center gap-2 text-sm">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {opportunity.legal_reference}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={targetUrl} className="flex-1">
            <Button size="lg" className="w-full gap-2 shadow-lg">
              Avvia Reclamo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/opportunities" className="sm:flex-shrink-0">
            <Button size="lg" variant="outline" className="w-full">
              Altre Opportunità
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          {user ? 'Sei già registrato. Avvia subito la procedura.' : 'Fai il quiz gratuito per scoprire tutti i tuoi rimborsi.'}
        </p>
      </CardContent>
    </Card>
  );
}
