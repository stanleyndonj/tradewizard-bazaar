import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import { TradingLoader } from '@/components/ui/loader';
import Navbar from '@/components/layout/Navbar';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ShoppingCart, Plus, Clock, Check, AlertCircle } from 'lucide-react';

// Import correct types
import { RobotRequest, Purchase, Robot as RobotType } from '@/lib/backend';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, getUserRobotRequests, getPurchases, getRobots } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [robots, setRobots] = useState<RobotType[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Pass the required user ID parameter to these functions
      const userRobotRequests = await getUserRobotRequests(user?.id || '');
      const userPurchases = await getPurchases(user?.id || '');
      const allRobots = await getRobots();
      
      setRobotRequests(userRobotRequests || []);
      setPurchases(userPurchases || []);
      setRobots(allRobots || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRobot = () => {
    navigate('/robot-configuration');
  };

  // Access check
  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbar />

      <main className="flex-grow container mx-auto py-12 px-4 max-w-7xl mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome, {user.name}</h1>
            <Button
              onClick={handleRequestRobot}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Request a New Robot
            </Button>
          </div>

          {isLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <TradingLoader text="Loading dashboard data..." />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Robot Requests */}
              <Card className="bg-gray-800 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl">Your Robot Requests</CardTitle>
                      <CardDescription className="text-gray-400">Track your custom robot orders</CardDescription>
                    </div>
                    <div className="p-2 rounded-full bg-blue-900/30 text-blue-400">
                      <Bot className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {robotRequests.length > 0 ? (
                    <div className="space-y-3">
                      {robotRequests.map((request) => (
                        <div key={request.id} className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-white">{request.robot_type}</p>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              request.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                              request.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                              request.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                              request.status === 'delivered' ? 'bg-blue-900/30 text-blue-400' :
                              'bg-gray-600/30 text-gray-400'
                            }`}>
                              {request.status.replace('_', ' ')}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{request.trading_pairs} - {request.timeframe}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400">No robot requests found.</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Submit your first custom robot request to get started.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleRequestRobot} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Request a New Robot
                  </Button>
                </CardFooter>
              </Card>

              {/* Purchases */}
              <Card className="bg-gray-800 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl">Your Purchases</CardTitle>
                      <CardDescription className="text-gray-400">View your transaction history</CardDescription>
                    </div>
                    <div className="p-2 rounded-full bg-green-900/30 text-green-400">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {purchases.length > 0 ? (
                    <div className="space-y-3">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-white">Order #{purchase.id.substring(0, 8)}</p>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              purchase.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                              purchase.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-blue-900/30 text-blue-400'
                            }`}>
                              {purchase.status}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <p className="text-gray-400">Amount: {purchase.amount} {purchase.currency}</p>
                            <p className="text-gray-400">Method: {purchase.payment_method}</p>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Purchased: {new Date(purchase.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400">No purchases found.</p>
                      <p className="text-gray-500 text-sm mt-1">
                        When you buy robots or services, they will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/marketplace')} 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Browse Marketplace
                  </Button>
                </CardFooter>
              </Card>

              {/* Available Robots */}
              <Card className="bg-gray-800 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl">Available Robots</CardTitle>
                      <CardDescription className="text-gray-400">
                        Ready-to-use trading robots
                      </CardDescription>
                    </div>
                    <div className="p-2 rounded-full bg-purple-900/30 text-purple-400">
                      <Bot className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {robots.length > 0 ? (
                    <div className="space-y-3">
                      {robots.slice(0, 3).map((robot) => (
                        <div key={robot.id} className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-white">{robot.name}</p>
                            <div className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-400">
                              {robot.type}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{robot.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-semibold text-white">
                              {robot.price} {robot.currency}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-1 h-auto"
                              onClick={() => navigate(`/marketplace`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400">No robots available yet.</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Check back soon or request a custom robot.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/marketplace')} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    View All Robots
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-900/30 text-blue-400 mr-4">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Robot Requests</p>
                    <p className="text-white text-2xl font-bold">{robotRequests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-900/30 text-green-400 mr-4">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Completed Orders</p>
                    <p className="text-white text-2xl font-bold">
                      {purchases.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-orange-900/30 text-orange-400 mr-4">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Subscription Status</p>
                    <p className="text-white text-xl font-bold">
                      {user.robots_delivered ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
