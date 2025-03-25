
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBackend } from '@/context/BackendContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui-elements/SectionHeader';

const CustomerDashboard = () => {
  const { user, robotRequests, purchases, robots, fetchRobotRequests, fetchPurchases, isLoading } = useBackend();
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title
    document.title = 'Customer Dashboard | TradeWizard';
    
    // Fetch fresh data
    const loadData = async () => {
      await Promise.all([
        fetchRobotRequests(),
        fetchPurchases()
      ]);
    };
    
    loadData();
  }, [fetchRobotRequests, fetchPurchases]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Get robot name from id
  const getRobotName = (robotId: string) => {
    const robot = robots.find(r => r.id === robotId);
    return robot ? robot.name : 'Unknown Robot';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Map status to badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-10">
          <SectionHeader
            subtitle="Your Account"
            title="Customer Dashboard"
            description={`Welcome back, ${user.name}! Manage your trading robots and view your purchases.`}
            centered
          />
          
          <div className="max-w-6xl mx-auto mt-8">
            <Tabs defaultValue="robots" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="robots">Custom Robot Requests</TabsTrigger>
                <TabsTrigger value="purchases">Your Purchases</TabsTrigger>
              </TabsList>
              
              <TabsContent value="robots" className="animate-fade-in">
                <div className="grid gap-6">
                  {robotRequests.length > 0 ? (
                    robotRequests.map((request) => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{request.robotType} Trading Robot</CardTitle>
                              <CardDescription>Request ID: {request.id}</CardDescription>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Trading Pairs</p>
                              <p className="font-medium">{request.tradingPairs}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Timeframe</p>
                              <p className="font-medium">{request.timeframe}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                              <p className="font-medium">{request.riskLevel}%</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Requested on</p>
                            <p className="font-medium">{formatDate(request.createdAt)}</p>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => navigate('/messages')}
                          >
                            Check Messages
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <h3 className="text-xl font-medium mb-2">No robot requests yet</h3>
                      <p className="text-muted-foreground mb-6">Get started by requesting a custom trading robot</p>
                      <Button onClick={() => navigate('/robot-selection')}>
                        Request Custom Robot
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="purchases" className="animate-fade-in">
                <div className="grid gap-6">
                  {purchases.length > 0 ? (
                    purchases.map((purchase) => (
                      <Card key={purchase.id} className="hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{getRobotName(purchase.robotId)}</CardTitle>
                              <CardDescription>Purchase ID: {purchase.id}</CardDescription>
                            </div>
                            <Badge className={getStatusColor(purchase.status)}>
                              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Amount</p>
                              <p className="font-medium">{purchase.amount} {purchase.currency}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                              <p className="font-medium">{purchase.paymentMethod}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                              <p className="font-medium">{formatDate(purchase.purchaseDate)}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download Robot
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <h3 className="text-xl font-medium mb-2">No purchases yet</h3>
                      <p className="text-muted-foreground mb-6">Explore our marketplace to find trading robots</p>
                      <Button onClick={() => navigate('/robot-marketplace')}>
                        Go to Marketplace
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

export default CustomerDashboard;
