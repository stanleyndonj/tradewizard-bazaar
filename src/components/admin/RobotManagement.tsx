
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Upload } from 'lucide-react';
import { TradingLoader } from '@/components/ui/loader';
import { toast } from '@/hooks/use-toast';
import { Robot } from '@/lib/backend';
import { useBackend } from '@/context/BackendContext';
import RobotManagementModal from './RobotManagementModal';

const RobotManagement = () => {
  const { robots, isLoading, updateRobot, deleteRobot } = useBackend();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRobot, setCurrentRobot] = useState<Robot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileUploads, setFileUploads] = useState<Record<string, File | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const filteredRobots = robots.filter(robot => 
    robot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    robot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRobot = () => {
    setCurrentRobot(null);
    setIsModalOpen(true);
  };

  const handleEditRobot = (robot: Robot) => {
    setCurrentRobot(robot);
    setIsModalOpen(true);
  };

  const handleDeleteRobot = async (robotId: string) => {
    if (window.confirm('Are you sure you want to delete this robot?')) {
      try {
        await deleteRobot(robotId);
        toast({
          title: "Robot deleted",
          description: "The robot has been deleted successfully."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete robot.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, robotId: string) => {
    if (event.target.files && event.target.files[0]) {
      setFileUploads(prev => ({
        ...prev,
        [robotId]: event.target.files![0]
      }));
    }
  };

  const handleFileUpload = async (robotId: string) => {
    const file = fileUploads[robotId];
    if (!file) return;

    try {
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [robotId]: 0 }));
      
      const intervalId = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[robotId] || 0;
          if (currentProgress >= 100) {
            clearInterval(intervalId);
            return prev;
          }
          return { ...prev, [robotId]: currentProgress + 10 };
        });
      }, 300);

      // Wait for "upload" to complete
      setTimeout(() => {
        clearInterval(intervalId);
        setUploadProgress(prev => ({ ...prev, [robotId]: 100 }));
        
        // Update robot with file info
        const robot = robots.find(r => r.id === robotId);
        if (robot) {
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          const isZip = fileExtension === 'zip';
          
          // Create a complete updated robot object
          const updatedRobot = {
            ...robot,
            download_url: `/uploads/${file.name}` // This would be a real URL in production
          };
          
          updateRobot(robotId, updatedRobot);
          
          toast({
            title: "File uploaded",
            description: `${file.name} has been uploaded and linked to ${robot.name}.`
          });
          
          // Clear upload state
          setTimeout(() => {
            setFileUploads(prev => ({ ...prev, [robotId]: null }));
            setUploadProgress(prev => {
              const { [robotId]: _, ...rest } = prev;
              return rest;
            });
          }, 1000);
        }
      }, 3000);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <TradingLoader text="Loading robots..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Robot Management</h2>
        <Button onClick={handleAddRobot}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Robot
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search robots..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredRobots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRobots.map((robot) => (
            <Card key={robot.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{robot.name}</CardTitle>
                  <Badge>{robot.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{robot.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium">Price:</p>
                    <p>{robot.price} {robot.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Category:</p>
                    <p className="capitalize">{robot.category}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Upload Robot File:</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept=".zip,.xml"
                      onChange={(e) => handleFileSelect(e, robot.id)}
                      className="text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleFileUpload(robot.id)}
                      disabled={!fileUploads[robot.id]}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {uploadProgress[robot.id] !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress[robot.id]}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-right mt-1">{uploadProgress[robot.id]}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleEditRobot(robot)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteRobot(robot.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">No robots found. Add your first robot to the marketplace.</p>
          <Button onClick={handleAddRobot}>
            <Plus className="mr-2 h-4 w-4" />
            Add Robot
          </Button>
        </div>
      )}

      {isModalOpen && (
        <RobotManagementModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          robot={currentRobot}
          isEdit={!!currentRobot}
        />
      )}
    </div>
  );
};

export default RobotManagement;
