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
      // Show after scrolling past hero section (approximately 600px)
      const scrolled = window.scrollY > 600;
      setIsVisible(scrolled && !isDismissed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
        >
          <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">Scopri i tuoi rimborsi</p>
                <p className="text-xs text-muted-foreground">Verifica gratuita in 2 min</p>
              </div>
              <Button variant="hero" size="sm" className="shrink-0" asChild>
                <Link to="/auth?mode=signup">
                  Inizia
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <button 
                onClick={() => setIsDismissed(true)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
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

    window.addEventListener("scroll", handleScroll);
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
