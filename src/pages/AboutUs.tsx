
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { Mail, Phone, Github, Linkedin } from 'lucide-react';

const AboutUs = () => {
  useEffect(() => {
    // Set page title
    document.title = 'About Us | TradeWizard';
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-20">
          <SectionHeader
            subtitle="About Us"
            title="Meet the Developer"
            description="The mind behind TradeWizard's trading solutions"
            centered
          />
          
          <div className="max-w-4xl mx-auto mt-12">
            <div className="glass-card rounded-2xl p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1">
                  <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-trading-blue/20">
                    {/* Placeholder avatar - in a real app you'd use an actual photo */}
                    <div className="w-full h-full bg-gradient-to-br from-trading-blue/20 to-trading-blue/40 flex items-center justify-center text-5xl font-bold text-trading-blue">
                      SN
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold mb-2">Stanley Paul Ndonj</h3>
                  <p className="text-trading-blue font-medium mb-4">Software Developer & Trader</p>
                  
                  <p className="text-muted-foreground mb-6">
                    A passionate software developer and experienced trader specializing in automated trading solutions.
                    With expertise in both development and trading, Stanley creates high-performance trading robots
                    that deliver exceptional results for clients worldwide.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone size={20} className="text-trading-blue mr-3" />
                      <span>+254799010442</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={20} className="text-trading-blue mr-3" />
                      <span>ndonjstanley@gmail.com</span>
                    </div>
                    <div className="flex space-x-4 mt-6">
                      <a href="#" className="w-10 h-10 rounded-full bg-trading-blue/10 flex items-center justify-center text-trading-blue hover:bg-trading-blue hover:text-white transition-colors">
                        <Github size={20} />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-trading-blue/10 flex items-center justify-center text-trading-blue hover:bg-trading-blue hover:text-white transition-colors">
                        <Linkedin size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h4 className="text-xl font-semibold mb-4">Expertise</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Trading Algorithms</h5>
                    <p className="text-sm text-muted-foreground">Developing sophisticated trading algorithms that adapt to changing market conditions.</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="font-medium mb-2">MT5 Development</h5>
                    <p className="text-sm text-muted-foreground">Expert in creating custom indicators and robots for the MetaTrader 5 platform.</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Binary Options</h5>
                    <p className="text-sm text-muted-foreground">Specialized knowledge in binary options trading strategies and automation.</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Technical Analysis</h5>
                    <p className="text-sm text-muted-foreground">Proficient in advanced technical analysis methods for market prediction.</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Risk Management</h5>
                    <p className="text-sm text-muted-foreground">Implementing robust risk management systems to protect trading capital.</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Software Development</h5>
                    <p className="text-sm text-muted-foreground">Full-stack developer with expertise in multiple programming languages and frameworks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
