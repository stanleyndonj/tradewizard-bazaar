
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import { TradingLoader } from '@/components/ui/loader';
import Navbar from '@/components/layout/Navbar';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

// Import correct types if needed
import { RobotRequest, Purchase, Robot } from '@/lib/backend';

const CustomerDashboard = () => {
  const { user, getUserRobotRequests, getPurchases, getRobots } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);

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
      
      if (userRobotRequests) setRobotRequests(userRobotRequests);
      if (userPurchases) setPurchases(userPurchases);
      if (allRobots) setRobots(allRobots);
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

  // Access check
  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto py-8 px-4 max-w-7xl mt-20">
        <h1 className="text-3xl font-bold mb-6">Customer Dashboard</h1>

        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <TradingLoader text="Loading dashboard data..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Robot Requests */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Your Robot Requests</h2>
              {robotRequests.length > 0 ? (
                <ul className="space-y-2">
                  {robotRequests.map((request) => (
                    <li key={request.id} className="border-b pb-2">
                      <p><strong>Request ID:</strong> {request.id}</p>
                      <p><strong>Description:</strong> {request.robot_type} - {request.trading_pairs}</p>
                      <p><strong>Status:</strong> {request.status}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No robot requests found.</p>
              )}
              <Button onClick={() => console.log('Request a new robot')} className="mt-4 bg-trading-blue hover:bg-trading-darkBlue text-white">
                Request a New Robot
              </Button>
            </div>

            {/* Purchases */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Your Purchases</h2>
              {purchases.length > 0 ? (
                <ul className="space-y-2">
                  {purchases.map((purchase) => (
                    <li key={purchase.id} className="border-b pb-2">
                      <p><strong>Purchase ID:</strong> {purchase.id}</p>
                      <p><strong>Robot ID:</strong> {purchase.robot_id}</p>
                      <p><strong>Payment Method:</strong> {purchase.payment_method}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No purchases found.</p>
              )}
            </div>

            {/* Robots */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Available Robots</h2>
              {robots.length > 0 ? (
                <ul className="space-y-2">
                  {robots.map((robot) => (
                    <li key={robot.id} className="border-b pb-2">
                      <p><strong>Robot ID:</strong> {robot.id}</p>
                      <p><strong>Name:</strong> {robot.name}</p>
                      <p><strong>Description:</strong> {robot.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No robots available.</p>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
