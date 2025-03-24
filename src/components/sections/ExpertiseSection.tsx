
import { Shield, Zap, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeader from '../ui-elements/SectionHeader';
import AnimatedCounter from '../ui-elements/AnimatedCounter';

const ExpertiseSection = () => {
  const stats = [
    { end: 15, suffix: '+', title: 'Years Experience' },
    { end: 98, suffix: '%', title: 'Client Satisfaction' },
    { end: 500, suffix: '+', title: 'Trading Robots Built' },
    { end: 10000, suffix: '+', title: 'Trades Executed' },
  ];

  return (
    <section id="expertise" className="relative bg-trading-charcoal text-white py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-trading-blue/10 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader
              subtitle="Why Choose Us"
              title="Trading Expertise That Delivers Results"
              description="With over 15 years in algorithmic trading, we've perfected the science of creating profitable trading solutions."
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-trading-blue/20 flex items-center justify-center flex-shrink-0">
                  <Shield size={24} className="text-trading-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Risk Management</h3>
                  <p className="text-gray-400">Advanced algorithms to protect your capital and minimize drawdowns.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-trading-blue/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={24} className="text-trading-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Fast Execution</h3>
                  <p className="text-gray-400">Lightning-fast algorithms that capitalize on market opportunities.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-trading-blue/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={24} className="text-trading-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Data-Driven</h3>
                  <p className="text-gray-400">Strategies backed by extensive backtesting and market analysis.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-trading-blue/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={24} className="text-trading-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">24/7 Trading</h3>
                  <p className="text-gray-400">Our robots work while you sleep, never missing an opportunity.</p>
                </div>
              </div>
            </div>
            
            <Button size="lg" className="bg-trading-blue hover:bg-trading-darkBlue text-white">
              Learn More About Our Approach
            </Button>
          </div>
          
          <div className="relative">
            <div className="w-full aspect-square p-1 rounded-2xl bg-gradient-to-br from-trading-blue/20 to-transparent backdrop-blur-sm">
              <div className="w-full h-full rounded-xl overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070" 
                  alt="Trading expert analyzing charts" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-trading-charcoal to-transparent opacity-80" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                      <AnimatedCounter key={index} {...stat} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-8 -left-8 w-48 h-48 border border-trading-blue/30 rounded-full -z-10"></div>
            <div className="absolute -top-8 -right-8 w-64 h-64 border border-trading-blue/20 rounded-full -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
