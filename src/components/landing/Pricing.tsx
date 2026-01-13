import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
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
    price: "€79",
    period: "all'anno",
    description: "Risparmia 33% con la sottoscrizione annuale.",
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
    savings: "Risparmi €41",
    href: "/auth?mode=signup&plan=annual",
  },
];

const Pricing = () => {
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

        {/* Pricing cards - stacked on mobile, horizontal scroll on tablet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${
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

              {/* Price */}
              <div className="mb-3 sm:mb-4">
                <span className="font-display text-3xl sm:text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1 text-sm sm:text-base">/{plan.period}</span>
              </div>

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
