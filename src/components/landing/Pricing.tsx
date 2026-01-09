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
      "Fino a 3 reclami / anno",
      "Database rimborsi base",
      "Supporto via email",
    ],
    cta: "Inizia gratis",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium",
    price: "€9.99",
    period: "al mese",
    description: "Massimizza il tuo recupero con strumenti avanzati.",
    features: [
      "Scanner email illimitato",
      "Reclami illimitati",
      "Accesso anticipato class action",
      "Generatore documenti AI",
      "Notifiche prioritarie",
      "Supporto prioritario",
    ],
    cta: "Prova 7 giorni gratis",
    variant: "hero" as const,
    popular: true,
    badge: "Più popolare",
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
  },
];

const Pricing = () => {
  return (
    <section className="py-24 bg-gradient-hero-bg" id="prezzi">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Prezzi <span className="text-gradient-hero">trasparenti</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-accent/10 rounded-full border border-accent/30">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-semibold text-accent">
              Garanzia: recuperi di più o è gratis
            </span>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl p-6 border ${
                plan.popular 
                  ? "border-primary shadow-glow" 
                  : "border-border/50"
              } hover:shadow-lg transition-all duration-300`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-hero rounded-full text-xs font-semibold text-primary-foreground">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Savings badge */}
              {plan.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-gold rounded-full text-xs font-semibold text-accent-foreground">
                    <Zap className="w-3 h-3" />
                    {plan.savings}
                  </div>
                </div>
              )}

              {/* Plan name */}
              <h3 className="font-display text-xl font-semibold mb-2 mt-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.period}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant={plan.variant} size="lg" className="w-full">
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
