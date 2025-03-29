
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, MessageCircle, Users, Bot, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import RobotManagementModal from '@/components/admin/RobotManagementModal';
import { useBackend } from '@/context/BackendContext';
import { FullPageLoader } from '@/components/ui/loader';
import ChatInterface from '@/components/admin/ChatInterface';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    user: currentUser, 
    logout, 
    isLoading, 
    robots, 
    conversations,
    getUsers,
    addRobot,
    updateRobot,
    deleteRobot,
    setCurrentConversation
  } = useBackend();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isRobotModalOpen, setIsRobotModalOpen] = useState(false);
  const [currentRobot, setCurrentRobot] = useState<any | null>(null);
  
  const users = getUsers();

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!isLoading && !currentUser) {
      navigate('/auth');
      return;
    }

    if (!isLoading && !currentUser?.is_admin) {
      navigate('/customer-dashboard');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      return;
    }
    
    // Set page title
    document.title = 'Admin Dashboard | TradeWizard';
  }, [currentUser, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewUserChat = (userId: string) => {
    // Find conversation with this user
    const userConversation = conversations.find(conv => conv.userId === userId);
    
    if (userConversation) {
      setCurrentConversation(userConversation.id);
    } else {
      toast({
        title: "No Conversation",
        description: "There is no active conversation with this user",
      });
    }
  };

  const handleAddRobot = () => {
    setCurrentRobot(null);
    setIsRobotModalOpen(true);
  };

  const handleEditRobot = (robot: any) => {
    setCurrentRobot(robot);
    setIsRobotModalOpen(true);
  };

  const handleDeleteRobot = (robotId: string) => {
    deleteRobot(robotId);
  };

  const handleSaveRobot = async (robot: any) => {
    if (currentRobot) {
      // Update existing robot
      await updateRobot(currentRobot.id, robot);
    } else {
      // Add new robot
      await addRobot(robot);
    }
    setIsRobotModalOpen(false);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = conversations.filter(conv => 
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRobots = robots.filter(robot => 
    robot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    robot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    robot.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (robot.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <FullPageLoader text="Loading admin dashboard..." />;
  }

  if (!currentUser || !currentUser.is_admin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="section-container py-10">
          <div className="glass-card rounded-2xl overflow-hidden max-w-6xl mx-auto">
            {/* Dashboard header */}
            <div className="bg-trading-blue p-4 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                <p className="text-sm opacity-80">Manage users, messages, and robots</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-white hover:bg-trading-darkBlue"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
            
            {/* Search bar */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users, messages, robots, or services..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="p-4">
              <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="users" className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="robots" className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    Robots
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Join Date</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{formatDate(user.created_at)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Bot className="h-4 w-4 mr-2 text-trading-blue" />
                                  {user.role || 'Customer'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.is_admin ? 'secondary' : 'default'}>
                                  {user.is_admin ? 'Admin' : 'Active'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex items-center"
                                  onClick={() => viewUserChat(user.id)}
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Chat
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="messages" className="mt-0">
                  <ChatInterface />
                </TabsContent>
                
                <TabsContent value="robots" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button onClick={handleAddRobot} className="bg-trading-blue hover:bg-trading-darkBlue">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Robot
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRobots.length > 0 ? (
                          filteredRobots.map((robot) => (
                            <TableRow key={robot.id}>
                              <TableCell className="font-medium">{robot.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{robot.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={robot.category === 'free' ? 'secondary' : 'default'}
                                  className={robot.category === 'free' ? 'bg-green-500' : ''}
                                >
                                  {robot.category === 'free' ? 'Free' : 'Paid'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {robot.category === 'free' 
                                  ? 'Free' 
                                  : `${robot.currency || 'USD'} ${robot.price.toFixed(2)}`}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEditRobot(robot)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDeleteRobot(robot.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No robots found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {isRobotModalOpen && (
        <RobotManagementModal
          isOpen={isRobotModalOpen}
          onClose={() => setIsRobotModalOpen(false)}
          onSave={handleSaveRobot}
          robot={currentRobot}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
