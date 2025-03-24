
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const RobotConfiguration = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('strategy');
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  
  // Form state
  const [tradingPairs, setTradingPairs] = useState('EURUSD, GBPUSD');
  const [timeframe, setTimeframe] = useState('H1');
  const [riskLevel, setRiskLevel] = useState([2]); // % of account per trade
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    // Set page title
    document.title = 'Configure Your Robot | TradeWizard';
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to configure a trading robot",
        variant: "destructive",
      });
      navigate('/auth', { 
        state: { 
          redirectAfter: `/configure-robot/${type}`,
          message: "Please sign in to configure your custom trading robot"
        } 
      });
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Validate robot type
    if (type !== 'mt5' && type !== 'binary') {
      navigate('/robot-selection');
    }
    
    // Pre-populate name and email if user is logged in
    if (parsedUser) {
      setName(parsedUser.name || '');
      setEmail(parsedUser.email || '');
    }
  }, [type, navigate, toast]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to continue.",
        variant: "destructive"
      });
      return;
    }
    
    // Submit form - in a real app, this would connect to a backend
    toast({
      title: "Request submitted!",
      description: "We've received your robot configuration. Our team will contact you shortly.",
    });
    
    // Navigate to messages page after successful submission
    setTimeout(() => {
      navigate('/messages');
    }, 1500);
  };
  
  const robotTypeTitle = type === 'mt5' ? 'MT5 Trading Robot' : 'Binary Option Robot';

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-20">
          <SectionHeader
            subtitle="Step 2"
            title={`Configure Your ${robotTypeTitle}`}
            description="Customize your trading robot's parameters to match your exact trading requirements."
            centered
          />
          
          <div className="max-w-4xl mx-auto mt-8">
            <Tabs defaultValue="strategy" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="risk">Risk Management</TabsTrigger>
                <TabsTrigger value="contact">Your Details</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                <TabsContent value="strategy" className="mt-6 space-y-6">
                  <div className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
                    <h3 className="text-lg font-medium mb-4">Trading Instruments</h3>
                    <p className="text-muted-foreground mb-4">Select the trading pairs you want your robot to trade.</p>
                    <Input 
                      value={tradingPairs}
                      onChange={(e) => setTradingPairs(e.target.value)}
                      placeholder="e.g., EURUSD, GBPUSD, USDJPY"
                      className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Separate multiple pairs with commas</p>
                  </div>
                  
                  <div className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
                    <h3 className="text-lg font-medium mb-4">Timeframe</h3>
                    <p className="text-muted-foreground mb-4">Select the primary timeframe for your trading strategy.</p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {['M5', 'M15', 'M30', 'H1', 'H4', 'D1'].map((tf) => (
                        <Button 
                          key={tf}
                          type="button"
                          variant={timeframe === tf ? 'default' : 'outline'}
                          className={`transition-all duration-300 ${timeframe === tf ? 'bg-trading-blue scale-105' : 'hover:scale-105'}`}
                          onClick={() => setTimeframe(tf)}
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      className="bg-trading-blue hover:bg-trading-darkBlue transition-all duration-300 hover:scale-105"
                      onClick={() => setActiveTab('risk')}
                    >
                      Next: Risk Management
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="risk" className="mt-6 space-y-6">
                  <div className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
                    <h3 className="text-lg font-medium mb-4">Risk Per Trade</h3>
                    <p className="text-muted-foreground mb-6">Define the maximum risk percentage per trade.</p>
                    <div className="px-4">
                      <Slider
                        value={riskLevel}
                        min={0.1}
                        max={10}
                        step={0.1}
                        onValueChange={setRiskLevel}
                        className="my-6"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-muted-foreground">0.1%</span>
                        <span className="text-sm font-medium">{riskLevel[0]}%</span>
                        <span className="text-sm text-muted-foreground">10%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="transition-all duration-300 hover:scale-105"
                      onClick={() => setActiveTab('strategy')}
                    >
                      Previous: Strategy
                    </Button>
                    <Button 
                      type="button" 
                      className="bg-trading-blue hover:bg-trading-darkBlue transition-all duration-300 hover:scale-105"
                      onClick={() => setActiveTab('contact')}
                    >
                      Next: Your Details
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="mt-6 space-y-6">
                  <div className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <p className="text-muted-foreground mb-6">Please confirm your contact details so we can deliver your custom robot.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
                        <Input 
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          required
                          className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
                        <Input 
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone (optional)</label>
                        <Input 
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Your phone number"
                          className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="transition-all duration-300 hover:scale-105"
                      onClick={() => setActiveTab('risk')}
                    >
                      Previous: Risk Management
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-trading-blue hover:bg-trading-darkBlue transition-all duration-300 hover:scale-105"
                    >
                      Submit Request
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RobotConfiguration;
