import { motion } from "framer-motion";
import OnboardingQuiz from "@/components/onboarding/OnboardingQuiz";

const QuizSection = () => {
  return (
    <section className="py-24 bg-background" id="quiz">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Quanto puoi <span className="text-gradient-gold">recuperare</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rispondi a 4 semplici domande e scopri subito una stima dei rimborsi 
            che potresti ottenere.
          </p>
        </motion.div>

        {/* Quiz component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <OnboardingQuiz />
        </motion.div>
      </div>
    </section>
  );
};

export default QuizSection;
