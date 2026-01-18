import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Shield, Sparkles, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Countdown timer hook
const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 32 });

  useEffect(() => {
    // Get or set initial countdown end time
    const stored = localStorage.getItem("pricingCountdownEnd");
    let endTime: number;
    
    if (stored) {
      endTime = parseInt(stored);
    } else {
      // Set countdown to 3 days from now
      endTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem("pricingCountdownEnd", endTime.toString());
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        // Reset countdown
        const newEndTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
        localStorage.setItem("pricingCountdownEnd", newEndTime.toString());
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
};

const plans: {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  billingNote?: string;
  description: string;
  features: string[];
  cta: string;
  variant: "outline" | "hero" | "gold";
  popular: boolean;
  badge?: string;
  savings?: string;
  href: string;
}[] = [
  {
    name: "Free",
    price: "€0",
    period: "per sempre",
    description: "Scopri quanto puoi recuperare, senza impegno.",
    features: [
      "Analisi base delle opportunità",
      "Vedi numero di rimborsi trovati",
      "Range stimato del recupero",
      "Supporto via email",
    ],
    cta: "Inizia gratis",
    variant: "outline" as const,
    popular: false,
    href: "/auth?mode=signup&plan=free",
  },
  {
    name: "Premium",
    price: "€9.99",
    period: "al mese",
    description: "Massimizza il tuo recupero con strumenti avanzati.",
    features: [
      "Dettagli completi opportunità",
      "Generatore email/PEC automatico",
      "Importi precisi per pratica",
      "Dashboard con stato pratiche",
      "Notifiche e reminder",
      "Supporto prioritario",
    ],
    cta: "Prova 7 giorni gratis",
    variant: "hero" as const,
    popular: true,
    badge: "Più popolare",
    href: "/auth?mode=signup&plan=monthly",
  },
  {
    name: "Pro",
    price: "€6.00",
    originalPrice: "€9.99",
    period: "al mese",
    billingNote: "Fatturato annualmente (€71.99/anno)",
    description: "Il miglior valore. Risparmia oltre il 40%.",
    features: [
      "Tutto del Premium",
      "Consulenza legale inclusa",
      "Gestione pratiche complesse",
      "Report personalizzati",
      "Account manager dedicato",
    ],
    cta: "Scegli Pro",
    variant: "gold" as const,
    popular: false,
    savings: "Risparmi €48",
    href: "/auth?mode=signup&plan=annual",
  },
];

const Pricing = () => {
  const countdown = useCountdown();

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-hero-bg" id="prezzi">
      <div className="container px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3 sm:mb-4"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Prezzi <span className="text-gradient-hero">trasparenti</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
            Paghi solo se funziona. Con la nostra garanzia, recuperi almeno 
            quanto speso nel primo anno o ti rimborsiamo.
          </p>
        </motion.div>

        {/* Countdown urgency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center mb-8 sm:mb-10 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-destructive/10 rounded-full border border-destructive/30">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            <span className="font-semibold text-destructive text-sm sm:text-base">
              Offerta scade tra: {countdown.days}g {countdown.hours}h {countdown.minutes}m
            </span>
          </div>
        </motion.div>

        {/* Guarantee badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8 sm:mb-10 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-accent/10 rounded-full border border-accent/30">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            <span className="font-semibold text-accent text-sm sm:text-base">
              Garanzia: recuperi di più o è gratis
            </span>
          </div>
        </motion.div>

        {/* Pricing cards - horizontal scroll on mobile */}
        <div className="flex overflow-x-auto gap-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6 max-w-5xl sm:mx-auto scrollbar-hide pb-2 sm:pb-0">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`flex-shrink-0 w-[280px] sm:w-auto relative bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${
                plan.popular 
                  ? "border-primary shadow-glow" 
                  : "border-border/50"
              } hover:shadow-lg transition-all duration-300`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-hero rounded-full text-[10px] sm:text-xs font-semibold text-primary-foreground">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Savings badge */}
              {plan.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-gold rounded-full text-[10px] sm:text-xs font-semibold text-accent-foreground">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {plan.savings}
                  </div>
                </div>
              )}

              {/* Plan name */}
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 mt-2">
                {plan.name}
              </h3>

              {/* Price with anchor */}
              <div className="mb-1 sm:mb-2">
                {plan.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through mr-2">
                    {plan.originalPrice}
                  </span>
                )}
                <span className="font-display text-3xl sm:text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1 text-sm sm:text-base">/{plan.period}</span>
              </div>

              {/* Billing note */}
              {plan.billingNote && (
                <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
                  {plan.billingNote}
                </p>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant={plan.variant} size="lg" className="w-full" asChild>
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
