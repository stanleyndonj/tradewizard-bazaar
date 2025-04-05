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
import EnhancedPaymentModal from '@/components/marketplace/EnhancedPaymentModal';
import { useBackend } from '@/context/BackendContext';
import { Robot } from '@/lib/backend';
import { TradingLoader } from '@/components/ui/loader';

const RobotMarketplace = () => {
  const navigate = useNavigate();
  const { user, robots, purchaseRobot, isLoading } = useBackend();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);

  useEffect(() => {
    // Set page title
    document.title = 'Robot Marketplace | TradeWizard';
    
    // Check if user is logged in
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the robot marketplace",
        variant: "destructive",
      });
      // Save current path to redirect back after login
      localStorage.setItem('redirectAfterAuth', '/robot-marketplace');
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handlePurchaseClick = (robot: Robot) => {
    const category = (robot.category || 'paid') as 'free' | 'paid';
    
    if (category === 'free') {
      // Handle free download
      toast({
        title: "Download started",
        description: `Your ${robot.name} is being downloaded.`,
      });
      
      // Simulate a purchase for free robots too
      purchaseRobot(robot.id, 0, robot.currency || 'USD', 'Free Download');
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
    
    purchaseRobot(
      selectedRobot.id,
      selectedRobot.price,
      selectedRobot.currency || 'USD',
      paymentMethod
    );
    
    setIsPaymentModalOpen(false);
    setSelectedRobot(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TradingLoader text="Loading marketplace..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const freeRobots = robots.filter(robot => (robot.category || 'paid') === 'free');
  const paidRobots = robots.filter(robot => (robot.category || 'paid') === 'paid');

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
                  {robots.length > 0 ? (
                    robots.map(robot => (
                      <RobotProductCard
                        key={robot.id}
                        robot={{
                          ...robot,
                          imageUrl: robot.imageUrl || robot.image_url || '/placeholder.svg',
                          category: (robot.category || 'paid') as 'free' | 'paid',
                          currency: robot.currency || 'USD',
                          type: (robot.type || 'MT5') as 'MT5' | 'Binary'
                        }}
                        onPurchaseClick={() => handlePurchaseClick(robot)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10">
                      <p className="text-muted-foreground">No robots available at the moment.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="free" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freeRobots.length > 0 ? (
                    freeRobots.map(robot => (
                      <RobotProductCard
                        key={robot.id}
                        robot={{
                          ...robot,
                          imageUrl: robot.imageUrl || robot.image_url || '/placeholder.svg',
                          category: (robot.category || 'free') as 'free' | 'paid',
                          currency: robot.currency || 'USD',
                          type: (robot.type || 'MT5') as 'MT5' | 'Binary'
                        }}
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
                        robot={{
                          ...robot,
                          imageUrl: robot.imageUrl || robot.image_url || '/placeholder.svg',
                          category: (robot.category || 'paid') as 'free' | 'paid',
                          currency: robot.currency || 'USD',
                          type: (robot.type || 'MT5') as 'MT5' | 'Binary'
                        }}
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
        <EnhancedPaymentModal
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
