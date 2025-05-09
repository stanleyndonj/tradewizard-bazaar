
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, CreditCard, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubscriptionRequiredProps {
  message?: string;
  plans?: any[];
}

const SubscriptionRequired = ({ message = "Subscribe to access this feature", plans = [] }: SubscriptionRequiredProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribeToPlan, user } = useBackend();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'bank'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Use default plans if none provided
  const subscriptionPlans = plans.length > 0 ? plans : [
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
  ];

  const handleSubscribeClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing and subscription
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Subscription Successful",
        description: `You now have access to ${selectedPlan.name}`,
      });
      
      // Close the modal
      setIsPaymentModalOpen(false);
      
      // Refresh the page to update access
      setTimeout(() => {
        navigate('/ai-trading-signals/signals');
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl"
      >
        <div className="text-center mb-10">
          <Shield className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade Your Trading Experience</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            {message}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
            >
              {/* Header with gradient accent */}
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                    {plan.interval === 'monthly' ? 'Monthly' : 'Yearly'}
                  </span>
                </div>
                
                <div className="flex items-baseline mb-6">
                  {plan.currency === 'USD' ? (
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      ${typeof plan.price === 'number' ? plan.price.toFixed(2) : plan.price}
                    </span>
                  ) : (
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {plan.currency} {typeof plan.price === 'number' ? plan.price.toFixed(2) : plan.price}
                    </span>
                  )}
                  <span className="text-gray-400 ml-2 text-sm">/ {plan.interval === 'monthly' ? 'month' : 'year'}</span>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6"></div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start group">
                      <div className="rounded-full bg-blue-900/20 p-1 mr-3 group-hover:bg-blue-800/40 transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
                  onClick={() => handleSubscribeClick(plan)}
                >
                  Upgrade Now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center text-gray-400 text-sm">
          <p>By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-2">Need help? Contact our support team.</p>
        </div>
      </motion.div>

      {/* Payment Method Selection Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Complete Your Subscription</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPlan && (
                <>Subscribe to {selectedPlan.name} for ${selectedPlan.price}/{selectedPlan.interval}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="mpesa" className="data-[state=active]:bg-blue-600">
                <Phone className="mr-2 h-4 w-4" />
                M-Pesa
              </TabsTrigger>
              <TabsTrigger value="card" className="data-[state=active]:bg-blue-600">
                <CreditCard className="mr-2 h-4 w-4" />
                Card
              </TabsTrigger>
              <TabsTrigger value="bank" className="data-[state=active]:bg-blue-600">
                <Building className="mr-2 h-4 w-4" />
                Bank
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mpesa" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
                <p className="text-xs text-gray-400">Enter your M-Pesa registered phone number</p>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  placeholder="John Smith"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="4242 4242 4242 4242"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h4 className="font-medium text-white mb-2">Bank Transfer Details</h4>
                <p className="text-sm text-gray-300 mb-1">Account Name: TradeWizard Ltd</p>
                <p className="text-sm text-gray-300 mb-1">Account Number: 1234567890</p>
                <p className="text-sm text-gray-300 mb-1">Bank: Standard Chartered</p>
                <p className="text-sm text-gray-300 mb-3">Reference: {user?.email || 'Your Email'}</p>
                <p className="text-xs text-gray-400">After making the transfer, please contact support with your payment reference.</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isProcessing}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentSubmit}
              disabled={isProcessing || paymentMethod === 'bank'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? "Processing..." : "Complete Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionRequired;
