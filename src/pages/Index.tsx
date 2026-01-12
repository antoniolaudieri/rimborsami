import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import CompanyLogos from "@/components/landing/CompanyLogos";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import QuizSection from "@/components/landing/QuizSection";
import { SuccessWall } from "@/components/sharing/SuccessWall";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <CompanyLogos />
      <Features />
      <HowItWorks />
      <QuizSection />
      <SuccessWall />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
