import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import QuizSection from "@/components/landing/QuizSection";
import { SuccessWall } from "@/components/sharing/SuccessWall";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <QuizSection />
      <SuccessWall />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
