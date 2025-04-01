import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TradingLoader } from '@/components/ui/loader';

// Mock types for our dashboard
interface RobotRequest {
  id: string;
  type: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  dateRequested: string;
  description: string;
}

interface PurchasedRobot {
  id: string;
  name: string;
  type: 'MT5' | 'Binary';
  purchaseDate: string;
  price: number;
  category: 'free' | 'paid';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchasedRobots, setPurchasedRobots] = useState<PurchasedRobot[]>([]);
  const [activeTab, setActiveTab] = useState('requested');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard | TradeWizard';
    window.scrollTo(0, 0);
    
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    if (!userString) {
      // Redirect to auth page if not logged in
      toast({
        title: "Authentication required",
        description: "Please sign in to access your dashboard",
        variant: "destructive",
      });
      navigate('/auth', { state: { redirectAfter: '/dashboard', message: "Please sign in to access your dashboard" } });
      return;
    }
    
    try {
      const userData = JSON.parse(userString);
      setUser(userData);
      
      // Mock loading robot requests (in a real app, this would be an API call)
      setTimeout(() => {
        // Get random user-specific data
        const mockRequests = generateMockRequests(userData.email);
        const mockPurchased = generateMockPurchases(userData.email);
        
        setRobotRequests(mockRequests);
        setPurchasedRobots(mockPurchased);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to parse user data', error);
      setLoading(false);
    }
  }, [navigate]);

  // Generate mock data based on user email for persistence
  const generateMockRequests = (email: string): RobotRequest[] => {
    // Using the email string to create deterministic "random" data
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = (hash % 4) + 1; // 1-4 requests
    
    const statuses: ('pending' | 'in_progress' | 'completed' | 'rejected')[] = 
      ['pending', 'in_progress', 'completed', 'rejected'];
    
    const types = ['Forex Robot', 'Binary Options Robot', 'Stock Trading Robot', 'Crypto Trading Robot'];
    
    return Array.from({ length: count }, (_, i) => {
      const dateOffset = (hash + i * 11) % 30; // 0-29 days ago
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() - dateOffset);
      
      return {
        id: `req-${hash}-${i}`,
        type: types[(hash + i) % types.length],
        name: `${types[(hash + i) % types.length]} #${(hash + i) % 100}`,
        status: statuses[(hash + i) % statuses.length],
        dateRequested: requestDate.toISOString().split('T')[0],
        description: `Custom trading robot with ${(hash + i) % 5 + 3} specialized indicators and ${(hash + i) % 3 + 1} risk management features.`
      };
    });
  };
  
  const generateMockPurchases = (email: string): PurchasedRobot[] => {
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = (hash % 3) + 1; // 1-3 purchases
    
    const types: ('MT5' | 'Binary')[] = ['MT5', 'Binary'];
    const names = [
      'TrendMaster Pro', 'VolatilityHunter', 'MarketWave Analyzer', 
      'SmartScalper', 'TrendRider', 'SignalWizard'
    ];
    
    return Array.from({ length: count }, (_, i) => {
      const dateOffset = (hash + i * 7) % 60; // 0-59 days ago
      const purchaseDate = new Date();
      purchaseDate.setDate(purchaseDate.getDate() - dateOffset);
      
      return {
        id: `pur-${hash}-${i}`,
        name: names[(hash + i) % names.length],
        type: types[(hash + i) % types.length],
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        price: ((hash + i) % 2 === 0) ? 0 : (49 + ((hash + i) % 4) * 25),
        category: ((hash + i) % 2 === 0) ? 'free' : 'paid'
      };
    });
  };
  
  const getStatusColor = (status: RobotRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusText = (status: RobotRequest['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleContactSupport = () => {
    navigate('/messages');
  };

  const handleViewMarketplace = () => {
    navigate('/robot-marketplace');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="section-container py-20">
            <TradingLoader text="Loading dashboard..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-20">
          <SectionHeader
            subtitle="User Dashboard"
            title={`Welcome, ${user?.name || 'User'}`}
            description="Manage your robot requests and view your purchased robots."
            centered
          />
          
          <div className="mt-12">
            <Tabs defaultValue="requested" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="requested">Robot Requests</TabsTrigger>
                <TabsTrigger value="purchased">Purchased Robots</TabsTrigger>
              </TabsList>
              
              <TabsContent value="requested" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {robotRequests.length > 0 ? (
                    robotRequests.map((request) => (
                      <Card key={request.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center gap-2">
                              <Bot className="h-5 w-5 text-trading-blue" />
                              {request.name}
                            </CardTitle>
                            <Badge className={`${getStatusColor(request.status)} border`}>
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                          <CardDescription>
                            Requested on: {request.dateRequested}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <p className="text-sm text-gray-600">
                            {request.description}
                          </p>
                        </CardContent>
                        <CardFooter className="bg-gray-50 py-3 border-t flex justify-between">
                          <Button variant="ghost" size="sm" onClick={handleContactSupport}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Ask for update
                          </Button>
                          {request.status === 'completed' && (
                            <Button size="sm" className="bg-trading-blue hover:bg-trading-darkBlue">
                              Download
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-lg bg-gray-50">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No robot requests yet</h3>
                      <p className="text-muted-foreground text-center mb-4 max-w-md">
                        Start by configuring a custom trading robot that meets your specific trading needs.
                      </p>
                      <Button onClick={() => navigate('/robot-selection')}>
                        Configure a Robot
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="purchased" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedRobots.length > 0 ? (
                    purchasedRobots.map((robot) => (
                      <Card key={robot.id} className="overflow-hidden h-full flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center gap-2">
                              <Bot className="h-5 w-5 text-trading-blue" />
                              {robot.name}
                            </CardTitle>
                            <Badge variant={robot.category === 'free' ? 'secondary' : 'default'}>
                              {robot.category === 'free' ? 'Free' : 'Premium'}
                            </Badge>
                          </div>
                          <CardDescription>
                            {robot.type} Robot • Purchased on: {robot.purchaseDate}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4 flex-grow">
                          <div className="text-sm">
                            <p className="font-medium">Type: <span className="font-normal">{robot.type}</span></p>
                            <p className="font-medium mt-1">Price: 
                              <span className="font-normal">
                                {robot.price === 0 ? ' Free' : ` $${robot.price.toFixed(2)}`}
                              </span>
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 py-3 border-t">
                          <Button className="w-full bg-trading-blue hover:bg-trading-darkBlue">
                            Download Robot
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-lg bg-gray-50">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No robots purchased yet</h3>
                      <p className="text-muted-foreground text-center mb-4 max-w-md">
                        Visit our marketplace to discover free and premium trading robots for MT5 and Binary Options.
                      </p>
                      <Button onClick={handleViewMarketplace}>
                        Browse Marketplace
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
