import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Plane, ArrowRight, AlertTriangle } from "lucide-react";

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse moves to top of viewport (exit intent)
    if (e.clientY <= 10 && !hasShown) {
      // Check if user hasn't seen this recently
      const lastShown = localStorage.getItem("exitPopupShown");
      const now = Date.now();
      
      // Don't show if shown in last 24 hours
      if (lastShown && now - parseInt(lastShown) < 24 * 60 * 60 * 1000) {
        return;
      }
      
      setIsVisible(true);
      setHasShown(true);
      localStorage.setItem("exitPopupShown", now.toString());
    }
  }, [hasShown]);

  useEffect(() => {
    // Only add listener on desktop
    if (window.innerWidth < 768) return;
    
    // Delay adding listener to avoid triggering immediately
    const timeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {!answer ? (
              // Initial question
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>

                <h3 className="font-display text-2xl font-bold text-center mb-2">
                  Aspetta! 🛑
                </h3>
                <p className="text-center text-muted-foreground mb-6">
                  Stai lasciando soldi sul tavolo?
                </p>

                <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Plane className="w-6 h-6 text-primary" />
                    <span className="font-medium">Hai viaggiato in aereo negli ultimi 3 anni?</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => setAnswer("yes")}
                    >
                      Sì, ho viaggiato
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => setAnswer("no")}
                    >
                      No
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Verifica gratuita • 2 minuti • 100% sicuro
                </p>
              </>
            ) : answer === "yes" ? (
              // Positive answer - show potential
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-hero rounded-2xl mx-auto mb-6 shadow-glow">
                  <span className="text-3xl">🎉</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-center mb-2">
                  Potresti recuperare fino a
                </h3>
                <div className="text-center mb-6">
                  <span className="font-display text-5xl font-bold text-gradient-hero">€600</span>
                  <p className="text-muted-foreground mt-2">
                    per ogni volo cancellato o in ritardo!
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    <span>Oltre 127.000 italiani hanno già recuperato</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    <span>Recupero medio: €847 per utente</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    <span>Verifica gratuita in 2 minuti</span>
                  </div>
                </div>

                <Button variant="hero" size="xl" className="w-full group" asChild>
                  <Link to="/auth?mode=signup&source=exit-intent">
                    Verifica i miei rimborsi
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </>
            ) : (
              // Negative answer - still try to convert
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mx-auto mb-6">
                  <span className="text-3xl">💡</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-center mb-2">
                  Nessun problema!
                </h3>
                <p className="text-center text-muted-foreground mb-6">
                  Ci sono altri modi per recuperare soldi: bollette, abbonamenti, assicurazioni...
                </p>

                <Button variant="hero" size="lg" className="w-full group" asChild>
                  <Link to="/#quiz">
                    Fai il quiz completo
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <button
                  onClick={handleClose}
                  className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
                >
                  No grazie, magari dopo
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
