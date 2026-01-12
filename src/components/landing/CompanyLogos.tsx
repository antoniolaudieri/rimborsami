import { motion } from "framer-motion";

const companies = [
  { name: "Ryanair", logo: "https://logo.clearbit.com/ryanair.com" },
  { name: "easyJet", logo: "https://logo.clearbit.com/easyjet.com" },
  { name: "Vueling", logo: "https://logo.clearbit.com/vueling.com" },
  { name: "Vodafone", logo: "https://logo.clearbit.com/vodafone.it" },
  { name: "TIM", logo: "https://logo.clearbit.com/tim.it" },
  { name: "WindTre", logo: "https://logo.clearbit.com/windtre.it" },
  { name: "Enel", logo: "https://logo.clearbit.com/enel.it" },
  { name: "Eni", logo: "https://logo.clearbit.com/eni.com" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.it" },
  { name: "Zalando", logo: "https://logo.clearbit.com/zalando.it" },
  { name: "Apple", logo: "https://logo.clearbit.com/apple.com" },
  { name: "Google", logo: "https://logo.clearbit.com/google.com" },
  { name: "Meta", logo: "https://logo.clearbit.com/meta.com" },
  { name: "Trenitalia", logo: "https://logo.clearbit.com/trenitalia.com" },
  { name: "Italo", logo: "https://logo.clearbit.com/italotreno.it" },
  { name: "UniCredit", logo: "https://logo.clearbit.com/unicredit.it" },
  { name: "Intesa Sanpaolo", logo: "https://logo.clearbit.com/intesasanpaolo.com" },
  { name: "Generali", logo: "https://logo.clearbit.com/generali.it" },
];

const CompanyLogos = () => {
  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-muted-foreground">
            Queste aziende potrebbero <span className="text-foreground">doverti soldi</span>
          </h2>
        </motion.div>

        {/* Infinite scroll carousel */}
        <div className="relative">
          <div className="flex gap-8 animate-scroll">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer min-w-[120px] h-[80px]"
              >
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="h-8 w-auto max-w-[80px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default CompanyLogos;
