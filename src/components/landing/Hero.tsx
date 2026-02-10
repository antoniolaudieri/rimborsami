import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles, Clock, Search, FileText, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[85svh] sm:min-h-[100svh] bg-gradient-hero-bg overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-32 sm:w-72 lg:w-96 h-32 sm:h-72 lg:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-10 w-24 sm:w-56 lg:w-72 h-24 sm:h-56 lg:h-72 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 pt-16 sm:pt-24 lg:pt-28 pb-6 sm:pb-12 lg:pb-16 px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full border border-primary/20 mb-3 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[11px] sm:text-sm font-medium text-secondary-foreground">
                  Analisi gratuita in 60 secondi
                </span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-[1.75rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 sm:mb-5"
            >
              Le aziende ti devono
              <br />
              <span className="text-gradient-hero">dei soldi.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 sm:mb-8"
            >
              <span className="sm:hidden">Scansiona le email e trova rimborsi automaticamente.</span>
              <span className="hidden sm:inline">Rimborsami scansiona le tue email per trovare rimborsi, compensazioni e class action a cui hai diritto. Automaticamente.</span>
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-4 sm:mb-8"
            >
              <Button variant="hero" size="lg" className="group w-full sm:w-auto text-[15px] py-6 sm:py-3" asChild>
                <Link to="/auth?mode=signup">
                  <Clock className="w-4 h-4 mr-2" />
                  Verifica gratis in 2 min
                  <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="hidden sm:flex w-full sm:w-auto" asChild>
                <a href="#come-funziona">Come funziona</a>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% GDPR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" />
                <span>Gratis per iniziare</span>
              </div>
            </motion.div>
          </div>

          {/* Right side - Phone mockup (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto w-[320px]">
              {/* Phone frame */}
              <div className="relative bg-foreground rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-background rounded-[2.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-card px-6 py-3 flex justify-between items-center text-xs">
                    <span className="font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-foreground/30 rounded-sm" />
                      <div className="w-4 h-2 bg-foreground/30 rounded-sm" />
                      <div className="w-6 h-2 bg-primary rounded-sm" />
                    </div>
                  </div>
                  
                  {/* App content mockup */}
                  <div className="p-4 space-y-4 min-h-[500px]">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Puoi recuperare fino a</p>
                      <p className="text-3xl font-display font-bold text-gradient-hero">€1.247</p>
                    </div>
                    
                    {[
                      { title: "Ryanair - Volo in ritardo", amount: "€400", category: "Voli", urgent: true },
                      { title: "TIM - Bolletta errata", amount: "€127", category: "Telecom", urgent: false },
                      { title: "Class Action Google", amount: "€720", category: "Tech", urgent: true },
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.15 }}
                        className="bg-card rounded-xl p-3 border border-border/50 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-muted-foreground">{item.category}</span>
                          {item.urgent && (
                            <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
                              Scade presto
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-sm mb-1">{item.title}</p>
                        <p className="text-primary font-bold">{item.amount}</p>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="pt-2"
                    >
                      <div className="bg-gradient-hero text-white text-center py-3 rounded-xl font-semibold text-sm">
                        Reclama tutto →
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-16 top-20 bg-card rounded-xl p-3 shadow-lg border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nuova opportunità!</p>
                    <p className="text-sm font-semibold">+€250</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats cards - real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 sm:mt-16 grid grid-cols-3 gap-2 sm:gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: Search, value: "66+", label: "Opportunità attive" },
            { icon: FileText, value: "6", label: "Categorie" },
            { icon: Zap, value: "2 min", label: "Per iniziare" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="bg-card rounded-xl sm:rounded-2xl p-2.5 sm:p-6 shadow-md border border-border/50 text-center"
            >
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1" />
              <div className="text-lg sm:text-3xl font-display font-bold text-gradient-hero mb-0.5">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-sm text-muted-foreground leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex items-center justify-center gap-4 mt-4 sm:hidden text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>GDPR</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>100% gratuito</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
