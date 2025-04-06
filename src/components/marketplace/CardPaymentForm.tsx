
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';

interface CardPaymentFormProps {
  amount: number;
  itemId: string;
  paymentType?: 'purchase' | 'subscription';
  onSuccess: () => void;
  onCancel: () => void;
}

export const CardPaymentForm = ({
  amount,
  itemId,
  paymentType = 'purchase',
  onSuccess,
  onCancel
}: CardPaymentFormProps) => {
  const { toast } = useToast();
  const { processCardPayment, verifyCardPayment } = useBackend();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !cardHolderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      
      // Process card payment
      const cardDetails = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate,
        cvv,
        cardHolderName
      };
      
      const response = await processCardPayment(cardDetails, amount, 'USD', itemId, paymentType);
      
      if (response && response.payment_id) {
        setPaymentId(response.payment_id);
        
        // Start verifying payment
        verifyCardPaymentStatus(response.payment_id);
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (error) {
      console.error('Card payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process card payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCardPaymentStatus = async (id: string) => {
    try {
      const result = await verifyCardPayment(id);
      
      if (result && result.status === 'success') {
        setPaymentStatus('success');
        toast({
          title: "Payment Successful",
          description: "Your card payment has been processed successfully!",
        });
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Payment Failed",
          description: "We couldn't process your payment. Please try again or use a different method.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying card payment:', error);
      setPaymentStatus('failed');
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your payment status. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Pay with Card</h3>
        <p className="text-muted-foreground">Amount: USD {amount.toFixed(2)}</p>
      </div>
      
      {paymentStatus === 'idle' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardHolderName">Cardholder Name</Label>
            <Input 
              id="cardHolderName"
              placeholder="John Doe"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="cardNumber"
                className="pl-10"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input 
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                maxLength={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input 
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                type="password"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Pay Now
            </Button>
          </div>
        </form>
      )}
      
      {paymentStatus === 'processing' && (
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <div>
            <h4 className="font-medium">Processing Payment</h4>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your payment
            </p>
          </div>
        </div>
      )}
      
      {paymentStatus === 'success' && (
        <div className="text-center space-y-4">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
          <div>
            <h4 className="font-medium">Payment Successful!</h4>
            <p className="text-sm text-muted-foreground">
              Your transaction has been completed successfully
            </p>
          </div>
        </div>
      )}
      
      {paymentStatus === 'failed' && (
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 mx-auto text-red-500" />
          <div>
            <h4 className="font-medium">Payment Failed</h4>
            <p className="text-sm text-muted-foreground">
              We couldn't process your payment. Please try again or use a different method.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setPaymentStatus('idle');
                setPaymentId(null);
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPaymentForm;
