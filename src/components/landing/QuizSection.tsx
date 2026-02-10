import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

const QuizSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden" id="quiz">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Quanto puoi <span className="text-gradient-gold">recuperare</span>?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
            Registrati gratuitamente e scopri subito le opportunità di rimborso 
            disponibili per te.
          </p>
          <Button variant="hero" size="lg" className="group" asChild>
            <Link to="/auth?mode=signup">
              <Clock className="w-4 h-4 mr-2" />
              Scopri gratis in 2 minuti
              <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default QuizSection;
