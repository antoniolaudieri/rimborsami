import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marco B.",
    location: "Milano",
    amount: "€1.240",
    text: "Avevo completamente dimenticato un volo cancellato di 2 anni fa. Rimborsami l'ha trovato e in 3 settimane ho ricevuto €600!",
    avatar: "M",
  },
  {
    name: "Giulia R.",
    location: "Roma",
    amount: "€847",
    text: "La bolletta del gas era sbagliata da mesi. L'app ha generato il reclamo perfetto e ho recuperato tutto.",
    avatar: "G",
  },
  {
    name: "Alessandro T.",
    location: "Napoli",
    amount: "€2.100",
    text: "Grazie alla class action contro la mia banca che non sapevo esistesse, ho recuperato più di €2.000. Incredibile.",
    avatar: "A",
  },
  {
    name: "Francesca M.",
    location: "Torino",
    amount: "€480",
    text: "Abbonamento palestra disdetto ma continuavano ad addebitare. Con Rimborsami ho risolto in 5 minuti.",
    avatar: "F",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background" id="recensioni">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-accent text-accent" />
            ))}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Storie di <span className="text-gradient-gold">successo</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Migliaia di italiani hanno già recuperato ciò che gli spettava. 
            Ecco alcune delle loro storie.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />

              {/* Amount recovered */}
              <div className="inline-flex px-3 py-1 bg-accent/10 rounded-full text-sm font-bold text-accent mb-4">
                Recuperati: {testimonial.amount}
              </div>

              {/* Quote text */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
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
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-secondary rounded-2xl">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-foreground">4.8/5</div>
              <div className="text-xs text-muted-foreground">App Store</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-foreground">98%</div>
              <div className="text-xs text-muted-foreground">Soddisfatti</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-foreground">127K+</div>
              <div className="text-xs text-muted-foreground">Utenti</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
