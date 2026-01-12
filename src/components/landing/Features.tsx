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
    <section className="py-12 sm:py-16 lg:py-24 bg-background" id="funzionalita">
      <div className="container px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Come <span className="text-gradient-hero">funziona</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
            Un sistema completo che lavora per te, 24 ore su 24, per trovare e recuperare 
            ogni euro che ti spetta.
          </p>
        </motion.div>

        {/* Refund types pills - scrollable on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex overflow-x-auto pb-2 sm:flex-wrap sm:justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {refundTypes.map((type) => (
            <div
              key={type.label}
              className="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-3 bg-secondary rounded-full border border-primary/10"
            >
              <type.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <div className="text-left whitespace-nowrap">
                <div className="text-xs sm:text-sm font-medium text-foreground">{type.label}</div>
                <div className="text-[10px] sm:text-xs text-accent font-semibold">{type.amount}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Highlight badge */}
              <div className="inline-flex px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 rounded-full text-[10px] sm:text-xs font-medium text-primary mb-3 sm:mb-4">
                {feature.highlight}
              </div>

              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-hero rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
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
