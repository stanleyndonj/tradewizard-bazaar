import { useState, useEffect } from 'react';
import { useBackend } from '@/context/BackendContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RobotRequest } from '@/lib/backend';

const RobotRequestManagement = () => {
  const { robotRequests, fetchAllRobotRequests, updateRobotRequest } = useBackend();
  const [selectedRequest, setSelectedRequest] = useState<RobotRequest | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Initial load is handled by AdminDashboard
  }, []);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await updateRobotRequest(requestId, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Request status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleOpenResponse = (request: RobotRequest) => {
    setSelectedRequest(request);
    setResponseText(request.admin_response || '');
    setIsDialogOpen(true);
  };

  const handleSaveResponse = async () => {
    if (!selectedRequest) return;
    
    try {
      await updateRobotRequest(selectedRequest.id, { 
        admin_response: responseText,
        status: 'responded'
      });
      
      toast({
        title: "Response Sent",
        description: "Your response has been saved and sent to the customer",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Robot Request Management</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Robot Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {robotRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.user_id}</TableCell>
                <TableCell>{request.robot_description}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange(request.id, request.status === 'pending' ? 'approved' : 'pending')}
                  >
                    {request.status === 'pending' ? 'Approve' : 'Mark Pending'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenResponse(request)}
                  >
                    Respond
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for responding to the request */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Respond to Request</DialogTitle>
            <DialogDescription>
              Write your response to the user regarding their robot request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your response here"
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSaveResponse}>
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RobotRequestManagement;
