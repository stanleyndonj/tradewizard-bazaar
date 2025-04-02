
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackend } from '@/context/BackendContext';
import RobotRequestManagement from '@/components/admin/RobotRequestManagement';
import AIPricingManager from '@/components/admin/AIPricingManager';
import { TradingLoader } from '@/components/ui/loader';

const AdminDashboard = () => {
  const { user, fetchAllRobotRequests } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('robot-requests');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const robotRequests = await fetchAllRobotRequests();
      setRequests(robotRequests || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin access check
  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="robot-requests">Robot Requests</TabsTrigger>
          <TabsTrigger value="ai-pricing">AI Pricing</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="robot-requests">
          {isLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <TradingLoader text="Loading robot requests..." />
            </div>
          ) : (
            <RobotRequestManagement 
              requests={requests} 
              onRefresh={loadData} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="ai-pricing">
          <AIPricingManager />
        </TabsContent>
        
        <TabsContent value="users">
          <div className="text-center py-16 bg-muted/30 rounded-md">
            <h3 className="text-xl font-medium">User Management</h3>
            <p className="mt-2 text-muted-foreground">
              User management panel coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
