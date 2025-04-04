
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Robot } from '@/lib/backend'; // Import Robot type from backend

interface RobotManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (robot: Robot) => void;
  robot: Robot | null;
}

const RobotManagementModal = ({ isOpen, onClose, onSave, robot }: RobotManagementModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState<'MT5' | 'Binary'>('MT5');
  const [category, setCategory] = useState<'free' | 'paid'>('paid');
  const [featuresText, setFeaturesText] = useState('');
  const [imageUrl, setImageUrl] = useState('/placeholder.svg');

  // Initialize form when editing an existing robot
  useEffect(() => {
    if (robot) {
      setName(robot.name);
      setDescription(robot.description);
      setPrice(robot.price);
      setCurrency(robot.currency);
      setType(robot.type as 'MT5' | 'Binary'); // Cast to the expected type
      setCategory(robot.category);
      setFeaturesText(robot.features.join('\n'));
      setImageUrl(robot.imageUrl || robot.image_url || '/placeholder.svg');
    } else {
      // Reset form for new robot
      setName('');
      setDescription('');
      setPrice(0);
      setCurrency('USD');
      setType('MT5');
      setCategory('paid');
      setFeaturesText('');
      setImageUrl('/placeholder.svg');
    }
  }, [robot]);

  const handleSubmit = () => {
    // Parse features from text input (one per line)
    const features = featuresText
      .split('\n')
      .map(feature => feature.trim())
      .filter(feature => feature.length > 0);

    const robotData: Robot = {
      id: robot?.id || '',
      name,
      description,
      price: category === 'free' ? 0 : price,
      currency,
      type,
      category,
      features,
      imageUrl,
      created_at: robot?.created_at || new Date().toISOString(),
    };

    onSave(robotData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{robot ? 'Edit Robot' : 'Add New Robot'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3" 
              placeholder="e.g., MT5 Pro Scalper"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="col-span-3" 
              placeholder="Brief description of the robot"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'MT5' | 'Binary')} className="col-span-3 flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MT5" id="mt5" />
                <Label htmlFor="mt5">MT5</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Binary" id="binary" />
                <Label htmlFor="binary">Binary</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Category</Label>
            <div className="col-span-3 flex items-center space-x-4">
              <Switch 
                checked={category === 'free'} 
                onCheckedChange={(checked) => setCategory(checked ? 'free' : 'paid')} 
                id="free-switch"
              />
              <Label htmlFor="free-switch">Free Robot</Label>
            </div>
          </div>
          
          {category === 'paid' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={price.toString()} 
                  onChange={(e) => setPrice(Number(e.target.value))} 
                  className="col-span-3" 
                  min="0"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currency" className="text-right">Currency</Label>
                <Input 
                  id="currency" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)} 
                  className="col-span-3" 
                  placeholder="USD"
                />
              </div>
            </>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
            <Input 
              id="imageUrl" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
              className="col-span-3" 
              placeholder="/placeholder.svg"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="features" className="text-right pt-2">Features</Label>
            <Textarea 
              id="features" 
              value={featuresText} 
              onChange={(e) => setFeaturesText(e.target.value)} 
              className="col-span-3 min-h-24" 
              placeholder="Enter features, one per line"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RobotManagementModal;
