import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  Euro,
  Shield,
  Zap,
  FileText,
  Bell,
  Calendar,
  X,
  Loader2,
} from 'lucide-react';

// Stripe Price IDs
const STRIPE_PRICES = {
  monthly: 'price_1Sp6g1IUZ8Cgf1436Gdvgzv2',
  annual: 'price_1Sp6gEIUZ8Cgf143w08nY8FK',
};

interface PaywallProps {
  opportunitiesCount?: number;
  estimatedRange?: { min: number; max: number };
  onClose?: () => void;
  variant?: 'modal' | 'inline' | 'fullpage';
}

export function Paywall({
  opportunitiesCount = 0,
  estimatedRange,
  onClose,
  variant = 'modal',
}: PaywallProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const benefits = [
    { icon: FileText, text: 'Dettagli completi delle opportunità' },
    { icon: Euro, text: 'Importo preciso per ogni pratica' },
    { icon: Zap, text: 'Generazione automatica email/PEC' },
    { icon: Calendar, text: 'Scadenze e reminder automatici' },
    { icon: Bell, text: 'Notifiche avanzate' },
    { icon: Shield, text: 'Base legale di ogni rimborso' },
  ];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const priceId = isAnnual ? STRIPE_PRICES.annual : STRIPE_PRICES.monthly;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      
      if (data?.url) {
        // Redirect diretto invece di popup per evitare blocchi browser
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile avviare il checkout. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const monthlyPrice = 9.99;
  const annualPrice = 71.99;
  const annualMonthlyPrice = (annualPrice / 12).toFixed(2);
  const savingsPercent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);

  const content = (
    <div className="space-y-6">
      {/* Header con logo e valore scoperto */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <Logo size="xl" showText={false} linkTo={undefined} />
        </motion.div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Hai trovato <span className="text-gradient-hero">{opportunitiesCount} opportunità</span>!
          </h2>
          {estimatedRange && (
            <p className="text-lg text-muted-foreground mt-2">
              Potresti recuperare tra{' '}
              <span className="font-semibold text-foreground">
                €{estimatedRange.min.toLocaleString('it-IT')}
              </span>
              {' e '}
              <span className="font-semibold text-foreground">
                €{estimatedRange.max.toLocaleString('it-IT')}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Messaggio valore */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Questi soldi ti appartengono di diritto</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sblocca i dettagli per iniziare a recuperarli. Ti guidiamo passo dopo passo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Piano toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="plan-toggle" className={!isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
          Mensile
        </Label>
        <Switch
          id="plan-toggle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label htmlFor="plan-toggle" className={isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
          Annuale
          <Badge variant="secondary" className="ml-2 text-xs">
            -{savingsPercent}%
          </Badge>
        </Label>
      </div>

      {/* Pricing display */}
      <div className="text-center">
        <div className="text-4xl font-bold">
          €{isAnnual ? annualMonthlyPrice : monthlyPrice.toFixed(2)}
          <span className="text-lg font-normal text-muted-foreground">/mese</span>
        </div>
        {isAnnual && (
          <p className="text-sm text-muted-foreground mt-1">
            Fatturati €{annualPrice} all'anno
          </p>
        )}
      </div>

      {/* Benefits */}
      <div>
        <h3 className="font-semibold mb-3">Con il piano Premium ottieni:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{benefit.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing CTA */}
      <div className="space-y-3">
        <Button 
          size="lg" 
          className="w-full bg-gradient-hero hover:opacity-90"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Caricamento...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Sblocca tutto a €{isAnnual ? annualMonthlyPrice : monthlyPrice.toFixed(2)}/mese
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          ✓ Soddisfatti o rimborsati entro 14 giorni
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t">
        <Badge variant="secondary" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Pagamento sicuro
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Cancella quando vuoi
        </Badge>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <Card className="border-primary/30 shadow-glow">
        <CardContent className="py-6">{content}</CardContent>
      </Card>
    );
  }

  if (variant === 'fullpage') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full my-auto"
        >
          <Card className="border-primary/30 shadow-glow max-h-[85vh] overflow-y-auto">
            <CardContent className="py-8">{content}</CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Modal variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-w-lg w-full my-auto"
      >
        <Card className="border-primary/30 shadow-glow max-h-[90vh] overflow-y-auto">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <CardContent className="py-8">{content}</CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Componente per elementi bloccati
interface LockedContentProps {
  children?: React.ReactNode;
  message?: string;
  onClick?: () => void;
}

export function LockedContent({ children, message = 'Sblocca con Premium', onClick }: LockedContentProps) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      <div className="blur-sm select-none pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg transition-colors group-hover:bg-background/40">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Lock className="w-4 h-4" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}

// Badge per contenuto premium
export function PremiumBadge() {
  return (
    <Badge className="bg-gradient-gold text-white border-0">
      <Sparkles className="w-3 h-3 mr-1" />
      Premium
    </Badge>
  );
}
