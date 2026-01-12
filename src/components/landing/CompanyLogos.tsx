import { motion } from "framer-motion";

const companies = [
  { name: "Ryanair", logo: "✈️" },
  { name: "easyJet", logo: "🛫" },
  { name: "Alitalia", logo: "🇮🇹" },
  { name: "Vodafone", logo: "📱" },
  { name: "TIM", logo: "📞" },
  { name: "WindTre", logo: "📡" },
  { name: "Enel", logo: "⚡" },
  { name: "Eni", logo: "🔥" },
  { name: "Amazon", logo: "📦" },
  { name: "Zalando", logo: "👕" },
  { name: "Apple", logo: "🍎" },
  { name: "Google", logo: "🔍" },
  { name: "Meta", logo: "👤" },
  { name: "Trenitalia", logo: "🚆" },
  { name: "Italo", logo: "🚅" },
  { name: "UniCredit", logo: "🏦" },
  { name: "Intesa SP", logo: "💳" },
  { name: "Generali", logo: "🛡️" },
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
                className="flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer min-w-[100px]"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {company.logo}
                </span>
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
