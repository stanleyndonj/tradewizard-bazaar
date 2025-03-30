
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, MessageCircle, Users, Bot, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import RobotManagementModal from '@/components/admin/RobotManagementModal';
import { useBackend } from '@/context/BackendContext';
import { FullPageLoader } from '@/components/ui/loader';
import ChatInterface from '@/components/admin/ChatInterface';
import { formatDistanceToNow } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    user: currentUser, 
    logout, 
    isLoading, 
    robots, 
    robotRequests,
    conversations,
    fetchAllRobotRequests,
    updateRobotRequestStatus,
    setCurrentConversation,
    createConversation,
    addRobot,
    updateRobot,
    deleteRobot,
  } = useBackend();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isRobotModalOpen, setIsRobotModalOpen] = useState(false);
  const [currentRobot, setCurrentRobot] = useState<any | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  
  // Load all robot requests when the component mounts
  useEffect(() => {
    if (currentUser?.is_admin) {
      fetchAllRobotRequests();
    }
  }, [currentUser, fetchAllRobotRequests]);

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

  const viewUserChat = (userId: string, userName: string, userEmail: string) => {
    // Find conversation with this user
    const userConversation = conversations.find(conv => conv.userId === userId);
    
    if (userConversation) {
      setCurrentConversation(userConversation.id);
      navigate('/messages');
    } else {
      // Create a new conversation
      createConversation(userId, userName, userEmail);
      navigate('/messages');
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
  
  const handleRequestAction = (request: any) => {
    setSelectedRequest(request);
    setNotes(request.notes || '');
    setRequestDialogOpen(true);
  };
  
  const handleUpdateRequest = async (status: string, delivered: boolean) => {
    if (!selectedRequest) return;
    
    try {
      await updateRobotRequestStatus(selectedRequest.id, {
        status,
        is_delivered: delivered,
        notes
      });
      
      setRequestDialogOpen(false);
      
      toast({
        title: "Request Updated",
        description: `Request status: ${status}, Delivered: ${delivered ? 'Yes' : 'No'}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update the request status",
        variant: "destructive",
      });
    }
  };

  const filteredRobotRequests = robotRequests.filter(request => 
    request.robot_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.trading_pairs.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Tabs defaultValue="robot-requests">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="robot-requests" className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    Robot Requests
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
                
                <TabsContent value="robot-requests" className="mt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Robot Type</TableHead>
                          <TableHead>Trading Pairs</TableHead>
                          <TableHead>Timeframe</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Delivered</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRobotRequests.length > 0 ? (
                          filteredRobotRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">{request.user_id}</TableCell>
                              <TableCell>{request.robot_type}</TableCell>
                              <TableCell>{request.trading_pairs}</TableCell>
                              <TableCell>{request.timeframe}</TableCell>
                              <TableCell>{request.risk_level}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    request.status === 'approved' 
                                      ? 'success' 
                                      : request.status === 'rejected'
                                      ? 'destructive'
                                      : 'default'
                                  }
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {request.is_delivered ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500" />
                                )}
                              </TableCell>
                              <TableCell>{formatDate(request.created_at)}</TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleRequestAction(request)}
                                >
                                  Manage
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-4">
                              No robot requests found
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
      
      {/* Robot Request Management Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Robot Request</DialogTitle>
            <DialogDescription>
              Update the status and delivery information for this robot request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Robot Type:</p>
                  <p className="text-sm">{selectedRequest.robot_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Trading Pairs:</p>
                  <p className="text-sm">{selectedRequest.trading_pairs}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Timeframe:</p>
                  <p className="text-sm">{selectedRequest.timeframe}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Risk Level:</p>
                  <p className="text-sm">{selectedRequest.risk_level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Status:</p>
                  <Badge 
                    variant={
                      selectedRequest.status === 'approved' 
                        ? 'success' 
                        : selectedRequest.status === 'rejected'
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Delivered:</p>
                  {selectedRequest.is_delivered ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <Badge variant="destructive">No</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this robot request"
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="default"
                onClick={() => handleUpdateRequest('approved', false)}
                className="flex-1 sm:flex-none"
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleUpdateRequest('rejected', false)}
                className="flex-1 sm:flex-none"
              >
                Reject
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="success"
                onClick={() => handleUpdateRequest('approved', true)}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
              >
                Mark as Delivered
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRequestDialogOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
