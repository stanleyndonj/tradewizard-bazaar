
import React from 'react';
import SubscriptionUpgrade from '@/components/customer/SubscriptionUpgrade';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface SubscriptionRequiredProps {
  message?: string;
  onUpgrade?: () => void;
  onClose?: () => void;
}

const SubscriptionRequired = ({ 
  message = "You need to subscribe to access AI Trading Signals", 
  onUpgrade,
  onClose 
}: SubscriptionRequiredProps) => {
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  
  const handleUpgradeClick = () => {
    setShowUpgrade(true);
    if (onUpgrade) {
      onUpgrade();
    }
  };
  
  const handleSubscriptionComplete = () => {
    if (onClose) {
      onClose();
    }
  };
  
  if (showUpgrade) {
    // Now we're only using the SubscriptionUpgrade component without any props
    // since its implementation doesn't accept any props
    return <SubscriptionUpgrade />;
  }
  
  return (
    <div className="p-12 bg-muted/30 rounded-lg">
      <div className="text-center max-w-2xl mx-auto">
        <Bot className="h-16 w-16 mx-auto mb-6 text-trading-blue" />
        <h3 className="text-2xl font-semibold mb-4">{message}</h3>
        <p className="text-muted-foreground mb-6">
          Unlock powerful AI trading signals, real-time market analysis, and personalized trading insights with a premium subscription.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleUpgradeClick}
            className="px-8 py-6 text-lg"
          >
            View Subscription Plans
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-medium mb-2">Real-Time Signals</h4>
          <p className="text-sm text-muted-foreground">
            Get instant access to AI-powered trading signals for forex, crypto, and stocks.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-medium mb-2">Market Analysis</h4>
          <p className="text-sm text-muted-foreground">
            Detailed technical and fundamental analysis of market conditions.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-medium mb-2">AI Assistant</h4>
          <p className="text-sm text-muted-foreground">
            Chat with our AI to get personalized trading advice and chart analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
