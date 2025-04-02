
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
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, DollarSign } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';

interface SubscriptionUpgradeProps {
  onSubscribe?: () => void;
}

const SubscriptionUpgrade = ({ onSubscribe }: SubscriptionUpgradeProps) => {
  const { getSubscriptionPrices, user } = useBackend();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const pricingData = await getSubscriptionPrices();
        setPlans(pricingData);
      } catch (error) {
        console.error('Error loading subscription prices:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription options",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPrices();
  }, [getSubscriptionPrices]);

  const handleSubscribe = async (planId) => {
    try {
      setSubscribing(true);
      // In a real implementation, we would call an API to initiate the subscription
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Your subscription has been activated",
      });
      
      if (onSubscribe) {
        onSubscribe();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading subscription options...</span>
      </div>
    );
  }

  // Check if user already has a subscription
  const hasSubscription = user?.robots_delivered;

  if (hasSubscription) {
    return (
      <div className="text-center p-12 bg-muted/30 rounded-lg">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">You're already subscribed!</h3>
        <p className="text-muted-foreground">
          You already have an active subscription to our AI Trading Signals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Upgrade to AI Trading Signals</h2>
        <p className="text-lg text-muted-foreground mt-2">
          Choose a plan that works for you
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.interval === 'monthly' ? 'Monthly' : 'Yearly'} subscription</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
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
              <Button 
                onClick={() => handleSubscribe(plan.id)} 
                className="w-full" 
                disabled={subscribing}
              >
                {subscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionUpgrade;
