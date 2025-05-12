import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useBackend } from '@/context/BackendContext';
import { Link } from 'react-router-dom';
import { TradingLoader } from '@/components/ui/loader';
import ParallaxContainer from '@/components/ui/parallax-container';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoggedIn, getUserRobotRequests, getPurchases, getRobots } = useBackend();
  const [robotRequests, setRobotRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [robots, setRobots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [robotRequestsData, purchasesData, robotsData] = await Promise.all([
          getUserRobotRequests(),
          getPurchases(),  // Remove the user ID argument
          getRobots()      // Remove the user ID argument
        ]);
      
        setRobotRequests(robotRequestsData);
        setPurchases(purchasesData);
        setRobots(robotsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getUserRobotRequests, getPurchases, getRobots]);

  if (!isLoggedIn || !user) {
    // Redirect to login if not authenticated
    navigate('/auth');
    return null;
  }

  return (
    <ParallaxContainer className="min-h-screen flex flex-col">
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                <CardDescription className="text-gray-500">{user.email}</CardDescription>
              </div>
            </div>
            {user.is_admin && <Badge variant="secondary">Admin</Badge>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-100">
                  <CardHeader>
                    <CardTitle>Robot Requests</CardTitle>
                    <CardDescription>Your custom robot requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <TradingLoader small text="Loading requests..." />
                    ) : robotRequests.length > 0 ? (
                      <ul className="list-none space-y-2">
                        {robotRequests.map((request) => (
                          <li key={request.id} className="flex items-center justify-between">
                            <span>Request ID: {request.id}</span>
                            <Badge variant="outline">Status: {request.status}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No robot requests found.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-100">
                  <CardHeader>
                    <CardTitle>Purchased Robots</CardTitle>
                    <CardDescription>Your purchased trading robots</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <TradingLoader small text="Loading robots..." />
                    ) : purchases.length > 0 ? (
                      <ul className="list-none space-y-2">
                        {purchases.map((purchase) => (
                          <li key={purchase.id} className="flex items-center justify-between">
                            <span>Robot ID: {purchase.robot_id}</span>
                            <Badge variant="secondary">Purchased on: {new Date(purchase.created_at).toLocaleDateString()}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No robots purchased yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">What would you like to do?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild>
                    <Link to="/robot-request">Request a Custom Robot</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/marketplace">Explore the Marketplace</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ParallaxContainer>
  );
};

export default CustomerDashboard;
