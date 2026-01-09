import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Rispondi a 5 domande",
    description: "Un quiz veloce per capire la tua situazione: viaggi, abbonamenti, bollette, acquisti recenti.",
    checks: ["2 minuti", "Nessun dato sensibile", "Stima immediata"],
  },
  {
    number: "02",
    title: "Collega email e documenti",
    description: "Il nostro scanner AI analizza le tue email e i documenti caricati per trovare opportunità nascoste.",
    checks: ["Connessione sicura", "Solo lettura", "GDPR compliant"],
  },
  {
    number: "03",
    title: "Ricevi i reclami pronti",
    description: "Per ogni rimborso trovato, generiamo la documentazione completa: lettere, moduli, istruzioni.",
    checks: ["Documenti pre-compilati", "Guide passo-passo", "Supporto legale"],
  },
  {
    number: "04",
    title: "Incassa i tuoi soldi",
    description: "Invia i reclami con un click e monitora lo stato di ogni pratica dalla tua dashboard.",
    checks: ["Tracking in tempo reale", "Notifiche su progressi", "Zero pensieri"],
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-hero-bg" id="come-funziona">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            4 passi per <span className="text-gradient-hero">recuperare</span> i tuoi soldi
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dalla scoperta all'incasso: un processo automatizzato che ti fa risparmiare 
            ore di burocrazia.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex gap-6 items-start"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-glow">
                <span className="font-display text-2xl font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 bg-card rounded-2xl p-6 border border-border/50 hover:shadow-md transition-shadow">
                <h3 className="font-display text-xl font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {step.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {step.checks.map((check) => (
                    <div
                      key={check}
                      className="flex items-center gap-1.5 text-sm text-primary"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-12 bg-gradient-to-b from-primary/30 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="hero" size="xl" className="group">
            Inizia ora – è gratis
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
