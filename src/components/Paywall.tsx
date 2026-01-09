import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

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
  const benefits = [
    { icon: FileText, text: 'Dettagli completi delle opportunità' },
    { icon: Euro, text: 'Importo preciso per ogni pratica' },
    { icon: Zap, text: 'Generazione automatica email/PEC' },
    { icon: Calendar, text: 'Scadenze e reminder automatici' },
    { icon: Bell, text: 'Notifiche avanzate' },
    { icon: Shield, text: 'Base legale di ogni rimborso' },
  ];

  const content = (
    <div className="space-y-6">
      {/* Header con valore scoperto */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 mx-auto rounded-full bg-gradient-gold flex items-center justify-center shadow-gold"
        >
          <Sparkles className="w-8 h-8 text-white" />
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
        <Button asChild size="lg" className="w-full bg-gradient-hero hover:opacity-90">
          <Link to="/dashboard/settings#subscription">
            <Sparkles className="w-5 h-5 mr-2" />
            Sblocca tutto a €9,99/mese
          </Link>
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
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <Card className="border-primary/30 shadow-glow">
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-w-lg w-full"
      >
        <Card className="border-primary/30 shadow-glow">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
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
