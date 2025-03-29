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

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
  lastActive: Date;
  service: string;
  status: 'active' | 'inactive';
  messages: number;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'MT5' | 'Binary';
  category: 'free' | 'paid';
  features: string[];
  imageUrl: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useBackend();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [isRobotModalOpen, setIsRobotModalOpen] = useState(false);
  const [currentRobot, setCurrentRobot] = useState<Robot | null>(null);

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    if (!currentUser.is_admin) {
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
    
    // Sample data for demo
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        joinDate: new Date(2023, 5, 15),
        lastActive: new Date(2023, 6, 20),
        service: 'MT5 Trading Robot',
        status: 'active',
        messages: 5
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        joinDate: new Date(2023, 4, 10),
        lastActive: new Date(2023, 6, 19),
        service: 'Binary Option Robot',
        status: 'active',
        messages: 3
      },
      {
        id: '3',
        name: 'David Johnson',
        email: 'david@example.com',
        joinDate: new Date(2023, 3, 5),
        lastActive: new Date(2023, 5, 15),
        service: 'Custom Indicator',
        status: 'inactive',
        messages: 2
      }
    ];
    
    const sampleMessages: Message[] = [
      {
        id: '1',
        userId: '1',
        userName: 'John Doe',
        text: 'Hello, I need help with my MT5 robot configuration.',
        timestamp: new Date(2023, 6, 20, 10, 30),
        read: true
      },
      {
        id: '2',
        userId: '2',
        userName: 'Jane Smith',
        text: 'When will my binary option robot be ready?',
        timestamp: new Date(2023, 6, 19, 14, 15),
        read: false
      },
      {
        id: '3',
        userId: '1',
        userName: 'John Doe',
        text: 'Can you add a specific indicator to my robot?',
        timestamp: new Date(2023, 6, 18, 9, 45),
        read: true
      }
    ];
    
    setUsers(sampleUsers);
    setMessages(sampleMessages);
    
    // Sample robots data
    const sampleRobots: Robot[] = [
      {
        id: '1',
        name: 'MT5 Pro Scalper',
        description: 'Advanced scalping robot for MT5 platform with smart entry and exit algorithms.',
        price: 199,
        currency: 'USD',
        type: 'MT5',
        category: 'paid',
        features: ['Multi-timeframe analysis', 'Smart risk management', 'Compatible with all major currency pairs'],
        imageUrl: '/placeholder.svg'
      },
      {
        id: '2',
        name: 'Binary Options Signal Bot',
        description: 'Get reliable signals for binary options trading with high win rate.',
        price: 149,
        currency: 'USD',
        type: 'Binary',
        category: 'paid',
        features: ['Real-time signals', '75%+ win rate', 'Works with multiple assets'],
        imageUrl: '/placeholder.svg'
      },
      {
        id: '3',
        name: 'Forex Trend Finder',
        description: 'Free MT5 robot that helps identify strong market trends.',
        price: 0,
        currency: 'USD',
        type: 'MT5',
        category: 'free',
        features: ['Trend detection indicators', 'Email alerts', 'Visual dashboard'],
        imageUrl: '/placeholder.svg'
      }
    ];
    
    setRobots(sampleRobots);
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewUserChat = (userId: string) => {
    // In a real app, this would navigate to a user-specific chat history
    toast({
      title: "Chat Opened",
      description: `Viewing chat history for user ID: ${userId}`,
    });
  };

  const handleAddRobot = () => {
    setCurrentRobot(null);
    setIsRobotModalOpen(true);
  };

  const handleEditRobot = (robot: Robot) => {
    setCurrentRobot(robot);
    setIsRobotModalOpen(true);
  };

  const handleDeleteRobot = (robotId: string) => {
    // In a real app, this would call an API to delete the robot
    setRobots(prev => prev.filter(robot => robot.id !== robotId));
    toast({
      title: "Robot Deleted",
      description: "The robot has been removed from the marketplace",
    });
  };

  const handleSaveRobot = (robot: Robot) => {
    if (currentRobot) {
      // Update existing robot
      setRobots(prev => prev.map(r => r.id === robot.id ? robot : r));
      toast({
        title: "Robot Updated",
        description: `${robot.name} has been updated`,
      });
    } else {
      // Add new robot
      const newRobot = {
        ...robot,
        id: Date.now().toString(), // Generate a simple ID
      };
      setRobots(prev => [...prev, newRobot]);
      toast({
        title: "Robot Added",
        description: `${robot.name} has been added to the marketplace`,
      });
    }
    setIsRobotModalOpen(false);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter(message => 
    message.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRobots = robots.filter(robot => 
    robot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    robot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    robot.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    robot.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
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
                          <TableHead>Last Active</TableHead>
                          <TableHead>Service</TableHead>
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
                              <TableCell>{formatDate(user.joinDate)}</TableCell>
                              <TableCell>{formatDate(user.lastActive)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Bot className="h-4 w-4 mr-2 text-trading-blue" />
                                  {user.service}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                  {user.status}
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
                                  Chat ({user.messages})
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
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMessages.length > 0 ? (
                          filteredMessages.map((message) => (
                            <TableRow key={message.id}>
                              <TableCell className="font-medium">{message.userName}</TableCell>
                              <TableCell className="max-w-xs truncate">{message.text}</TableCell>
                              <TableCell>
                                {message.timestamp.toLocaleDateString()} {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </TableCell>
                              <TableCell>
                                <Badge variant={message.read ? 'outline' : 'default'}>
                                  {message.read ? 'Read' : 'Unread'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex items-center"
                                  onClick={() => viewUserChat(message.userId)}
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Reply
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No messages found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
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
                                  : `${robot.currency} ${robot.price.toFixed(2)}`}
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
