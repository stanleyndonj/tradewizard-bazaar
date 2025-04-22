
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import Navbar from '@/components/layout/Navbar';
import RobotRequestManagement from '@/components/admin/RobotRequestManagement';
import AIPricingManager from '@/components/admin/AIPricingManager';
import UserManagement from '@/components/admin/UserManagement';
import RobotManagement from '@/components/admin/RobotManagement';
import { toast } from '@/hooks/use-toast';
import { 
  Users, Settings, DollarSign, BarChart, 
  ShoppingBag, Package, LayoutDashboard, Loader2 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user, fetchAllRobotRequests, getSubscriptionPlans } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 0,
    robotRequests: 0,
    robots: 0,
    subscriptions: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await fetchAllRobotRequests();
      await getSubscriptionPlans();
      
      // This would be replaced with actual API calls to get dashboard data
      setStats({
        users: 156,
        robotRequests: 24,
        robots: 12,
        subscriptions: 68
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin access check
  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !user.is_admin) {
    toast({
      title: "Access Denied",
      description: "You don't have admin privileges to access this page",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <div className="flex flex-1 mt-16">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-gray-900 border-r border-gray-800 pt-8">
          <div className="px-4 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-400" />
              Admin Controls
            </h2>
            <p className="text-xs text-gray-400 mt-1">Manage your platform</p>
          </div>
          
          <nav className="space-y-1 px-2">
            <SidebarItem 
              icon={<LayoutDashboard className="h-5 w-5" />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <SidebarItem 
              icon={<Package className="h-5 w-5" />} 
              label="Robot Requests" 
              active={activeTab === 'robot-requests'}
              onClick={() => setActiveTab('robot-requests')}
            />
            <SidebarItem 
              icon={<ShoppingBag className="h-5 w-5" />} 
              label="Robot Marketplace" 
              active={activeTab === 'robot-management'}
              onClick={() => setActiveTab('robot-management')}
            />
            <SidebarItem 
              icon={<DollarSign className="h-5 w-5" />} 
              label="AI Pricing" 
              active={activeTab === 'ai-pricing'}
              onClick={() => setActiveTab('ai-pricing')}
            />
            <SidebarItem 
              icon={<Users className="h-5 w-5" />} 
              label="Users" 
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
          </nav>
          
          <div className="px-4 mt-10">
            <div className="py-4 px-3 bg-blue-950/40 rounded-lg border border-blue-900/50">
              <h3 className="text-sm font-medium text-blue-400">Admin Version</h3>
              <p className="text-xs text-gray-400 mt-1">v2.1.0 - Last updated: May 2025</p>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-950">
          <ScrollArea className="h-[calc(100vh-4rem)] w-full">
            <div className="container px-4 py-8 max-w-7xl mx-auto">
              {/* Mobile navigation tabs */}
              <div className="md:hidden flex overflow-x-auto pb-3 gap-2 mb-4">
                <TabButton 
                  label="Dashboard" 
                  active={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')} 
                />
                <TabButton 
                  label="Requests" 
                  active={activeTab === 'robot-requests'} 
                  onClick={() => setActiveTab('robot-requests')} 
                />
                <TabButton 
                  label="Robots" 
                  active={activeTab === 'robot-management'} 
                  onClick={() => setActiveTab('robot-management')} 
                />
                <TabButton 
                  label="Pricing" 
                  active={activeTab === 'ai-pricing'} 
                  onClick={() => setActiveTab('ai-pricing')} 
                />
                <TabButton 
                  label="Users" 
                  active={activeTab === 'users'} 
                  onClick={() => setActiveTab('users')} 
                />
              </div>
              
              {/* Page title */}
              <header className="mb-8">
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-white"
                >
                  {activeTab === 'dashboard' && 'Admin Dashboard'}
                  {activeTab === 'robot-requests' && 'Robot Requests'}
                  {activeTab === 'robot-management' && 'Robot Marketplace'}
                  {activeTab === 'ai-pricing' && 'AI Pricing Management'}
                  {activeTab === 'users' && 'User Management'}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-400 mt-1"
                >
                  {activeTab === 'dashboard' && 'Overview of your platform metrics'}
                  {activeTab === 'robot-requests' && 'Manage and process customer robot requests'}
                  {activeTab === 'robot-management' && 'Manage the robot marketplace listings'}
                  {activeTab === 'ai-pricing' && 'Set and update AI trading signal subscription prices'}
                  {activeTab === 'users' && 'Manage user accounts and permissions'}
                </motion.p>
              </header>
              
              {/* Dashboard section */}
              {activeTab === 'dashboard' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  <StatCard 
                    icon={<Users className="h-6 w-6 text-blue-400" />}
                    title="Total Users"
                    value={stats.users}
                    trend="+12% from last month"
                    color="blue"
                  />
                  <StatCard 
                    icon={<Package className="h-6 w-6 text-purple-400" />}
                    title="Robot Requests"
                    value={stats.robotRequests}
                    trend="+5 new today"
                    color="purple"
                  />
                  <StatCard 
                    icon={<ShoppingBag className="h-6 w-6 text-green-400" />}
                    title="Active Robots"
                    value={stats.robots}
                    trend="+2 this week"
                    color="green"
                  />
                  <StatCard 
                    icon={<DollarSign className="h-6 w-6 text-amber-400" />}
                    title="Active Subscriptions"
                    value={stats.subscriptions}
                    trend="+8 this week"
                    color="amber"
                  />
                  
                  {/* Additional dashboard content would go here */}
                </div>
              )}
              
              {/* Tab content */}
              <div className="min-h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-400">Loading data...</span>
                  </div>
                ) : (
                  <>
                    {activeTab === 'robot-requests' && <RobotRequestManagement />}
                    {activeTab === 'robot-management' && <RobotManagement />}
                    {activeTab === 'ai-pricing' && <AIPricingManager />}
                    {activeTab === 'users' && <UserManagement />}
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

// Sidebar item component
const SidebarItem = ({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-gray-800 text-white' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
    }`}
  >
    <span className={`mr-3 ${active ? 'text-blue-400' : 'text-gray-500'}`}>
      {icon}
    </span>
    {label}
  </button>
);

// Mobile tab button
const TabButton = ({ 
  label, 
  active, 
  onClick 
}: { 
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

// Dashboard stat card
const StatCard = ({ 
  icon, 
  title, 
  value, 
  trend,
  color
}: { 
  icon: React.ReactNode;
  title: string;
  value: number;
  trend: string;
  color: 'blue' | 'purple' | 'green' | 'amber';
}) => {
  const colorClasses = {
    blue: 'from-blue-600/20 to-blue-800/5 border-blue-800/30',
    purple: 'from-purple-600/20 to-purple-800/5 border-purple-800/30',
    green: 'from-green-600/20 to-green-800/5 border-green-800/30',
    amber: 'from-amber-600/20 to-amber-800/5 border-amber-800/30',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-gradient-to-b ${colorClasses[color]} border overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <h3 className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</h3>
              <p className="text-xs text-green-400 mt-1">{trend}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-800/50">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminDashboard;
