
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ExpertiseSection from '@/components/sections/ExpertiseSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';
import useScrollAnimation from '@/hooks/use-scroll-animation';

const Index = () => {
  // Initialize scroll animations
  useScrollAnimation();

  useEffect(() => {
    // Set page title
    document.title = 'TradeWizard | Custom MT5 & Binary Trading Robots';
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection />
        <ExpertiseSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
