import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShareButtons } from './ShareButtons';
import { useReferral } from '@/hooks/useReferral';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Gift, Users, TrendingUp } from 'lucide-react';

interface ShareSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  company: string;
  category: string;
  userOpportunityId: string;
}

// Confetti component
function Confetti() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.x}%`,
            top: -20,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function ShareSuccessModal({
  isOpen,
  onClose,
  amount,
  company,
  category,
  userOpportunityId,
}: ShareSuccessModalProps) {
  const { user } = useAuth();
  const { getShareUrl, getShareMessage, trackShare } = useReferral();
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareOnWall, setShareOnWall] = useState(true);
  const [personalMessage, setPersonalMessage] = useState('');
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const shareUrl = getShareUrl();
  const shareMessage = getShareMessage(amount, company);

  const handleShare = async (platform: string) => {
    await trackShare(platform);
    setHasShared(true);
    
    // Save to success wall if enabled
    if (shareOnWall && user) {
      const profile = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const fullName = profile.data?.full_name || 'Utente';
      const nameParts = fullName.split(' ');
      const anonymousName = nameParts[0] + (nameParts[1] ? ` ${nameParts[1][0]}.` : '');

      await supabase.from('shared_successes').insert({
        user_id: user.id,
        user_opportunity_id: userOpportunityId,
        amount_recovered: amount,
        company_name: company,
        category,
        anonymous_name: anonymousName,
        message: personalMessage || null,
        is_public: true,
      });
    }

    toast({
      title: '🎉 Grazie per aver condiviso!',
      description: 'Ogni amico che si registra ti fa guadagnare punti!',
    });
  };

  const handleClose = () => {
    setHasShared(false);
    setPersonalMessage('');
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="mx-auto mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <DialogTitle className="text-center text-2xl">
              🎉 Congratulazioni!
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              Hai recuperato <span className="font-bold text-primary">{amount}€</span> da{' '}
              <span className="font-semibold">{company}</span>!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Benefits of sharing */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-lg bg-muted/50"
              >
                <Gift className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Guadagna premi</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 rounded-lg bg-muted/50"
              >
                <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Aiuta gli amici</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-3 rounded-lg bg-muted/50"
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Scala la classifica</p>
              </motion.div>
            </div>

            {/* Share on wall option */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30">
              <Checkbox
                id="shareOnWall"
                checked={shareOnWall}
                onCheckedChange={(checked) => setShareOnWall(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="shareOnWall" className="font-medium cursor-pointer">
                  Mostra sulla Bacheca dei Successi
                </Label>
                <p className="text-xs text-muted-foreground">
                  Il tuo nome sarà mostrato in forma anonima (es. "Marco R.")
                </p>
              </div>
            </div>

            {/* Optional personal message */}
            {shareOnWall && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label htmlFor="message" className="text-sm font-medium">
                  Aggiungi un messaggio (opzionale)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Es. Non ci credevo, ma ha funzionato davvero!"
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  className="mt-1.5"
                  rows={2}
                />
              </motion.div>
            )}

            {/* Share buttons */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">
                Condividi il tuo successo
              </p>
              <ShareButtons
                url={shareUrl}
                message={shareMessage}
                onShare={handleShare}
                size="lg"
              />
            </div>

            {hasShared && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-900/30"
              >
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  ✅ Condivisione tracciata! Grazie!
                </p>
              </motion.div>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleClose}
            >
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
