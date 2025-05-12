import React, { useState, useEffect } from 'react';
import { useBackend } from '@/context/BackendContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TradingLoader } from '@/components/ui/loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ParallaxContainer from '@/components/ui/parallax-container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TradingBotVisual from '@/components/3d/TradingBotVisual';

const RobotMarketplace = () => {
  const { robots, loadRobots, purchaseRobot, isLoading } = useBackend();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    // Updated to use loadRobots instead of getRobots
    const fetchRobots = async () => {
      try {
        await loadRobots();
      } catch (error) {
        console.error("Error loading robots:", error);
      }
    };
    
    fetchRobots();
    document.title = 'Robot Marketplace | TradeWizard';
  }, [loadRobots]);

  const filteredRobots = robots.filter(robot => {
    const matchesSearch = robot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         robot.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || robot.category === categoryFilter;
    const matchesType = typeFilter === 'all' || robot.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handlePurchase = (robot) => {
    setSelectedRobot(robot);
    setIsDialogOpen(true);
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedRobot) return;
    
    try {
      setPurchaseInProgress(true);
      
      const result = await purchaseRobot(selectedRobot.id, paymentMethod);
      
      if (result) {
        setPurchaseSuccess(true);
        toast({
          title: "Purchase Successful",
          description: `You have successfully purchased ${selectedRobot.name}`,
        });
      }
    } catch (error) {
      console.error("Error purchasing robot:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchaseInProgress(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRobot(null);
    setPurchaseSuccess(false);
  };

  return (
    <ParallaxContainer className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      
      <main className="flex-grow pt-24 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2 text-gradient">Trading Robot Marketplace</h1>
          <p className="text-muted-foreground mb-6">
            Browse and purchase automated trading robots for your trading needs
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search robots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Category</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Type</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MT5">MetaTrader 5</SelectItem>
                  <SelectItem value="Binary">Binary Options</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="grid" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <TradingLoader text="Loading robots..." />
                </div>
              ) : filteredRobots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRobots.map((robot) => (
                    <Card key={robot.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gradient-card">
                      <div className="h-48 bg-gradient-to-br from-blue-900/30 to-purple-900/30 relative overflow-hidden">
                        {robot.imageUrl ? (
                          <img 
                            src={robot.imageUrl} 
                            alt={robot.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TradingBotVisual className="w-full h-full" />
                          </div>
                        )}
                        <Badge 
                          className={`absolute top-3 right-3 ${
                            robot.category === 'free' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {robot.category === 'free' ? 'Free' : `${robot.price} ${robot.currency}`}
                        </Badge>
                      </div>
                      
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{robot.name}</CardTitle>
                            <CardDescription>{robot.type} Robot</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{robot.description}</p>
                        
                        <div className="space-y-1">
                          {robot.features && robot.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          
                          {robot.features && robot.features.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{robot.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          className="w-full bg-gradient-button"
                          onClick={() => handlePurchase(robot)}
                        >
                          {robot.category === 'free' ? (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download Now
                            </>
                          ) : (
                            <>
                              Purchase
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-card rounded-lg">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Robots Found</h3>
                  <p className="text-muted-foreground">
                    No robots match your current search criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <TradingLoader text="Loading robots..." />
                </div>
              ) : filteredRobots.length > 0 ? (
                <div className="space-y-4">
                  {filteredRobots.map((robot) => (
                    <Card key={robot.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gradient-card">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 h-48 md:h-auto bg-gradient-to-br from-blue-900/30 to-purple-900/30 relative">
                          {robot.imageUrl ? (
                            <img 
                              src={robot.imageUrl} 
                              alt={robot.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <TradingBotVisual className="w-full h-full" />
                            </div>
                          )}
                          <Badge 
                            className={`absolute top-3 right-3 ${
                              robot.category === 'free' 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {robot.category === 'free' ? 'Free' : `${robot.price} ${robot.currency}`}
                          </Badge>
                        </div>
                        
                        <div className="w-full md:w-3/4 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold">{robot.name}</h3>
                              <p className="text-sm text-muted-foreground">{robot.type} Robot</p>
                            </div>
                            
                            <Button 
                              className="bg-gradient-button"
                              onClick={() => handlePurchase(robot)}
                            >
                              {robot.category === 'free' ? (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </>
                              ) : (
                                <>
                                  Purchase
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{robot.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              {robot.features && robot.features.slice(0, 3).map((feature, index) => (
                                <div key={index} className="flex items-center text-sm">
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="space-y-1">
                              {robot.features && robot.features.slice(3, 6).map((feature, index) => (
                                <div key={index} className="flex items-center text-sm">
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-card rounded-lg">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Robots Found</h3>
                  <p className="text-muted-foreground">
                    No robots match your current search criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          {purchaseSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Purchase Successful
                </DialogTitle>
                <DialogDescription>
                  Thank you for your purchase! You can now download and use your robot.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex justify-center py-6">
                <Button 
                  className="bg-gradient-button"
                  onClick={handleCloseDialog}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Robot
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Purchase Robot</DialogTitle>
                <DialogDescription>
                  {selectedRobot?.category === 'free' 
                    ? 'Download this free trading robot' 
                    : 'Complete your purchase to get access to this trading robot'}
                </DialogDescription>
              </DialogHeader>
              
              {selectedRobot && (
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{selectedRobot.name}</h3>
                    <Badge>
                      {selectedRobot.category === 'free' 
                        ? 'Free' 
                        : `${selectedRobot.price} ${selectedRobot.currency}`}
                    </Badge>
                  </div>
                  
                  {selectedRobot.category !== 'free' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select 
                          value={paymentMethod} 
                          onValueChange={setPaymentMethod}
                        >
                          <SelectTrigger id="payment-method">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="mpesa">M-PESA</SelectItem>
                            <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmPurchase}
                  disabled={purchaseInProgress}
                  className="bg-gradient-button"
                >
                  {purchaseInProgress ? (
                    <>
                      <TradingLoader small />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    selectedRobot?.category === 'free' ? 'Download Now' : 'Complete Purchase'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ParallaxContainer>
  );
};

export default RobotMarketplace;
