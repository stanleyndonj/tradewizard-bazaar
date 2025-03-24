
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";

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

interface RobotManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (robot: Robot) => void;
  robot: Robot | null;
}

const RobotManagementModal = ({ isOpen, onClose, onSave, robot }: RobotManagementModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [type, setType] = useState<'MT5' | 'Binary'>("MT5");
  const [category, setCategory] = useState<'free' | 'paid'>("free");
  const [features, setFeatures] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState("/placeholder.svg");
  
  useEffect(() => {
    if (robot) {
      setName(robot.name);
      setDescription(robot.description);
      setPrice(robot.price.toString());
      setCurrency(robot.currency);
      setType(robot.type);
      setCategory(robot.category);
      setFeatures(robot.features.length > 0 ? robot.features : [""]);
      setImageUrl(robot.imageUrl);
    } else {
      // Default values for new robot
      setName("");
      setDescription("");
      setPrice("0");
      setCurrency("USD");
      setType("MT5");
      setCategory("free");
      setFeatures([""]);
      setImageUrl("/placeholder.svg");
    }
  }, [robot]);
  
  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };
  
  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures.length > 0 ? newFeatures : [""]);
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  
  const handleSave = () => {
    // Filter out empty features
    const cleanedFeatures = features.filter(feature => feature.trim() !== "");
    
    // If category is free, force price to 0
    const finalPrice = category === 'free' ? 0 : parseFloat(price);
    
    const updatedRobot: Robot = {
      id: robot?.id || "temp-id", // Will be replaced with a real ID when saving
      name,
      description,
      price: finalPrice,
      currency,
      type,
      category,
      features: cleanedFeatures.length > 0 ? cleanedFeatures : ["Basic trading robot"],
      imageUrl
    };
    
    onSave(updatedRobot);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{robot ? "Edit Robot" : "Add New Robot"}</DialogTitle>
          <DialogDescription>
            {robot 
              ? "Update the details of this trading robot" 
              : "Fill in the details to add a new trading robot to the marketplace"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="robot-name">Robot Name</Label>
              <Input
                id="robot-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter robot name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="robot-type">Robot Type</Label>
              <Select 
                value={type} 
                onValueChange={(value: 'MT5' | 'Binary') => setType(value)}
              >
                <SelectTrigger id="robot-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT5">MT5</SelectItem>
                  <SelectItem value="Binary">Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="robot-description">Description</Label>
            <Textarea
              id="robot-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter robot description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="robot-category">Category</Label>
              <Select 
                value={category} 
                onValueChange={(value: 'free' | 'paid') => setCategory(value)}
              >
                <SelectTrigger id="robot-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="robot-currency">Currency</Label>
                <Select 
                  value={currency} 
                  onValueChange={setCurrency}
                  disabled={category === 'free'}
                >
                  <SelectTrigger id="robot-currency">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="robot-price">Price</Label>
                <Input
                  id="robot-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={category === 'free'}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Features</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddFeature}
                className="h-8 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Feature
              </Button>
            </div>
            
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveFeature(index)}
                    disabled={features.length === 1}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="robot-image">Image URL</Label>
            <Input
              id="robot-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL or path"
            />
            <p className="text-xs text-muted-foreground">
              Leave as default to use placeholder image
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-trading-blue hover:bg-trading-darkBlue">
            {robot ? "Update Robot" : "Add Robot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RobotManagementModal;
