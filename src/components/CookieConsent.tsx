import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  accepted: boolean;
};

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  accepted: false,
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem("cookie_preferences");
    if (stored) {
      const parsed = JSON.parse(stored) as CookiePreferences;
      if (parsed.accepted) {
        setShowBanner(false);
        return;
      }
    }
    // Delay showing banner slightly for better UX
    const timer = setTimeout(() => setShowBanner(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie_preferences", JSON.stringify({ ...prefs, accepted: true }));
    setShowBanner(false);
    
    // Here you would initialize/disable analytics based on preferences
    if (prefs.analytics) {
      console.log("Analytics cookies enabled");
      // Initialize Google Analytics or other analytics here
    } else {
      console.log("Analytics cookies disabled");
      // Disable/remove analytics cookies here
    }
  };

  const acceptAll = () => {
    savePreferences({ necessary: true, analytics: true, accepted: true });
  };

  const rejectAnalytics = () => {
    savePreferences({ necessary: true, analytics: false, accepted: true });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card/95 backdrop-blur-lg shadow-2xl">
            <div className="p-4 md:p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    Utilizziamo i cookie 🍪
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Utilizziamo cookie tecnici necessari per il funzionamento del sito e cookie analitici 
                    per comprendere come utilizzi il nostro servizio. Puoi scegliere quali cookie accettare.
                  </p>
                </div>
              </div>

              {/* Expandable Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-4 space-y-3 rounded-lg bg-muted/50 p-4">
                      {/* Necessary Cookies */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Cookie Tecnici</p>
                          <p className="text-xs text-muted-foreground">
                            Necessari per il funzionamento del sito. Non possono essere disattivati.
                          </p>
                        </div>
                        <div className="flex h-6 w-11 items-center rounded-full bg-primary px-1">
                          <div className="h-4 w-4 translate-x-5 rounded-full bg-white shadow" />
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Cookie Analitici</p>
                          <p className="text-xs text-muted-foreground">
                            Ci aiutano a capire come utilizzi il sito per migliorare l'esperienza.
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                          className={`flex h-6 w-11 items-center rounded-full px-1 transition-colors ${
                            preferences.analytics ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              preferences.analytics ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Link 
                    to="/cookie" 
                    className="underline hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </Link>
                  <span>•</span>
                  <Link 
                    to="/privacy" 
                    className="underline hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-muted-foreground"
                  >
                    {showDetails ? "Nascondi dettagli" : "Personalizza"}
                  </Button>
                  
                  {showDetails ? (
                    <Button
                      size="sm"
                      onClick={saveCustom}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Salva preferenze
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={rejectAnalytics}
                      >
                        Solo necessari
                      </Button>
                      <Button
                        size="sm"
                        onClick={acceptAll}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Accetta tutti
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to check cookie preferences
export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cookie_preferences");
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  return preferences;
};
