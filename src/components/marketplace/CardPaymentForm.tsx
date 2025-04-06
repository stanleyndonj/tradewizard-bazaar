
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Calendar,
  Lock 
} from 'lucide-react';

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
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber.trim() || !cardHolder.trim() || !expiryDate.trim() || !cvv.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    const cardDetails = {
      number: cardNumber.replace(/\s/g, ''),
      holder: cardHolder,
      expiry: expiryDate,
      cvv: cvv
    };

    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      
      // Process card payment
      const response = await processCardPayment(cardDetails, amount, 'USD', itemId, paymentType);
      
      if (response && response.payment_id) {
        setPaymentId(response.payment_id);
        
        toast({
          title: "Payment Processing",
          description: "Your card payment is being processed",
        });
        
        // Verify payment status
        checkPaymentStatus(response.payment_id);
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

  const checkPaymentStatus = async (id: string) => {
    try {
      const paymentStatus = await verifyCardPayment(id);
      
      if (paymentStatus && paymentStatus.status === 'succeeded') {
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
          description: "Your payment could not be processed. Please try again or use a different card.",
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

  // Format card number with spaces for readability
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

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
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
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="cardNumber"
                className="pl-10"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardHolder">Card Holder</Label>
            <Input 
              id="cardHolder"
              placeholder="John Doe"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="expiryDate"
                  className="pl-10"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="cvv"
                  className="pl-10"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>* For testing, use card number 4242 4242 4242 4242 with any future expiry date and any CVV.</p>
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
              Your card payment has been processed successfully
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
              We couldn't process your payment. Please try again or use a different card.
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
