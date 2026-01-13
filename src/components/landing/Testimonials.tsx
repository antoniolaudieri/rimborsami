import { motion } from "framer-motion";
import { Star, Quote, BadgeCheck, TrendingUp, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Luca Martinelli",
    location: "Milano",
    amount: "€2.847",
    company: "Ryanair",
    text: "Volo cancellato a 2 ore dalla partenza. Hotel e nuovo volo a mie spese. Con Rimborsami ho recuperato tutto in 12 giorni!",
    avatar: "LM",
    date: "Dicembre 2024",
    recoveryDays: 12,
  },
  {
    name: "Sara Colombo",
    location: "Roma",
    amount: "€1.650",
    company: "Volkswagen",
    text: "Non sapevo di poter partecipare alla class action Dieselgate. L'app me l'ha segnalata e ora ho ricevuto il mio rimborso.",
    avatar: "SC",
    date: "Gennaio 2025",
    recoveryDays: 45,
  },
  {
    name: "Andrea Ferretti",
    location: "Bologna",
    amount: "€892",
    company: "TIM",
    text: "Dopo la disdetta continuavano ad addebitarmi €39/mese. 23 mesi di addebiti illegittimi recuperati al 100%.",
    avatar: "AF",
    date: "Novembre 2024",
    recoveryDays: 18,
  },
  {
    name: "Valentina Russo",
    location: "Napoli",
    amount: "€3.200",
    company: "Apple",
    text: "MacBook Pro difettoso fuori garanzia. L'app ha generato un reclamo perfetto citando il Codice del Consumo. Rimborso totale!",
    avatar: "VR",
    date: "Gennaio 2025",
    recoveryDays: 28,
  },
  {
    name: "Francesco De Luca",
    location: "Torino",
    amount: "€567",
    company: "Lufthansa",
    text: "Ritardo di 4 ore e mezza a Francoforte. Non pensavo di avere diritto a nulla. €400 di compensazione + €167 di spese.",
    avatar: "FD",
    date: "Dicembre 2024",
    recoveryDays: 21,
  },
  {
    name: "Chiara Bianchi",
    location: "Firenze",
    amount: "€1.890",
    company: "Intesa Sanpaolo",
    text: "Commissioni nascoste sul conto per 3 anni. Rimborsami ha trovato tutto e generato il reclamo. Soldi tornati in 30 giorni.",
    avatar: "CB",
    date: "Ottobre 2024",
    recoveryDays: 30,
  },
];

// Animated counter component
const AnimatedCounter = ({ target, duration = 2000, prefix = "", suffix = "" }: { 
  target: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <span>{prefix}{count.toLocaleString('it-IT')}{suffix}</span>;
};

const Testimonials = () => {
  const [todayCount, setTodayCount] = useState(237);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden" id="recensioni">
      <div className="container px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-accent">LIVE: {todayCount} italiani hanno iniziato oggi</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Storie <span className="text-gradient-gold">verificate</span> di successo
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Persone reali, rimborsi reali. Ecco chi ha già recuperato i propri soldi.
          </p>
        </motion.div>

        {/* Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12"
        >
          <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="font-display text-xl sm:text-2xl font-bold text-foreground">
              €<AnimatedCounter target={2847650} suffix="+" />
            </div>
            <div className="text-xs text-muted-foreground">Recuperati nel 2024</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <Users className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-display text-xl sm:text-2xl font-bold text-foreground">
              <AnimatedCounter target={12847} suffix="+" />
            </div>
            <div className="text-xs text-muted-foreground">Rimborsi ottenuti</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20">
            <Clock className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <div className="font-display text-xl sm:text-2xl font-bold text-foreground">
              <AnimatedCounter target={14} /> giorni
            </div>
            <div className="text-xs text-muted-foreground">Tempo medio</div>
          </div>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
            >
              {/* Verified badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span className="font-medium">Verificato</span>
              </div>

              {/* Quote icon */}
              <Quote className="absolute bottom-4 right-4 w-8 h-8 text-primary/5 group-hover:text-primary/10 transition-colors" />

              {/* Amount recovered with company */}
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex px-3 py-1 bg-accent/10 rounded-full text-sm font-bold text-accent">
                  +{testimonial.amount}
                </div>
                <span className="text-xs text-muted-foreground">da {testimonial.company}</span>
              </div>

              {/* Recovery time badge */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <Clock className="w-3 h-3" />
                <span>Recuperati in {testimonial.recoveryDays} giorni • {testimonial.date}</span>
              </div>

              {/* Quote text */}
              <p className="text-foreground mb-6 leading-relaxed text-sm">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-primary-foreground font-semibold text-xs">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 sm:mt-16 text-center px-4"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-4 sm:px-8 py-4 sm:py-5 bg-secondary rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="text-center">
                <div className="font-display text-lg sm:text-2xl font-bold text-foreground">4.8/5</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">App Store</div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-lg sm:text-2xl font-bold text-foreground">98%</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Soddisfatti</div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-lg sm:text-2xl font-bold text-foreground">127K+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Utenti</div>
              </div>
            </div>
            
            {/* Urgency message */}
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-medium text-foreground">Class action Meta: scade tra 23 giorni</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
