
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBackend } from '@/context/BackendContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, ArrowRight, MessageSquare } from 'lucide-react';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { FullPageLoader } from '@/components/ui/loader';
import CustomerChat from '@/components/customer/CustomerChat';
import { toast } from '@/hooks/use-toast';

const CustomerDashboard = () => {
  const { user, robotRequests, purchases, robots, fetchRobotRequests, fetchPurchases, isLoading } = useBackend();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('robots');

  useEffect(() => {
    // Set page title
    document.title = 'Customer Dashboard | TradeWizard';
    
    // Check for tab in location state
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
    
    // Fetch fresh data
    const loadData = async () => {
      await Promise.all([
        fetchRobotRequests(),
        fetchPurchases()
      ]);
    };
    
    loadData();
  }, [fetchRobotRequests, fetchPurchases, location.state]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <FullPageLoader text="Loading dashboard..." />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
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

  const handleDownload = (request: any) => {
    if (request.is_delivered && request.download_url) {
      // If there's a download URL, use it
      window.open(request.download_url, '_blank');
    } else if (request.is_delivered) {
      // If delivered but no URL, show a message
      toast({
        title: "Download Ready",
        description: "Your robot is ready for download. Please contact support if you have issues accessing it.",
      });
    } else {
      // If not delivered yet
      toast({
        title: "Not Ready",
        description: "Your robot is not ready for download yet. Please check back later.",
        variant: "destructive",
      });
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
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="robots">Custom Robot Requests</TabsTrigger>
                <TabsTrigger value="purchases">Your Purchases</TabsTrigger>
                <TabsTrigger value="support">Support Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="robots" className="animate-fade-in">
                <div className="grid gap-6">
                  {robotRequests.length > 0 ? (
                    robotRequests.map((request) => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{request.robot_type} Trading Robot</CardTitle>
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
                              <p className="font-medium">{request.trading_pairs}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Timeframe</p>
                              <p className="font-medium">{request.timeframe}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                              <p className="font-medium">{request.risk_level}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Requested on</p>
                              <p className="font-medium">{formatDate(request.created_at)}</p>
                            </div>
                            {request.delivery_date && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Delivered on</p>
                                <p className="font-medium">{formatDate(request.delivery_date)}</p>
                              </div>
                            )}
                          </div>
                          {request.notes && (
                            <div className="mt-4 p-3 bg-muted rounded-md">
                              <p className="text-sm font-medium text-muted-foreground">Admin Notes:</p>
                              <p>{request.notes}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            onClick={() => {
                              setActiveTab('support');
                            }}
                          >
                            Contact Support
                            <MessageSquare className="ml-2 h-4 w-4" />
                          </Button>
                          
                          <Button 
                            className={`flex-1 ${!request.is_delivered ? 'opacity-50' : ''}`}
                            onClick={() => handleDownload(request)}
                            disabled={!request.is_delivered}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Robot
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
                              <CardTitle className="text-xl">{getRobotName(purchase.robot_id)}</CardTitle>
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
                              <p className="font-medium">{purchase.payment_method}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                              <p className="font-medium">{formatDate(purchase.purchaseDate || purchase.created_at)}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full"
                            onClick={() => {
                              // Find a robot request with the same type as the purchased robot
                              const robot = robots.find(r => r.id === purchase.robot_id);
                              if (robot) {
                                const matchingRequest = robotRequests.find(r => 
                                  r.robot_type === robot.type && r.is_delivered
                                );
                                if (matchingRequest && matchingRequest.download_url) {
                                  window.open(matchingRequest.download_url, '_blank');
                                } else {
                                  toast({
                                    title: "Download Ready",
                                    description: "Your purchase is ready. Click again to download.",
                                  });
                                }
                              }
                            }}
                          >
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
              
              <TabsContent value="support" className="animate-fade-in">
                <CustomerChat />
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
