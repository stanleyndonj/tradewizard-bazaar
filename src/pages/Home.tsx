
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ExpertiseSection from '@/components/sections/ExpertiseSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ContactSection from '@/components/sections/ContactSection';
import ParallaxContainer from '@/components/ui/parallax-container';

const Home = () => {
  React.useEffect(() => {
    // Set page title
    document.title = 'TradeWizard | Advanced Trading Robots';
  }, []);

  return (
    <ParallaxContainer className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      
      <main className="flex-grow pt-16">
        <HeroSection />
        <ExpertiseSection />
        <ServicesSection />
        <ContactSection />
      </main>
      
      <Footer />
    </ParallaxContainer>
  );
};

export default Home;
