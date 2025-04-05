
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popularity?: 'popular' | 'best';
}

const SubscriptionUpgrade = () => {
  const { getSubscriptionPrices } = useBackend();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      setIsLoading(true);
      try {
        const prices = await getSubscriptionPrices();
        
        // Convert subscription prices to plans
        const planData: Plan[] = [
          {
            id: 'basic',
            name: 'Basic Plan',
            price: prices.basic || 29,
            features: [
              'Access to 5 trading robots',
              'Basic market analysis',
              'Email support',
              'Weekly trading signals'
            ]
          },
          {
            id: 'premium',
            name: 'Premium Plan',
            price: prices.premium || 79,
            features: [
              'Access to 15 trading robots',
              'Advanced market analysis',
              'Priority email & chat support',
              'Daily trading signals',
              'Customization options'
            ],
            popularity: 'popular'
          },
          {
            id: 'enterprise',
            name: 'Enterprise Plan',
            price: prices.enterprise || 199,
            features: [
              'Unlimited trading robots',
              'Real-time market analysis',
              '24/7 dedicated support',
              'Real-time trading signals',
              'Advanced customization',
              'API access',
              'Custom robot development'
            ],
            popularity: 'best'
          }
        ];
        
        setPlans(planData);
      } catch (error) {
        console.error('Error loading subscription prices:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrices();
  }, [getSubscriptionPrices]);

  const handleUpgrade = (planId: string) => {
    // Placeholder for upgrade functionality
    toast({
      title: "Subscription Update",
      description: `You'll be redirected to the payment page for the ${planId} plan shortly.`,
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Upgrade Your Subscription</h2>
        <p className="text-muted-foreground mt-2">Choose the plan that best fits your trading needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${plan.popularity ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>For {plan.id === 'basic' ? 'beginner' : plan.id === 'premium' ? 'serious' : 'professional'} traders</CardDescription>
                </div>
                
                {plan.popularity && (
                  <Badge variant={plan.popularity === 'popular' ? 'default' : 'secondary'}>
                    {plan.popularity === 'popular' ? 'Popular' : 'Best Value'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.popularity ? 'default' : 'outline'}
                onClick={() => handleUpgrade(plan.id)}
              >
                {plan.id === 'basic' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionUpgrade;
