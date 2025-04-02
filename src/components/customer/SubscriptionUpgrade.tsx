
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
import { Loader2, CheckCircle, DollarSign, CreditCard, Smartphone, Landmark } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubscriptionUpgradeProps {
  onSubscribe?: () => void;
}

const SubscriptionUpgrade = ({ onSubscribe }: SubscriptionUpgradeProps) => {
  const { getSubscriptionPrices, user } = useBackend();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubscribing(true);
      // In a real implementation, we would call an API to initiate the subscription
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast({
        title: "Success",
        description: `Your subscription has been activated using ${paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}`,
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

  const handleBackToPlans = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
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

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleBackToPlans} className="h-8 w-8 p-0">←</Button>
          <h2 className="text-2xl font-bold">Complete Your Subscription</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{selectedPlan.name}</CardTitle>
            <CardDescription>{selectedPlan.interval === 'monthly' ? 'Monthly' : 'Yearly'} subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold">{selectedPlan.currency} {selectedPlan.price}</span>
              <span className="text-muted-foreground ml-1">/{selectedPlan.interval === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            
            <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod} className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Card</span>
                </TabsTrigger>
                <TabsTrigger value="mpesa" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>M-Pesa</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  <span>Bank</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="card" className="mt-4">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM/YY" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input id="cardholderName" placeholder="John Doe" required />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={subscribing}
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete Payment'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="mpesa" className="mt-4">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="e.g., 07XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You will receive an M-Pesa prompt on your phone to complete the payment.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={subscribing}
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Pay with M-Pesa'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="bank" className="mt-4">
                <div className="border p-4 rounded-md bg-muted/50 mb-4">
                  <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                  <div className="text-sm space-y-2">
                    <p>Bank: <span className="font-medium">TradeWizard Bank</span></p>
                    <p>Account Number: <span className="font-medium">1234567890</span></p>
                    <p>Account Name: <span className="font-medium">TradeWizard Ltd</span></p>
                    <p>Reference: <span className="font-medium">AI-{user?.id?.substring(0, 8)}</span></p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  After making the transfer, click the button below to confirm your payment.
                </p>
                
                <Button 
                  className="w-full"
                  onClick={handlePaymentSubmit}
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Bank Transfer'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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
          <Card key={plan.id} className="flex flex-col hover:shadow-md transition-shadow">
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
                onClick={() => handlePlanSelect(plan)} 
                className="w-full" 
              >
                Select Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionUpgrade;
