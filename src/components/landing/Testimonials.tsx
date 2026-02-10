import { motion } from "framer-motion";
import { Shield, Search, FileText, Clock, Plane, ShoppingBag, Zap, CreditCard, Building, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const categories = [
  { icon: Plane, label: "Voli", description: "Ritardi, cancellazioni, overbooking", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { icon: ShoppingBag, label: "E-commerce", description: "Resi, garanzie, prodotti difettosi", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { icon: CreditCard, label: "Banche", description: "Commissioni, phishing, addebiti", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { icon: Zap, label: "Energia", description: "Bollette errate, conguagli", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { icon: Building, label: "Telecom", description: "Servizi non richiesti, disdette", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { icon: Scale, label: "Class Action", description: "Azioni collettive attive", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
];

const Testimonials = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-background overflow-hidden" id="recensioni">
      <div className="container px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            Opportunità di <span className="text-gradient-gold">rimborso</span>
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Scopri in quali categorie potresti avere diritto a rimborsi e compensazioni.
          </p>
        </motion.div>

        {/* Stats Bar - real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex overflow-x-auto gap-3 sm:grid sm:grid-cols-3 sm:gap-4 max-w-3xl mx-auto mb-8 sm:mb-12 -mx-4 px-4 sm:mx-auto sm:px-0 scrollbar-hide pb-2 sm:pb-0"
        >
          <div className="flex-shrink-0 text-center p-3 sm:p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 min-w-[130px] sm:min-w-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-accent mx-auto mb-1 sm:mb-2" />
            <div className="font-display text-base sm:text-2xl font-bold text-foreground">66+</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Opportunità attive</div>
          </div>
          <div className="flex-shrink-0 text-center p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 min-w-[130px] sm:min-w-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 sm:mb-2" />
            <div className="font-display text-base sm:text-2xl font-bold text-foreground">70+</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Guide pubblicate</div>
          </div>
          <div className="flex-shrink-0 text-center p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 min-w-[130px] sm:min-w-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto mb-1 sm:mb-2" />
            <div className="font-display text-base sm:text-2xl font-bold text-foreground">2 min</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Per iniziare</div>
          </div>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 ${cat.color}`}>
                <cat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1">{cat.label}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{cat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 sm:mt-12 text-center"
        >
          <Button variant="hero" size="lg" className="group" asChild>
            <Link to="/auth?mode=signup">
              Scopri le tue opportunità
              <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Gratuito • Nessuna carta richiesta • GDPR compliant
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
