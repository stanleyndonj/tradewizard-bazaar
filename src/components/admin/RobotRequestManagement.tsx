
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
import { Package, Check, X, Download } from 'lucide-react';

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

  const handleOpenDialog = (request: RobotRequest) => {
    setEditingRequest(request);
    setStatus(request.status);
    setIsDelivered(request.is_delivered);
    setNotes(request.notes || '');
    setDownloadUrl(request.download_url || '');
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
        download_url: downloadUrl
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
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{request.robot_type}</CardTitle>
                    <CardDescription>User ID: {request.user_id}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
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
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Download URL:</span>
                      <span className="font-medium truncate max-w-[170px]" title={request.download_url}>
                        {request.download_url}
                      </span>
                    </div>
                  )}
                </div>
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
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
