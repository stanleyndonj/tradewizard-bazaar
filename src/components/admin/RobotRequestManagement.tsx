
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBackend } from "@/context/BackendContext";
import { RobotRequest } from "@/lib/backend";

const RobotRequestManagement = () => {
  const { fetchAllRobotRequests, updateRobotRequest } = useBackend();
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RobotRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState<string>("all");

  useEffect(() => {
    loadRobotRequests();
  }, []);

  const loadRobotRequests = async () => {
    try {
      setLoading(true);
      const requests = await fetchAllRobotRequests();
      setRobotRequests(requests);
      console.log("Loaded robot requests:", requests);
    } catch (error) {
      console.error("Error loading robot requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (request: RobotRequest) => {
    setSelectedRequest(request);
    setStatus(request.status || "pending");
    setNotes(request.notes || "");
    setProgress(request.progress || 0);
    setDownloadUrl(request.download_url || "");
    setIsModalOpen(true);
  };

  const openDetailsModal = (request: RobotRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      
      const updates = {
        status,
        notes,
        progress,
        download_url: downloadUrl,
        is_delivered: status === "delivered"
      };
      
      // If status changed to delivered, set delivery date
      if (status === "delivered" && selectedRequest.status !== "delivered") {
        updates.delivery_date = new Date().toISOString();
      }
      
      await updateRobotRequest(selectedRequest.id, updates);
      await loadRobotRequests();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating robot request:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "in_progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "approved":
        return "bg-green-500 hover:bg-green-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      case "delivered":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "in_progress":
        return "blue";
      case "approved":
        return "green";
      case "rejected":
        return "destructive";
      case "delivered":
        return "purple";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const filteredRequests = filteredStatus === "all"
    ? robotRequests
    : robotRequests.filter(request => request.status === filteredStatus);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Robot Requests Management</CardTitle>
        <CardDescription>
          Manage custom robot requests from users.
        </CardDescription>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by status:</span>
            <Select
              value={filteredStatus}
              onValueChange={setFilteredStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadRobotRequests} variant="outline">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No robot requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Robot Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.user_name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{request.user_email || "N/A"}</div>
                    </TableCell>
                    <TableCell>{request.robot_type}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status) as any}>
                        {request.status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-[100px]">
                        <Progress value={request.progress || 0} className="h-2" />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {request.progress || 0}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetailsModal(request)}>
                          Details
                        </Button>
                        <Button size="sm" onClick={() => openUpdateModal(request)}>
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Robot Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">User:</Label>
                <div className="col-span-3">
                  <div className="font-medium">{selectedRequest.user_name || "N/A"}</div>
                  <div className="text-sm text-gray-500">{selectedRequest.user_email || "N/A"}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Robot Type:</Label>
                <div className="col-span-3">{selectedRequest.robot_type}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Trading Pairs:</Label>
                <div className="col-span-3">{selectedRequest.trading_pairs}</div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status:</Label>
                <Select value={status} onValueChange={setStatus}>
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
                <Label htmlFor="progress" className="text-right">Progress:</Label>
                <div className="col-span-3">
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="downloadUrl" className="text-right">Download URL:</Label>
                <Input
                  id="downloadUrl"
                  className="col-span-3"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right">Notes:</Label>
                <Textarea
                  id="notes"
                  className="col-span-3"
                  placeholder="Add notes about this request"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              className={selectedRequest ? getStatusColor(status) : ""}
              onClick={handleUpdateRequest}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Robot Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <Label className="font-bold">User:</Label>
                    <div>{selectedRequest.user_name || "N/A"} ({selectedRequest.user_email || "N/A"})</div>
                  </div>
                  <div>
                    <Label className="font-bold">Robot Type:</Label>
                    <div>{selectedRequest.robot_type}</div>
                  </div>
                  <div>
                    <Label className="font-bold">Trading Pairs:</Label>
                    <div>{selectedRequest.trading_pairs}</div>
                  </div>
                  <div>
                    <Label className="font-bold">Timeframe:</Label>
                    <div>{selectedRequest.timeframe}</div>
                  </div>
                  <div>
                    <Label className="font-bold">Risk Level:</Label>
                    <div>{selectedRequest.risk_level}</div>
                  </div>
                  <div>
                    <Label className="font-bold">Status:</Label>
                    <Badge variant={getStatusBadgeVariant(selectedRequest.status) as any} className="ml-2">
                      {selectedRequest.status?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label className="font-bold">Submitted:</Label>
                    <div>{formatDate(selectedRequest.created_at)}</div>
                  </div>
                  {selectedRequest.delivery_date && (
                    <div>
                      <Label className="font-bold">Delivered:</Label>
                      <div>{formatDate(selectedRequest.delivery_date)}</div>
                    </div>
                  )}
                  <div>
                    <Label className="font-bold">Progress:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedRequest.progress || 0} className="h-2 flex-1" />
                      <span className="text-xs">{selectedRequest.progress || 0}%</span>
                    </div>
                  </div>
                  {selectedRequest.download_url && (
                    <div>
                      <Label className="font-bold">Download URL:</Label>
                      <div className="break-all">
                        <a 
                          href={selectedRequest.download_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {selectedRequest.download_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional parameters section */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Robot Configuration Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
                  {selectedRequest.bot_name && (
                    <div>
                      <Label className="font-bold">Bot Name:</Label>
                      <div>{selectedRequest.bot_name}</div>
                    </div>
                  )}
                  {selectedRequest.market && (
                    <div>
                      <Label className="font-bold">Market:</Label>
                      <div>{selectedRequest.market}</div>
                    </div>
                  )}
                  {selectedRequest.stake_amount && (
                    <div>
                      <Label className="font-bold">Stake Amount:</Label>
                      <div>{selectedRequest.stake_amount}</div>
                    </div>
                  )}
                  {selectedRequest.contract_type && (
                    <div>
                      <Label className="font-bold">Contract Type:</Label>
                      <div>{selectedRequest.contract_type}</div>
                    </div>
                  )}
                  {selectedRequest.duration && (
                    <div>
                      <Label className="font-bold">Duration:</Label>
                      <div>{selectedRequest.duration}</div>
                    </div>
                  )}
                  {selectedRequest.prediction && (
                    <div>
                      <Label className="font-bold">Prediction:</Label>
                      <div>{selectedRequest.prediction}</div>
                    </div>
                  )}
                  {selectedRequest.currency && (
                    <div>
                      <Label className="font-bold">Currency:</Label>
                      <div>{selectedRequest.currency}</div>
                    </div>
                  )}
                  {selectedRequest.trading_strategy && (
                    <div>
                      <Label className="font-bold">Trading Strategy:</Label>
                      <div>{selectedRequest.trading_strategy}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* MT5 specific fields if applicable */}
              {selectedRequest.robot_type === "MT5" && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">MT5 Specific Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
                    {selectedRequest.volume && (
                      <div>
                        <Label className="font-bold">Volume:</Label>
                        <div>{selectedRequest.volume}</div>
                      </div>
                    )}
                    {selectedRequest.order_type && (
                      <div>
                        <Label className="font-bold">Order Type:</Label>
                        <div>{selectedRequest.order_type}</div>
                      </div>
                    )}
                    {selectedRequest.stop_loss && (
                      <div>
                        <Label className="font-bold">Stop Loss:</Label>
                        <div>{selectedRequest.stop_loss}</div>
                      </div>
                    )}
                    {selectedRequest.take_profit && (
                      <div>
                        <Label className="font-bold">Take Profit:</Label>
                        <div>{selectedRequest.take_profit}</div>
                      </div>
                    )}
                    {selectedRequest.entry_rules && (
                      <div className="col-span-2">
                        <Label className="font-bold">Entry Rules:</Label>
                        <div className="whitespace-pre-line">{selectedRequest.entry_rules}</div>
                      </div>
                    )}
                    {selectedRequest.exit_rules && (
                      <div className="col-span-2">
                        <Label className="font-bold">Exit Rules:</Label>
                        <div className="whitespace-pre-line">{selectedRequest.exit_rules}</div>
                      </div>
                    )}
                    {selectedRequest.risk_management && (
                      <div className="col-span-2">
                        <Label className="font-bold">Risk Management:</Label>
                        <div className="whitespace-pre-line">{selectedRequest.risk_management}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes section */}
              {selectedRequest.notes && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Admin Notes</h3>
                  <div className="border p-4 rounded-md bg-gray-50 whitespace-pre-line">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDetailsModalOpen(false);
                if (selectedRequest) {
                  openUpdateModal(selectedRequest);
                }
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RobotRequestManagement;
