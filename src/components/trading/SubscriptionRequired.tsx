import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, CheckCircle, CreditCard, Smartphone, Building2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useBackend } from "@/context/BackendContext";

interface SubscriptionRequiredProps {
  message: string;
  plans?: any[];
}

const SubscriptionRequired = ({ message, plans = [] }: SubscriptionRequiredProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createSubscription } = useBackend();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribeClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
  };

  const handleProcessPayment = async () => {
    if (!selectedPlan || !paymentMethod) {
      toast({
        title: "Payment Error",
        description: "Please select a payment method to continue",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create subscription with the selected payment method
      const subscriptionData = {
        plan_id: selectedPlan.id,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        payment_method: paymentMethod
      };

      // Call the backend to create a subscription
      const response = await createSubscription(subscriptionData);

      if (response && response.id) {
        // Close dialog
        setIsDialogOpen(false);

        // Show success message
        toast({
          title: "Subscription Initiated",
          description: "Redirecting to payment...",
        });

        // Redirect based on payment method
        if (paymentMethod === 'card') {
          navigate(`/payment/card?subscription_id=${response.id}`);
        } else if (paymentMethod === 'mpesa') {
          navigate(`/payment/mpesa?subscription_id=${response.id}`);
        } else if (paymentMethod === 'bank') {
          navigate(`/payment/bank?subscription_id=${response.id}`);
        } else {
          navigate('/customer-dashboard?tab=subscription');
        }
      } else {
        throw new Error("Failed to create subscription");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
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
      <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Access premium AI-powered trading signals and market analysis to improve your trading decisions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          {plans && plans.length > 0 ? (
            plans.map((plan, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-blue-500 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardHeader>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">{plan.interval === 'monthly' ? 'Monthly' : 'Yearly'} plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold text-white">{plan.currency} {plan.price}</span>
                    <span className="text-gray-400 ml-1">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features && plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleSubscribeClick(plan)}
                  >
                    Subscribe Now
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center p-8 bg-gray-800 rounded-xl border border-gray-700">
              <p className="text-gray-300">Subscription plans are not available at the moment. Please try again later.</p>
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate('/customer-dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Choose Payment Method</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select how you'd like to pay for your subscription.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="py-4">
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-300">Selected Plan:</p>
                <h3 className="font-medium text-white">{selectedPlan.name}</h3>
                <p className="text-blue-400 font-semibold">{selectedPlan.currency} {selectedPlan.price}/{selectedPlan.interval === 'monthly' ? 'mo' : 'yr'}</p>
              </div>

              <div className="space-y-3">
                <div
                  className={`p-3 border rounded-lg flex items-center cursor-pointer transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handlePaymentMethodSelect('card')}
                >
                  <CreditCard className="h-5 w-5 mr-3 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Credit/Debit Card</p>
                    <p className="text-sm text-gray-400">Pay securely with your card</p>
                  </div>
                </div>

                <div
                  className={`p-3 border rounded-lg flex items-center cursor-pointer transition-all ${
                    paymentMethod === 'mpesa' 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handlePaymentMethodSelect('mpesa')}
                >
                  <Smartphone className="h-5 w-5 mr-3 text-green-400" />
                  <div>
                    <p className="font-medium text-white">M-PESA</p>
                    <p className="text-sm text-gray-400">Pay using M-PESA mobile money</p>
                  </div>
                </div>

                <div
                  className={`p-3 border rounded-lg flex items-center cursor-pointer transition-all ${
                    paymentMethod === 'bank' 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handlePaymentMethodSelect('bank')}
                >
                  <Building2 className="h-5 w-5 mr-3 text-yellow-400" />
                  <div>
                    <p className="font-medium text-white">Bank Transfer</p>
                    <p className="text-sm text-gray-400">Pay via direct bank transfer</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayment}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!paymentMethod || isProcessing}
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionRequired;