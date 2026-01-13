import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Shield, MapPin } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-foreground text-primary-foreground py-12 sm:py-16 overflow-hidden">
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 mb-10 sm:mb-12">
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
          <div className="flex items-start gap-2 text-xs sm:text-sm text-primary-foreground/70">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">Via Alessandro Manzoni, 18100 Imperia (IM)</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/70 mt-2">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <a href="mailto:info@rimborsami.app" className="hover:text-primary transition-colors break-all">
                info@rimborsami.app
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
                  to="/cookie"
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Politica di Rimborso
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
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  Centro Assistenza
                </button>
              </li>
              <li>
                <a
                  href="mailto:info@rimborsami.app"
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
          <div className="text-xs sm:text-sm text-primary-foreground/50 text-center sm:text-left">
            © {currentYear} Riccardo Casagrande - P.IVA 01538960087
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
