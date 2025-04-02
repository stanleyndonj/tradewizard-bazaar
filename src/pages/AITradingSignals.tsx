
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import { TradingLoader } from '@/components/ui/loader';
import Navbar from '@/components/layout/Navbar';
import SubscriptionRequired from '@/components/trading/SubscriptionRequired';
import { toast } from '@/hooks/use-toast';

const AITradingSignals = () => {
  const { user } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = 'AI Trading Signals | TradeWizard';
    
    // Simulate checking if user has active subscription
    const checkSubscription = async () => {
      if (user) {
        // In a real app, this would be an API call to check subscription status
        // For now, we'll use a mock check based on the robots_delivered field
        setHasSubscription(!!user.robots_delivered);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [user]);

  // If not logged in, redirect to auth page
  if (user === null) {
    // Save current URL to redirect back after login
    localStorage.setItem('redirectAfterAuth', '/ai-trading-signals');
    toast({
      title: "Authentication required",
      description: "Please sign in to access AI Trading Signals",
      variant: "destructive",
    });
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 px-4 max-w-7xl mt-20 flex-grow flex items-center justify-center">
          <TradingLoader text="Loading AI Trading Signals..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto py-8 px-4 max-w-7xl mt-20 flex-grow">
        <h1 className="text-4xl font-bold mb-6">AI Trading Signals</h1>
        
        {hasSubscription ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Market Analysis</h2>
              <p className="text-muted-foreground mb-4">
                AI-powered market analysis and trading signals will appear here.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">This is where trading signals content will be displayed.</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Signal History</h2>
              <p className="text-muted-foreground mb-4">
                View your previous signals and their performance.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Signal history will be displayed here.</p>
              </div>
            </div>
          </div>
        ) : (
          <SubscriptionRequired />
        )}
      </div>
    </div>
  );
};

export default AITradingSignals;
