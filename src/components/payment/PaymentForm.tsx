
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from './PaymentMethodSelector';
import CardPaymentForm from './CardPaymentForm';
import MpesaPaymentForm from '../marketplace/MpesaPaymentForm';

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  type: 'subscription' | 'purchase';
}

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentItem;
  onPaymentComplete: () => void;
}

const PaymentForm = ({ isOpen, onClose, item, onPaymentComplete }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  
  const handlePaymentComplete = () => {
    // Allow time for success message to be seen
    setTimeout(() => {
      onPaymentComplete();
    }, 1500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            {item.name} - {item.currency} {item.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="card" value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card">Card Payment</TabsTrigger>
            <TabsTrigger value="mpesa">M-PESA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="py-4">
            <CardPaymentForm 
              amount={item.price}
              currency={item.currency}
              itemId={item.id}
              paymentType={item.type}
              onSuccess={handlePaymentComplete}
              onCancel={onClose}
            />
          </TabsContent>
          
          <TabsContent value="mpesa" className="py-4">
            <MpesaPaymentForm 
              amount={item.price}
              itemId={item.id}
              paymentType={item.type}
              onSuccess={handlePaymentComplete}
              onCancel={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
