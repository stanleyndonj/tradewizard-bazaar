
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { Bot, Lock, Download, ShoppingCart } from 'lucide-react';
import RobotProductCard from '@/components/marketplace/RobotProductCard';
import PaymentModal from '@/components/marketplace/PaymentModal';

interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'MT5' | 'Binary';
  category: 'free' | 'paid';
  features: string[];
  imageUrl: string;
}

const RobotMarketplace = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [robotsData, setRobotsData] = useState<Robot[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the robot marketplace",
        variant: "destructive",
      });
      // Save current path to redirect back after login
      localStorage.setItem('redirectAfterAuth', '/robot-marketplace');
      navigate('/auth');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Set page title
    document.title = 'Robot Marketplace | TradeWizard';
    
    // Fetch robots data (using mock data for now)
    const sampleRobots: Robot[] = [
      {
        id: '1',
        name: 'MT5 Pro Scalper',
        description: 'Advanced scalping robot for MT5 platform with smart entry and exit algorithms.',
        price: 199,
        currency: 'USD',
        type: 'MT5',
        category: 'paid',
        features: ['Multi-timeframe analysis', 'Smart risk management', 'Compatible with all major currency pairs'],
        imageUrl: '/placeholder.svg'
      },
      {
        id: '2',
        name: 'Binary Options Signal Bot',
        description: 'Get reliable signals for binary options trading with high win rate.',
        price: 149,
        currency: 'USD',
        type: 'Binary',
        category: 'paid',
        features: ['Real-time signals', '75%+ win rate', 'Works with multiple assets'],
        imageUrl: '/placeholder.svg'
      },
      {
        id: '3',
        name: 'Forex Trend Finder',
        description: 'Free MT5 robot that helps identify strong market trends.',
        price: 0,
        currency: 'USD',
        type: 'MT5',
        category: 'free',
        features: ['Trend detection indicators', 'Email alerts', 'Visual dashboard'],
        imageUrl: '/placeholder.svg'
      },
      {
        id: '4',
        name: 'Binary Options Starter Bot',
        description: 'Free binary options robot ideal for beginners.',
        price: 0,
        currency: 'USD',
        type: 'Binary',
        category: 'free',
        features: ['Basic signal generation', 'Entry point indicators', 'Risk management tips'],
        imageUrl: '/placeholder.svg'
      }
    ];
    
    setRobotsData(sampleRobots);
  }, [navigate]);

  const handlePurchaseClick = (robot: Robot) => {
    if (robot.category === 'free') {
      // Handle free download
      toast({
        title: "Download started",
        description: `Your ${robot.name} is being downloaded.`,
      });
    } else {
      // Open payment modal for paid robots
      setSelectedRobot(robot);
      setIsPaymentModalOpen(true);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedRobot(null);
  };

  const handlePaymentComplete = (paymentMethod: string) => {
    if (!selectedRobot) return;
    
    toast({
      title: "Payment successful!",
      description: `Thank you for purchasing ${selectedRobot.name} using ${paymentMethod}.`,
    });
    
    setIsPaymentModalOpen(false);
    setSelectedRobot(null);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const freeRobots = robotsData.filter(robot => robot.category === 'free');
  const paidRobots = robotsData.filter(robot => robot.category === 'paid');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="section-container py-10">
          <SectionHeader
            subtitle="Our Collection"
            title="Trading Robots Marketplace"
            description="Explore our selection of premium and free trading robots for MT5 and Binary Options platforms."
            centered
          />
          
          <div className="mt-10 max-w-6xl mx-auto">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="all">All Robots</TabsTrigger>
                <TabsTrigger value="free">Free Robots</TabsTrigger>
                <TabsTrigger value="paid">Premium Robots</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {robotsData.map(robot => (
                    <RobotProductCard
                      key={robot.id}
                      robot={robot}
                      onPurchaseClick={() => handlePurchaseClick(robot)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="free" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freeRobots.length > 0 ? (
                    freeRobots.map(robot => (
                      <RobotProductCard
                        key={robot.id}
                        robot={robot}
                        onPurchaseClick={() => handlePurchaseClick(robot)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10">
                      <p className="text-muted-foreground">No free robots available at the moment.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="paid" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paidRobots.length > 0 ? (
                    paidRobots.map(robot => (
                      <RobotProductCard
                        key={robot.id}
                        robot={robot}
                        onPurchaseClick={() => handlePurchaseClick(robot)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10">
                      <p className="text-muted-foreground">No premium robots available at the moment.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {isPaymentModalOpen && selectedRobot && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          robot={selectedRobot}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default RobotMarketplace;
