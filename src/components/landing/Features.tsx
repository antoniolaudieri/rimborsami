import { motion } from "framer-motion";
import { 
  Mail, 
  FileSearch, 
  Bell, 
  FileText, 
  Shield, 
  Zap,
  Plane,
  Receipt,
  Scale
} from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Scanner Email Intelligente",
    description: "Colleghi la tua casella email e il nostro AI analizza anni di messaggi per trovare opportunità di rimborso nascoste.",
    highlight: "Analisi automatica",
  },
  {
    icon: FileSearch,
    title: "OCR Documenti & Scontrini",
    description: "Carica PDF, bollette, scontrini. L'AI estrae dati e identifica pagamenti duplicati, addebiti errati, garanzie dimenticate.",
    highlight: "Riconoscimento AI",
  },
  {
    icon: Bell,
    title: "Notifiche in Tempo Reale",
    description: "Ti avvisiamo quando scade un reclamo, quando si apre una nuova class action, quando c'è un rimborso che ti spetta.",
    highlight: "Mai più scadenze perse",
  },
  {
    icon: FileText,
    title: "Reclami Pre-Compilati",
    description: "Generiamo automaticamente lettere PEC, moduli e richieste. Tu devi solo inviare con un click.",
    highlight: "Zero burocrazia",
  },
  {
    icon: Shield,
    title: "100% GDPR Compliant",
    description: "I tuoi dati sono crittografati e protetti. Nessuna vendita a terzi. Tu controlli tutto dal tuo account.",
    highlight: "Sicurezza garantita",
  },
  {
    icon: Zap,
    title: "Database Aggiornato",
    description: "Monitoriamo costantemente normative italiane ed EU, class action, rimborsi attivi e nuove opportunità.",
    highlight: "Sempre aggiornato",
  },
];

const refundTypes = [
  { icon: Plane, label: "Voli in ritardo", amount: "Fino a €600" },
  { icon: Receipt, label: "Bollette errate", amount: "100% rimborso" },
  { icon: Scale, label: "Class action", amount: "Variabile" },
];

const Features = () => {
  return (
    <section className="py-24 bg-background" id="funzionalita">
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
            Come <span className="text-gradient-hero">funziona</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un sistema completo che lavora per te, 24 ore su 24, per trovare e recuperare 
            ogni euro che ti spetta.
          </p>
        </motion.div>

        {/* Refund types pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {refundTypes.map((type) => (
            <div
              key={type.label}
              className="flex items-center gap-3 px-5 py-3 bg-secondary rounded-full border border-primary/10"
            >
              <type.icon className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">{type.label}</div>
                <div className="text-xs text-accent font-semibold">{type.amount}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Highlight badge */}
              <div className="inline-flex px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary mb-4">
                {feature.highlight}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
