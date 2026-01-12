import { motion } from "framer-motion";
import { Plane, Phone, Zap, ShoppingBag, Train, Building2, Shield, Package, Smartphone, Search, Users, Fuel, Wifi } from "lucide-react";

const companies = [
  { name: "Ryanair", icon: Plane, color: "#073590" },
  { name: "easyJet", icon: Plane, color: "#FF6600" },
  { name: "Vueling", icon: Plane, color: "#FFCC00" },
  { name: "Vodafone", icon: Phone, color: "#E60000" },
  { name: "TIM", icon: Smartphone, color: "#004B93" },
  { name: "WindTre", icon: Wifi, color: "#FF6600" },
  { name: "Enel", icon: Zap, color: "#A31AFF" },
  { name: "Eni", icon: Fuel, color: "#FBB900" },
  { name: "Amazon", icon: Package, color: "#FF9900" },
  { name: "Zalando", icon: ShoppingBag, color: "#FF6900" },
  { name: "Apple", icon: Smartphone, color: "#555555" },
  { name: "Google", icon: Search, color: "#4285F4" },
  { name: "Meta", icon: Users, color: "#0668E1" },
  { name: "Trenitalia", icon: Train, color: "#CC0000" },
  { name: "Italo", icon: Train, color: "#8B0000" },
  { name: "UniCredit", icon: Building2, color: "#E30613" },
  { name: "Intesa Sanpaolo", icon: Building2, color: "#006747" },
  { name: "Generali", icon: Shield, color: "#C8102E" },
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
          <div className="flex gap-6 animate-scroll">
            {[...companies, ...companies].map((company, index) => {
              const IconComponent = company.icon;
              return (
                <div
                  key={`${company.name}-${index}`}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-3 px-6 py-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer min-w-[130px] h-[100px]"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${company.color}15` }}
                  >
                    <IconComponent 
                      size={22} 
                      style={{ color: company.color }}
                      className="transition-all"
                    />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                    {company.name}
                  </span>
                </div>
              );
            })}
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
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default CompanyLogos;
