import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Shield, MapPin } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
            <Logo size="lg" textClassName="text-primary" className="mb-4" />
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
              <a href="mailto:ciao@rimborsami.it" className="hover:text-primary transition-colors">
                ciao@rimborsami.it
              </a>
            </div>
          </motion.div>

          {/* Prodotto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4">Prodotto</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Come funziona
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Prezzi
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Funzionalità
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Testimonianze
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Legale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4">Legale</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Termini di Servizio
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy#cookie"
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Supporto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h4 className="font-semibold mb-4">Supporto</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:supporto@rimborsami.it"
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Centro Assistenza
                </a>
              </li>
              <li>
                <a
                  href="mailto:ciao@rimborsami.it"
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Contattaci
                </a>
              </li>
            </ul>
          </motion.div>
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
