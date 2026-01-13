import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import Logo from '@/components/Logo';
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  PartyPopper,
} from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { syncWithStripe, syncing, isPremium } = useSubscription();
  const [syncComplete, setSyncComplete] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const syncSubscription = async () => {
      await syncWithStripe();
      setSyncComplete(true);
    };

    if (sessionId) {
      syncSubscription();
    } else {
      setSyncComplete(true);
    }
  }, [sessionId, syncWithStripe]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="border-primary/30 shadow-glow overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <Logo size="xl" showText={false} linkTo={undefined} />
            </div>

            {/* Success animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-2 -right-2"
                >
                  <PartyPopper className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                Benvenuto in <span className="text-gradient-hero">Premium</span>!
              </h1>
              <p className="text-muted-foreground">
                Il tuo pagamento è stato completato con successo.
              </p>
            </div>

            {/* Sync status */}
            <div className="flex items-center justify-center gap-2 text-sm">
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Attivazione in corso...</span>
                </>
              ) : syncComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-primary font-medium">Abbonamento attivo!</span>
                </>
              ) : null}
            </div>

            {/* Benefits reminder */}
            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
              <p className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Ora hai accesso a:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Tutte le opportunità di rimborso</li>
                <li>• Generatore automatico email/PEC</li>
                <li>• Notifiche scadenze</li>
                <li>• Supporto prioritario</li>
              </ul>
            </div>

            {/* CTA */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/dashboard/opportunities')}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Attendere...
                </>
              ) : (
                <>
                  Vai alle mie opportunità
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Riceverai un'email di conferma a breve.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
