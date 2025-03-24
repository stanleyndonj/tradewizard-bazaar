
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-trading-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-trading-blue/10 rounded-full blur-2xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <p className="inline-block px-3 py-1 rounded-full bg-trading-blue/10 text-trading-blue text-sm font-medium mb-5">
              Expert Trading Solutions
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Trading robots for <span className="premium-gradient bg-clip-text text-transparent">maximum profits</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl text-balance">
              Custom-built MT5 and binary robots designed with precision to automate your trading strategy and maximize your returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-trading-blue hover:bg-trading-darkBlue text-white">
                Get Your Custom Robot
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToServices}>
                Explore Services
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="w-full h-[500px] rounded-2xl overflow-hidden glass-card animate-fade-left">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642790551116-18e150f248e9?q=80&w=2070')] bg-cover bg-center opacity-10" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">EURUSD</div>
                    <div className="text-xl font-medium flex items-center">
                      1.0876
                      <span className="ml-2 text-trading-green text-sm">+0.32%</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-trading-green"></div>
                    <div className="w-2 h-2 rounded-full bg-trading-green opacity-70"></div>
                    <div className="w-2 h-2 rounded-full bg-trading-green opacity-40"></div>
                  </div>
                </div>
                
                {/* Mock trading chart */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full h-[200px] bg-trading-blue/5 rounded-lg relative overflow-hidden">
                    <svg viewBox="0 0 100 20" className="w-full h-full">
                      <path 
                        d="M0,10 Q10,5 20,7 T40,6 T60,11 T80,8 T100,10" 
                        fill="none" 
                        stroke="#0A84FF" 
                        strokeWidth="0.5"
                      />
                      <path 
                        d="M0,20 L0,10 Q10,5 20,7 T40,6 T60,11 T80,8 T100,10 L100,20 Z" 
                        fill="url(#gradient)" 
                        fillOpacity="0.2"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                    <div className="text-lg font-medium">78.5%</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">ROI</div>
                    <div className="text-lg font-medium">34.2%</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Trades</div>
                    <div className="text-lg font-medium">1,345</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-trading-blue/20 backdrop-blur-xl rounded-2xl -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-trading-blue/10 backdrop-blur-xl rounded-full -z-10"></div>
          </div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={scrollToServices}>
          <p className="text-sm mb-2">Scroll Down</p>
          <ArrowDown size={20} className="animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
