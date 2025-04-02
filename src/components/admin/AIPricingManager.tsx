
import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Loader2, DollarSign, CreditCard } from 'lucide-react';

// Mock data for subscription plans
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
}

const AIPricingManager = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([
    {
      id: 'basic-monthly',
      name: 'Basic AI Trading Signals',
      price: 29.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Access to AI trading signals',
        'Basic market analysis',
        'Daily signal updates',
        'Email notifications'
      ]
    },
    {
      id: 'premium-monthly',
      name: 'Premium AI Trading Signals',
      price: 99.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'All Basic features',
        'Advanced market analysis',
        'Real-time signal updates',
        'Direct AI chat support',
        'Custom alerts and notifications'
      ]
    }
  ]);

  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = (plan: PricingPlan) => {
    setEditingPlan({...plan});
    setIsDialogOpen(true);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlan) return;
    
    const newPrice = parseFloat(e.target.value);
    setEditingPlan({
      ...editingPlan,
      price: isNaN(newPrice) ? 0 : newPrice
    });
  };

  const handleSaveChanges = async () => {
    if (!editingPlan) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to update the price
      // For now, we'll just update the local state after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? editingPlan : plan
      ));
      
      setIsDialogOpen(false);
      setEditingPlan(null);
      
      toast({
        title: "Price updated",
        description: `The price for ${editingPlan.name} has been updated to ${editingPlan.currency} ${editingPlan.price}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the price. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">AI Trading Signal Pricing</h2>
      <p className="text-muted-foreground">Manage the pricing for AI trading signal subscriptions.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.interval === 'monthly' ? 'Monthly' : 'Yearly'} subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">{plan.currency} {plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleOpenDialog(plan)} className="w-full">
                Edit Price
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription Price</DialogTitle>
            <DialogDescription>
              Update the price for this AI trading signals subscription plan.
            </DialogDescription>
          </DialogHeader>
          
          {editingPlan && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Plan
                </Label>
                <div className="col-span-3 font-medium">
                  {editingPlan.name}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <div className="col-span-3 flex items-center">
                  <span className="mr-2">{editingPlan.currency}</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPlan.price}
                    onChange={handlePriceChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Interval
                </Label>
                <div className="col-span-3">
                  {editingPlan.interval === 'monthly' ? 'Monthly' : 'Yearly'}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIPricingManager;
