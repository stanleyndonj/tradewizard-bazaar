
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Check, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBackend } from '@/context/BackendContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionRequiredProps {
  message: string;
  plans?: any[];
}

const SubscriptionRequired = ({ message, plans = [] }: SubscriptionRequiredProps) => {
  const navigate = useNavigate();
  const { purchaseRobot, user } = useBackend();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async (planId: string, price: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsProcessing(true);
    try {
      // Mock robot ID for subscription purchase
      const subscriptionRobotId = "subscription-" + planId;
      
      await purchaseRobot(
        subscriptionRobotId,
        price,
        'USD',
        'card'
      );

      toast({
        title: "Subscription successful",
        description: "You now have access to AI Trading Signals",
      });

      // Refresh the page to update access
      window.location.reload();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Default plans if none are provided
  const defaultPlans = [
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

  const displayPlans = plans && plans.length > 0 ? plans : defaultPlans;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl"
    >
      <div className="text-center mb-10">
        <Shield className="h-16 w-16 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
        <p className="text-gray-400">
          Gain access to our powerful AI-driven trading signals and market analysis
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {displayPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">{plan.currency} {plan.price}</span>
                <span className="ml-1 text-gray-400">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                onClick={() => handleSubscribe(plan.id, plan.price)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe Now
                  </>
                )}
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
  );
};

export default SubscriptionRequired;
