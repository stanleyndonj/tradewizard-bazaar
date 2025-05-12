
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ExpertiseSection from '@/components/sections/ExpertiseSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ContactSection from '@/components/sections/ContactSection';

const Home = () => {
  React.useEffect(() => {
    // Set page title
    document.title = 'TradeWizard | Advanced Trading Robots';
    
    // Apply parallax effect to sections
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const parallaxLayers = document.querySelectorAll('.parallax-layer');
      
      parallaxLayers.forEach((layer: Element) => {
        const htmlLayer = layer as HTMLElement;
        const speed = htmlLayer.classList.contains('parallax-layer-back') ? 0.5 : 
                     htmlLayer.classList.contains('parallax-layer-front') ? -0.2 : 0;
                     
        if (speed !== 0) {
          const yPos = scrollY * speed;
          htmlLayer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col parallax-container">
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
    </div>
  );
};

export default Home;
