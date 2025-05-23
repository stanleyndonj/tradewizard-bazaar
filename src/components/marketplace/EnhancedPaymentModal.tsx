
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Phone } from 'lucide-react';
import { CardPaymentForm } from './CardPaymentForm';
import MpesaPaymentForm from './MpesaPaymentForm';
import { toast } from '@/hooks/use-toast';

interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  type: 'robot' | 'subscription';
}

interface EnhancedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentItem;
  onPaymentComplete: () => void;
}

const EnhancedPaymentModal = ({
  isOpen,
  onClose,
  item,
  onPaymentComplete
}: EnhancedPaymentModalProps) => {
  const [activeTab, setActiveTab] = useState<string>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    toast({
      title: "Payment successful",
      description: `Your ${item.type === 'subscription' ? 'subscription' : 'purchase'} was completed successfully.`,
      variant: "default",
    });
    onPaymentComplete();
  };

  const handleError = (error: any) => {
    toast({
      title: "Payment failed",
      description: error?.message || "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  // Convert item.type to expected paymentType
  const getPaymentType = (): 'purchase' | 'subscription' => {
    return item.type === 'subscription' ? 'subscription' : 'purchase';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          <div className="mb-6 space-y-2">
            <h3 className="font-medium text-lg">{item.name}</h3>
            {item.description && (
              <p className="text-muted-foreground text-sm">{item.description}</p>
            )}
            <div className="text-xl font-bold">
              {item.currency} {item.price.toFixed(2)}
            </div>
          </div>

          <Tabs defaultValue="card" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="card" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Card Payment
              </TabsTrigger>
              <TabsTrigger value="mpesa" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                M-Pesa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card">
              <CardPaymentForm 
                amount={item.price}
                itemId={item.id}
                paymentType={getPaymentType()}
                onSuccess={handleSuccess}
                onCancel={onClose}
                onError={handleError}
                onSubmitStateChange={setIsSubmitting}
              />
            </TabsContent>

            <TabsContent value="mpesa">
              <MpesaPaymentForm 
                amount={item.price}
                itemId={item.id}
                paymentType={getPaymentType()}
                onSuccess={handleSuccess}
                onCancel={onClose}
                onError={handleError}
                onSubmitStateChange={setIsSubmitting}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedPaymentModal;
