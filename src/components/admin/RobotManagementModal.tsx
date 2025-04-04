
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBackend } from '@/context/BackendContext';
import { Robot } from '@/lib/backend';

interface RobotManagementModalProps {
  open: boolean;
  onClose: () => void;
  robot?: Robot | null;
  isEdit: boolean;
}

const initialRobot: Omit<Robot, 'id' | 'created_at'> = {
  name: '',
  description: '',
  type: 'MT5',
  price: 0,
  currency: 'USD',
  category: 'paid',
  features: [],
  image_url: '',
  imageUrl: '',
  download_url: '',
  updated_at: undefined
};

const RobotManagementModal = ({ open, onClose, robot, isEdit }: RobotManagementModalProps) => {
  const { addRobot, updateRobot } = useBackend();
  const [robotData, setRobotData] = useState<any>(initialRobot);
  const [featuresInput, setFeaturesInput] = useState('');
  const [category, setCategory] = useState<string>(initialRobot.category);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (robot && isEdit) {
      setRobotData(robot);
      setFeaturesInput(robot.features?.join(', ') || '');
      setCategory(robot.category);
    } else {
      setRobotData(initialRobot);
      setFeaturesInput('');
      setCategory(initialRobot.category);
    }
  }, [robot, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRobotData({ ...robotData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const features = featuresInput.split(',').map(feature => feature.trim()).filter(feature => feature);
      
      // Prepare robot data with all required fields
      const completeRobotData = {
        ...robotData,
        features,
        category,
        image_url: robotData.image_url || robotData.imageUrl || '',
        imageUrl: robotData.imageUrl || robotData.image_url || '',
      };
      
      if (isEdit && robot) {
        await updateRobot({ ...completeRobotData, id: robot.id, created_at: robot.created_at });
      } else {
        await addRobot(completeRobotData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving robot:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Robot' : 'Add New Robot'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" value={robotData.name} onChange={handleChange} className="col-span-3" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" name="description" value={robotData.description} onChange={handleChange} className="col-span-3" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select 
              value={robotData.type} 
              onValueChange={(value) => setRobotData({...robotData, type: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MT5">MT5</SelectItem>
                <SelectItem value="Binary">Binary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <Input type="number" id="price" name="price" value={robotData.price} onChange={handleChange} className="col-span-3" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">Currency</Label>
            <Input id="currency" name="currency" value={robotData.currency} onChange={handleChange} className="col-span-3" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="features" className="text-right">Features</Label>
            <Textarea 
              id="features" 
              placeholder="Enter features separated by commas" 
              value={featuresInput} 
              onChange={(e) => setFeaturesInput(e.target.value)} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" value={robotData.imageUrl} onChange={handleChange} className="col-span-3" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="download_url" className="text-right">Download URL</Label>
            <Input id="download_url" name="download_url" value={robotData.download_url} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RobotManagementModal;
