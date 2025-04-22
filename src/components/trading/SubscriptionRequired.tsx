import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useBackend } from "@/context/BackendContext";
import EnhancedPaymentModal from "@/components/marketplace/EnhancedPaymentModal";

interface SubscriptionRequiredProps {
  message: string;
  plans?: any[];
}

const SubscriptionRequired = ({ message, plans = [] }: SubscriptionRequiredProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribeToPlan } = useBackend();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleSubscribeClick = (plan: any) => {
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      description: `${plan.name} - ${plan.interval === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
      price: plan.price,
      currency: plan.currency,
      type: 'subscription'
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async () => {
    setIsPaymentModalOpen(false);
    
    try {
      // Show success message
      toast({
        title: "Subscription Successful",
        description: "You now have access to AI Trading Signals",
      });
      
      // Refresh or redirect
      navigate('/ai-trading-signals/signals');
      window.location.reload();
    } catch (error) {
      console.error("Error finalizing subscription:", error);
      toast({
        title: "Subscription Error",
        description: "There was a problem completing your subscription. Please contact support.",
        variant: "destructive",
      });
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

      {/* Enhanced Payment Modal */}
      {isPaymentModalOpen && selectedPlan && (
        <EnhancedPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          item={selectedPlan}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default SubscriptionRequired;