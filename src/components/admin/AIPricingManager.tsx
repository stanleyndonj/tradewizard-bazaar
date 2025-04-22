
import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Loader2, DollarSign, CreditCard, CheckCircle2 } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { motion } from 'framer-motion';

// Interface for subscription plans
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
}

const AIPricingManager = () => {
  const { updateSubscriptionPrice, getSubscriptionPrices } = useBackend();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load subscription plans on component mount
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setInitialLoading(true);
      console.log("Loading subscription prices...");
      
      // Use default plans as fallback if API call fails
      const defaultPlans = [
        {
          id: 'basic-monthly',
          name: 'Basic AI Trading Signals',
          price: 29.99,
          currency: 'USD',
          interval: 'monthly' as const,
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
          interval: 'monthly' as const,
          features: [
            'All Basic features',
            'Advanced market analysis',
            'Real-time signal updates',
            'Direct AI chat support',
            'Custom alerts and notifications'
          ]
        }
      ];
      
      try {
        // Add a short delay to ensure backend sync
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const pricingData = await getSubscriptionPrices();
        console.log("API response for pricing data:", pricingData);
        
        if (pricingData && Array.isArray(pricingData) && pricingData.length > 0) {
          console.log("Successfully loaded pricing data:", pricingData);
          setPlans(pricingData);
        } else {
          console.warn("No pricing data returned from API, using default plans");
          setPlans(defaultPlans);
          
          // Show toast to admin
          toast({
            title: "Using default pricing",
            description: "No pricing data found in database. Default plans loaded.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error in API call for subscription prices:', error);
        setPlans(defaultPlans);
        
        toast({
          title: "API Connection Error",
          description: "Could not connect to pricing API. Using default pricing plans.",
          variant: "destructive",
        });
      }
    } finally {
      setInitialLoading(false);
    }
  };

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
    
    // Validate price before sending
    if (isNaN(editingPlan.price) || editingPlan.price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Attempting to update price for plan ${editingPlan.id} to ${editingPlan.price}`);
      
      // Format price to 2 decimal places
      const formattedPrice = parseFloat(editingPlan.price.toFixed(2));
      
      // Update the price in the backend
      const success = await updateSubscriptionPrice(editingPlan.id, formattedPrice);
      
      if (success) {
        // Store updated plan with formatted price
        const updatedPlan = {
          ...editingPlan,
          price: formattedPrice
        };
        
        // Immediately update local state
        setPlans(plans.map(plan => 
          plan.id === updatedPlan.id ? updatedPlan : plan
        ));
        
        setIsDialogOpen(false);
        setEditingPlan(null);
        
        toast({
          title: "Price updated successfully",
          description: `The price for ${updatedPlan.name} has been updated to ${updatedPlan.currency} ${formattedPrice}`,
          variant: "default",
        });
        
        // Add a small delay before reloading plans
        setTimeout(async () => {
          // Reload plans to ensure we have the latest data
          await loadPlans();
        }, 1000);
      } else {
        throw new Error("Backend returned unsuccessful status");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to update the price. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loader while initially loading
  if (initialLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading subscription prices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight">AI Trading Signal Pricing</h2>
        <p className="text-muted-foreground">Manage the pricing for AI trading signal subscriptions.</p>
      </motion.div>
      
      <div className="flex justify-end mb-4">
        <Button 
          onClick={loadPlans} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Loader2 className="h-4 w-4" />
          Refresh Plans
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow bg-gray-800 border-gray-700 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">{plan.interval === 'monthly' ? 'Monthly' : 'Yearly'} subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-white">{plan.currency} {plan.price}</span>
                  <span className="text-gray-400 ml-1">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleOpenDialog(plan)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Edit Price
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!isLoading) setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 border border-gray-700 text-white shadow-2xl animate-in fade-in-90 slide-in-from-bottom-10 duration-300">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-400" />
              Edit Subscription Price
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the price for this AI trading signals subscription plan. Changes will be visible to all users.
            </DialogDescription>
          </DialogHeader>
          
          {editingPlan && (
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-gray-300">
                  Plan
                </Label>
                <div className="col-span-3 font-medium text-white bg-gray-700/50 p-2 rounded-md border border-gray-600">
                  {editingPlan.name}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right text-gray-300">
                  Price
                </Label>
                <div className="col-span-3 flex items-center">
                  <div className="flex-shrink-0 bg-gray-700 border border-gray-600 text-blue-300 font-medium px-3 py-2 rounded-l-md">
                    {editingPlan.currency}
                  </div>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPlan.price}
                    onChange={handlePriceChange}
                    className="bg-gray-700 border-l-0 border-gray-600 text-white rounded-l-none focus-visible:ring-blue-500"
                    placeholder="Enter new price"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-gray-300">
                  Interval
                </Label>
                <div className="col-span-3 text-white bg-gray-700/50 p-2 rounded-md border border-gray-600 capitalize">
                  {editingPlan.interval}
                </div>
              </div>
              
              <div className="text-sm text-gray-400 bg-blue-900/20 p-3 rounded-md border border-blue-800/30 mt-2">
                <p className="flex items-start">
                  <DollarSign className="h-4 w-4 mr-2 text-blue-400 mt-0.5 flex-shrink-0" />
                  Price changes will be immediately visible to users and will affect new subscriptions.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white transition-colors ${isLoading ? 'opacity-90' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Price Change
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIPricingManager;
