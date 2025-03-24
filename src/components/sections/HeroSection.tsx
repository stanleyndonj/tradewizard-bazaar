
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Bot, 
  ChevronRight, 
  DollarSign, 
  LineChart 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HeroSection = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/auth');
  };
  
  const handleCustomRobot = () => {
    navigate('/robot-selection');
  };
  
  return (
    <section className="relative pb-20 pt-32 md:pb-32 md:pt-40">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-[-20%] w-[600px] h-[600px] bg-trading-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-trading-blue/10 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="max-w-3xl">
            <Badge className="bg-trading-blue/10 text-trading-blue hover:bg-trading-blue/20 mb-5">
              Trading Robots for MT5 & Binary Options
            </Badge>
            
            <h1 className="animate-fade-in text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Custom Trading Robots <br/>
              <span className="bg-gradient-to-r from-trading-blue to-trading-lightBlue bg-clip-text text-transparent">
                Built for Success
              </span>
            </h1>
            
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Powerful, reliable, and fully customized trading robots designed to execute your precise trading strategies with accuracy and consistency.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-trading-blue hover:bg-trading-darkBlue group"
                onClick={handleGetStarted}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="group border-trading-blue/20 hover:border-trading-blue/50"
                onClick={handleCustomRobot}
              >
                Get Your Custom Robot
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap gap-4 md:gap-8">
              <div className="flex items-center">
                <Bot className="mr-2 h-5 w-5 text-trading-blue" />
                <span>MT5 & Binary Options</span>
              </div>
              <div className="flex items-center">
                <LineChart className="mr-2 h-5 w-5 text-trading-blue" />
                <span>Advanced Strategies</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-trading-blue" />
                <span>Performance Analytics</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-trading-blue" />
                <span>Risk Management</span>
              </div>
            </div>
          </div>
          
          <div className="relative p-4 lg:p-0">
            <div className="glass-card overflow-hidden rounded-2xl">
              <img
                src="/placeholder.svg"
                alt="Trading interface preview"
                className="w-full object-cover aspect-[4/3]"
              />
            </div>
            
            {/* Floating elements */}
            <div className="glass-card animate-fade-in absolute -top-6 -left-6 p-4 rounded-lg shadow-lg hidden md:block">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                <span className="text-sm font-medium">75% Win Rate</span>
              </div>
            </div>
            
            <div className="glass-card animate-fade-in absolute -bottom-6 -right-6 p-4 rounded-lg shadow-lg hidden md:block">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-trading-blue/10 mr-2">
                  <LineChart className="h-3 w-3 text-trading-blue" />
                </div>
                <span className="text-sm font-medium">Profit: +1,240 pips</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
