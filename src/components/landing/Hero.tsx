import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles, TrendingUp, Star } from "lucide-react";
import AppRating from "./AppRating";

const Hero = () => {
  return (
    <section className="relative min-h-[100svh] bg-gradient-hero-bg overflow-hidden">
      {/* Background decorations - smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-10 w-36 sm:w-56 lg:w-72 h-36 sm:h-56 lg:h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-12 lg:pb-16 px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary rounded-full border border-primary/20 mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-secondary-foreground">
                  Oltre €500M recuperati per gli italiani
                </span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-5"
            >
              Le aziende ti devono
              <br />
              <span className="text-gradient-hero">dei soldi.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 px-2 sm:px-0"
            >
              Rimborsami scansiona le tue email per trovare rimborsi, compensazioni e 
              class action a cui hai diritto. Automaticamente.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8 px-4 sm:px-0"
            >
              <Button variant="hero" size="lg" className="group w-full sm:w-auto text-sm sm:text-base" asChild>
                <Link to="/auth?mode=signup">
                  Scopri quanto puoi recuperare
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base" asChild>
                <a href="#come-funziona">Come funziona</a>
              </Button>
            </motion.div>

            {/* App rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center lg:justify-start"
            >
              <AppRating rating={4.8} reviews="2.500+" />
            </motion.div>
          </div>

          {/* Right side - Phone mockup */}
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
                    {/* Header */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Puoi recuperare fino a</p>
                      <p className="text-3xl font-display font-bold text-gradient-hero">€1.247</p>
                    </div>
                    
                    {/* Opportunity cards */}
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

                    {/* CTA button */}
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

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute -right-12 bottom-32 bg-card rounded-xl p-3 shadow-lg border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-xs font-medium">4.8</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Trust indicators - mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-12 lg:hidden"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>€847 recupero medio</span>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto px-2 sm:px-0"
        >
          {[
            { value: "127K+", valueFull: "127.000+", label: "Utenti attivi" },
            { value: "€54M", valueFull: "€54M", label: "Recuperati nel 2024" },
            { value: "4.8★", valueFull: "4.8★", label: "Rating App Store" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-md border border-border/50 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-xl sm:text-3xl font-display font-bold text-gradient-hero mb-0.5 sm:mb-1">
                <span className="sm:hidden">{stat.value}</span>
                <span className="hidden sm:inline">{stat.valueFull}</span>
              </div>
              <div className="text-[10px] sm:text-sm text-muted-foreground leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
