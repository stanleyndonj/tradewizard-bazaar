
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { Binary, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RobotSelection = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set page title
    document.title = 'Select Your Robot | TradeWizard';
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  const handleSelection = (type: string) => {
    // Navigate to configuration page with the robot type
    navigate(`/configure-robot/${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-20">
          <SectionHeader
            subtitle="Step 1"
            title="Select Your Trading Robot Type"
            description="Choose the type of trading robot that best fits your trading needs and goals."
            centered
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <div 
              className="glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-elevated cursor-pointer group"
              onClick={() => handleSelection('mt5')}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-trading-blue/10 text-trading-blue mb-6 group-hover:bg-trading-blue group-hover:text-white transition-all duration-300">
                <Bot size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">MT5 Trading Robot</h3>
              <p className="text-muted-foreground mb-6">
                Powerful robots built for MetaTrader 5 platform with customizable strategies, technical indicators, and risk management tools.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="inline-block mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-trading-blue" />
                  Support for forex, indices, commodities
                </li>
                <li className="flex items-start">
                  <span className="inline-block mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-trading-blue" />
                  Advanced backtesting capabilities
                </li>
                <li className="flex items-start">
                  <span className="inline-block mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-trading-blue" />
                  Multi-timeframe analysis
                </li>
              </ul>
              <Button className="w-full bg-trading-blue hover:bg-trading-darkBlue">Select MT5 Robot</Button>
            </div>
            
            <div 
              className="glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-elevated cursor-pointer group"
              onClick={() => handleSelection('binary')}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-trading-blue/10 text-trading-blue mb-6 group-hover:bg-trading-blue group-hover:text-white transition-all duration-300">
                <Binary size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Binary Option Robot</h3>
              <p className="text-muted-foreground mb-6">
                Specialized robots designed for binary options trading with high win-rate strategies and precise entry/exit timing.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="inline-block mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-trading-blue" />
                  Supports all major binary platforms
                </li>
                <li className="flex items-start">
                  <span className="inline-block mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-trading-blue" />
                  High accuracy signal generation
                </li>
                <li className="flex items-start">
                  <span className="inline-block mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-trading-blue" />
                  Profit maximization algorithms
                </li>
              </ul>
              <Button className="w-full bg-trading-blue hover:bg-trading-darkBlue">Select Binary Robot</Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RobotSelection;
