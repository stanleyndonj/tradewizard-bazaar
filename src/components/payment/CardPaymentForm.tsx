
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';

interface CardPaymentFormProps {
  amount: number;
  currency: string;
  itemId: string;
  paymentType: 'purchase' | 'subscription';
  onSuccess: () => void;
  onCancel: () => void;
}

const CardPaymentForm = ({ 
  amount, 
  currency, 
  itemId,
  paymentType,
  onSuccess, 
  onCancel 
}: CardPaymentFormProps) => {
  const { toast } = useToast();
  const { processCardPayment, verifyCardPayment } = useBackend();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber.trim() || !cardName.trim() || !expiryDate.trim() || !cvv.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    // Format card number (remove spaces)
    const formattedCardNumber = cardNumber.replace(/\s+/g, '');
    
    // Basic card validation
    if (!/^\d{13,19}$/.test(formattedCardNumber)) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number",
        variant: "destructive"
      });
      return;
    }
    
    // Basic CVV validation
    if (!/^\d{3,4}$/.test(cvv)) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid CVV code",
        variant: "destructive"
      });
      return;
    }
    
    // Basic expiry date validation (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter date in MM/YY format",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      
      // Prepare card details
      const cardDetails = {
        card_number: formattedCardNumber,
        card_holder: cardName,
        expiry: expiryDate,
        cvv
      };
      
      // Process card payment
      const result = await processCardPayment(
        cardDetails,
        amount,
        currency,
        itemId,
        paymentType
      );
      
      if (result.success) {
        setPaymentStatus('success');
        toast({
          title: "Payment Successful",
          description: "Your card payment has been processed successfully!",
        });
        
        // Short delay before calling success callback
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Payment Failed",
          description: result.message || "Failed to process card payment",
          variant: "destructive"
        });
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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces after every 4 digits
    const value = e.target.value.replace(/\s+/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Auto-format MM/YY
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    setExpiryDate(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Pay with Card</h3>
        <p className="text-muted-foreground">Amount: {currency} {amount.toFixed(2)}</p>
      </div>
      
      {paymentStatus === 'idle' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="card-number"
                className="pl-10"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-name">Cardholder Name</Label>
            <Input 
              id="card-name"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input 
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryDateChange}
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
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                type="password"
                maxLength={4}
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
              onClick={() => setPaymentStatus('idle')}
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
