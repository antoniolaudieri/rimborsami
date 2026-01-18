import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approximately 400px on mobile)
      const scrolled = window.scrollY > 400;
      setIsVisible(scrolled && !isDismissed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
        >
          <div className="bg-card/98 backdrop-blur-xl border border-border/80 rounded-2xl p-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Scopri i tuoi rimborsi</p>
                <p className="text-[11px] text-muted-foreground">Verifica gratuita • 2 min</p>
              </div>
              <Button variant="hero" size="sm" className="shrink-0 text-sm px-4 py-5" asChild>
                <Link to="/auth?mode=signup">
                  Inizia ora
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <button 
                onClick={() => setIsDismissed(true)}
                className="p-1.5 hover:bg-muted rounded-full transition-colors shrink-0"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Desktop version - top bar
export const StickyTopBar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 hidden md:block"
        >
          <div className="bg-primary text-primary-foreground py-2">
            <div className="container flex items-center justify-center gap-4">
              <span className="text-sm font-medium">
                💰 Scopri quanto puoi recuperare — Verifica gratuita in 2 minuti
              </span>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link to="/auth?mode=signup">
                  Inizia ora
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTA;
