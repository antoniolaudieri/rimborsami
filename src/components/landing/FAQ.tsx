import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Come faccio a sapere se ho diritto a un rimborso?",
    answer:
      "Rispondi al nostro quiz gratuito di 2 minuti e collega le tue email. Il nostro sistema AI analizza automaticamente la tua situazione e trova tutte le opportunità di rimborso a cui hai diritto, come voli in ritardo, bollette errate, class action attive e molto altro.",
  },
  {
    question: "Cos'è una class action e come funziona?",
    answer:
      "Una class action è un'azione legale collettiva che permette a molti consumatori di unirsi contro un'azienda. In Italia sono sempre più comuni: banche, compagnie telefoniche e tech hanno pagato milioni in risarcimenti. Ti basta aderire online, senza avvocato.",
  },
  {
    question: "Quanto tempo ci vuole per ricevere il rimborso?",
    answer:
      "Dipende dal tipo di rimborso: i reclami diretti (voli, bollette) vengono risolti in 2-8 settimane. Le class action richiedono tempi più lunghi, tipicamente 6-18 mesi, ma gli importi sono spesso significativi.",
  },
  {
    question: "Devo fornire prove o documenti?",
    answer:
      "Nella maggior parte dei casi no! Il nostro sistema estrae automaticamente le prove dalle tue email (conferme di volo, fatture, ricevute). Per alcune pratiche potrebbe essere richiesto un documento d'identità o IBAN per il pagamento.",
  },
  {
    question: "Ci sono costi nascosti?",
    answer:
      "Zero costi nascosti. Con il piano Free puoi scoprire quante opportunità hai. Con Premium sblocchi i dettagli e gli strumenti per reclamare. Non prendiamo commissioni sui tuoi rimborsi: quello che recuperi è 100% tuo.",
  },
  {
    question: "I miei dati sono al sicuro?",
    answer:
      "Assolutamente sì. Siamo GDPR compliant al 100%. Le tue email sono analizzate in modalità solo lettura, i dati sono crittografati e non vengono mai condivisi con terze parti. Puoi cancellare tutto in qualsiasi momento.",
  },
  {
    question: "Cosa succede se il reclamo viene rifiutato?",
    answer:
      "Ti guidiamo nel ricorso o nell'escalation. Per i casi più complessi, abbiamo partnership con studi legali specializzati che possono assisterti, spesso con formula 'no win, no fee'.",
  },
  {
    question: "Come funziona la garanzia soddisfatti o rimborsati?",
    answer:
      "Se entro 30 giorni dall'iscrizione Premium non trovi almeno un'opportunità di rimborso valida, ti restituiamo l'abbonamento. Nessuna domanda, nessun problema.",
  },
];

const FAQ = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-hero-bg overflow-hidden" id="faq">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Domande <span className="text-gradient-hero">frequenti</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Tutto quello che devi sapere su come recuperare i tuoi soldi
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border/50 px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
