
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, MessageCircle, Users, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Check if user is logged in and is admin
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate('/messages');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      return;
    }

    setUser(parsedUser);
    
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/');
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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter(message => 
    message.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
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
                <p className="text-sm opacity-80">Manage users and messages</p>
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
                  placeholder="Search users, messages, or services..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="p-4">
              <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="users" className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Messages
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
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
