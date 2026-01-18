import { useEffect } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import CompanyLogos from "@/components/landing/CompanyLogos";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import QuizSection from "@/components/landing/QuizSection";
// import { SuccessWall } from "@/components/sharing/SuccessWall"; // Temporaneamente nascosto
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import StickyCTA from "@/components/landing/StickyCTA";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";
import SocialProofToast from "@/components/landing/SocialProofToast";

const Index = () => {
  // Update document title and meta for SPA navigation
  useEffect(() => {
    document.title = "Rimborsami - Recupera Rimborsi, Compensazioni e Indennizzi | Italia";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Scopri automaticamente rimborsi e compensazioni che ti spettano: voli cancellati, bollette errate, class action. Oltre €54M recuperati per gli italiani. Inizia gratis.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article itemScope itemType="https://schema.org/WebPage">
          <Hero />
          <CompanyLogos />
          <section id="funzionalita" aria-label="Funzionalità">
            <Features />
          </section>
          <section id="come-funziona" aria-label="Come funziona">
            <HowItWorks />
          </section>
          <QuizSection />
          {/* <SuccessWall /> */} {/* Temporaneamente nascosto */}
          <section id="recensioni" aria-label="Recensioni">
            <Testimonials />
          </section>
          <section id="prezzi" aria-label="Prezzi">
            <Pricing />
          </section>
          <section id="faq" aria-label="Domande frequenti">
            <FAQ />
          </section>
        </article>
      </main>
      <Footer />
      
      {/* Conversion optimization components */}
      <StickyCTA />
      <ExitIntentPopup />
      <SocialProofToast />
    </div>
  );
};

export default Index;
