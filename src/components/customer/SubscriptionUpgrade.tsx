import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBackend } from '@/context/BackendContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PaymentForm, { PaymentItem } from '@/components/payment/PaymentForm';
import { SubscriptionPlan } from '@/lib/backend';

interface SubscriptionUpgradeProps {
  onSubscribe?: () => void;
}

const SubscriptionUpgrade = ({ onSubscribe }: SubscriptionUpgradeProps) => {
  const { user, getSubscriptionPlans } = useBackend();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentItem | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const plansData = await getSubscriptionPlans();
      if (plansData && Array.isArray(plansData)) {
        // Compare with existing plans to see if prices have changed
        const pricesChanged = plans.length > 0 && plansData.some((newPlan, index) => 
          index < plans.length && newPlan.price !== plans[index].price
        );

        setPlans(plansData);

        // Notify user if prices have changed and it's not the initial load
        if (pricesChanged && plans.length > 0 && !silent) {
          toast({
            title: "Pricing Updated",
            description: "Subscription prices have been updated by the administrator.",
            variant: "default",
          });
        }
      } else {
        throw new Error('Invalid plans data format');
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      type: 'subscription'
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);

    toast({
      title: "Subscription successful",
      description: "You now have access to AI Trading Signals",
    });

    if (onSubscribe) {
      onSubscribe();
    } else {
      // Refresh the page to update access
      window.location.reload();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl"
    >
      <div className="text-center mb-10">
        <Shield className="h-16 w-16 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Upgrade Your Trading Experience</h2>
        <p className="text-gray-400">
          Gain access to our powerful AI-driven trading signals and market analysis
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
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
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Loading...
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

      {isPaymentModalOpen && selectedPlan && (
        <PaymentForm
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          item={selectedPlan}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </motion.div>
  );
};

export default SubscriptionUpgrade;