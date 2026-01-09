import { motion } from "framer-motion";
import { Mail, Shield, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    prodotto: ["Come funziona", "Prezzi", "FAQ", "Blog"],
    legale: ["Privacy Policy", "Termini di Servizio", "Cookie Policy", "GDPR"],
    supporto: ["Centro Assistenza", "Contattaci", "Partner", "Lavora con noi"],
  };

  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="font-display text-2xl font-bold mb-4">
              <span className="text-primary">Rimborsami</span>
            </div>
            <p className="text-primary-foreground/70 text-sm mb-4">
              La piattaforma italiana per recuperare rimborsi, compensazioni e indennizzi 
              che ti spettano.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <MapPin className="w-4 h-4" />
              <span>Milano, Italia</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70 mt-2">
              <Mail className="w-4 h-4" />
              <span>ciao@rimborsami.it</span>
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(links).map(([category, items], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index + 1) * 0.1 }}
            >
              <h4 className="font-semibold mb-4 capitalize">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="text-sm text-primary-foreground/50">
            © {currentYear} Rimborsami S.r.l. P.IVA 12345678901 - Tutti i diritti riservati.
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
            <Shield className="w-4 h-4 text-primary" />
            <span>100% GDPR Compliant</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
