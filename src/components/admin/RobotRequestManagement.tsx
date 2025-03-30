
import { useState } from 'react';
import { useBackend } from '@/context/BackendContext';
import { RobotRequest } from '@/lib/backend';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Package, 
  Check, 
  X, 
  Download, 
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RobotRequestManagementProps {
  requests: RobotRequest[];
  onRefresh: () => void;
}

const RobotRequestManagement = ({ requests, onRefresh }: RobotRequestManagementProps) => {
  const { updateRobotRequestStatus } = useBackend();
  const [editingRequest, setEditingRequest] = useState<RobotRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [isDelivered, setIsDelivered] = useState(false);
  const [notes, setNotes] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleOpenDialog = (request: RobotRequest) => {
    setEditingRequest(request);
    setStatus(request.status);
    setIsDelivered(request.is_delivered);
    setNotes(request.notes || '');
    setDownloadUrl(request.download_url || '');
    setProgress(request.progress || 0);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRequest(null);
    setIsDialogOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!editingRequest) return;

    try {
      await updateRobotRequestStatus(editingRequest.id, {
        status,
        is_delivered: isDelivered,
        notes,
        download_url: downloadUrl,
        progress
      });
      
      handleCloseDialog();
      onRefresh();
      
      toast({
        title: "Changes saved",
        description: "The robot request has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the robot request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      case 'delivered':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const toggleCardExpand = (requestId: string) => {
    if (expandedCard === requestId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(requestId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Robot Requests</h2>
        <Button onClick={onRefresh}>Refresh</Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-md">
          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No robot requests yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            When users request custom trading robots, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="cursor-pointer" onClick={() => toggleCardExpand(request.id)}>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {request.robot_type}
                      {expandedCard === request.id ? 
                        <ChevronUp className="ml-2 h-4 w-4" /> : 
                        <ChevronDown className="ml-2 h-4 w-4" />
                      }
                    </CardTitle>
                    <CardDescription>User ID: {request.user_id}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{request.progress || 0}%</span>
                  </div>
                  <Progress value={request.progress || 0} className="h-2" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Trading Pairs:</span>
                    <span className="font-medium">{request.trading_pairs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Timeframe:</span>
                    <span className="font-medium">{request.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Risk Level:</span>
                    <span className="font-medium">{request.risk_level}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Requested:</span>
                    <span className="font-medium">{formatDate(request.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Delivered:</span>
                    <span className="font-medium">
                      {request.is_delivered ? 
                        (request.delivery_date ? formatDate(request.delivery_date) : "Yes") 
                        : "No"}
                    </span>
                  </div>
                  
                  {request.download_url && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Download:</span>
                      <a 
                        href={request.download_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Robot
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Expanded view with detailed information */}
                {expandedCard === request.id && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    <h4 className="font-medium">Detailed Configuration</h4>
                    
                    {/* Basic configuration fields */}
                    {request.bot_name && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bot Name:</span>
                        <span className="font-medium">{request.bot_name}</span>
                      </div>
                    )}
                    
                    {request.market && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Market:</span>
                        <span className="font-medium">{request.market}</span>
                      </div>
                    )}
                    
                    {request.currency && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Currency:</span>
                        <span className="font-medium">{request.currency}</span>
                      </div>
                    )}
                    
                    {request.trading_strategy && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Strategy:</span>
                        <span className="font-medium">{request.trading_strategy}</span>
                      </div>
                    )}
                    
                    {/* MT5 specific fields */}
                    {request.robot_type?.toLowerCase().includes('mt5') && (
                      <>
                        <h4 className="font-medium mt-3">MT5 Configuration</h4>
                        
                        {request.volume && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Volume:</span>
                            <span className="font-medium">{request.volume}</span>
                          </div>
                        )}
                        
                        {request.order_type && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Order Type:</span>
                            <span className="font-medium">{request.order_type}</span>
                          </div>
                        )}
                        
                        {request.stop_loss && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Stop Loss:</span>
                            <span className="font-medium">{request.stop_loss}</span>
                          </div>
                        )}
                        
                        {request.take_profit && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Take Profit:</span>
                            <span className="font-medium">{request.take_profit}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Binary specific fields */}
                    {request.robot_type?.toLowerCase().includes('binary') && (
                      <>
                        <h4 className="font-medium mt-3">Binary Bot Configuration</h4>
                        
                        {request.stake_amount && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Stake Amount:</span>
                            <span className="font-medium">{request.stake_amount}</span>
                          </div>
                        )}
                        
                        {request.contract_type && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Contract Type:</span>
                            <span className="font-medium">{request.contract_type}</span>
                          </div>
                        )}
                        
                        {request.duration && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Duration:</span>
                            <span className="font-medium">{request.duration}</span>
                          </div>
                        )}
                        
                        {request.prediction && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Prediction:</span>
                            <span className="font-medium">{request.prediction}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {request.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p className="text-sm">{request.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleOpenDialog(request)} className="w-full">
                  Manage Request
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Robot Request</DialogTitle>
            <DialogDescription>
              Update the status and details of this robot request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select 
                value={status} 
                onValueChange={setStatus}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Progress</label>
              <div className="col-span-3">
                <div className="flex items-center gap-4">
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                  />
                  <span>%</span>
                </div>
                <Progress value={progress} className="mt-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Delivered</label>
              <div className="col-span-3 flex items-center">
                <Button
                  variant={isDelivered ? "default" : "outline"}
                  size="sm"
                  className="mr-2"
                  onClick={() => setIsDelivered(true)}
                >
                  <Check className="h-4 w-4 mr-1" /> Yes
                </Button>
                <Button
                  variant={!isDelivered ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDelivered(false)}
                >
                  <X className="h-4 w-4 mr-1" /> No
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="download-url" className="text-right">
                Download URL
              </label>
              <Input
                id="download-url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/download/robot.zip"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="notes" className="text-right pt-2">
                Notes
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this request"
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RobotRequestManagement;
