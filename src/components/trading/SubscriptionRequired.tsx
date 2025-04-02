
import React from 'react';
import SubscriptionUpgrade from '@/components/customer/SubscriptionUpgrade';
import { Button } from '@/components/ui/button';

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
    return <SubscriptionUpgrade onSubscribe={handleSubscriptionComplete} />;
  }
  
  return (
    <div className="p-12 bg-muted/30 rounded-lg text-center">
      <h3 className="text-2xl font-semibold mb-4">{message}</h3>
      <p className="text-muted-foreground mb-6">
        Upgrade to a premium subscription to unlock all AI trading features.
      </p>
      <div className="flex justify-center gap-4">
        <Button onClick={handleUpgradeClick}>
          View Subscription Plans
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionRequired;
