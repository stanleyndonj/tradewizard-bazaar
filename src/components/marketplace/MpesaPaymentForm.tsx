
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { Loader2, CheckCircle, XCircle, Smartphone } from 'lucide-react';

interface MpesaPaymentFormProps {
  amount: number;
  itemId: string;
  paymentType?: 'purchase' | 'subscription';
  onSuccess: () => void;
  onCancel: () => void;
}

const MpesaPaymentForm = ({ 
  amount, 
  itemId, 
  paymentType = 'purchase',
  onSuccess, 
  onCancel 
}: MpesaPaymentFormProps) => {
  const { toast } = useToast();
  const { initiateMpesaPayment, verifyPayment } = useBackend();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    // Format phone number to ensure it has country code (Kenya)
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = `254${formattedPhone}`;
    }

    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      
      // Initiate M-Pesa payment
      const response = await initiateMpesaPayment(formattedPhone, amount, itemId, paymentType);
      
      if (response && response.transaction_id) {
        setTransactionId(response.transaction_id);
        
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the M-Pesa prompt and enter your PIN",
        });
        
        // Start checking payment status
        checkPaymentStatus(response.transaction_id);
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to initiate M-Pesa payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (txnId: string) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 5000; // 5 seconds
    
    const checkStatus = async () => {
      try {
        const isSuccess = await verifyPayment(txnId);
        if (isSuccess) {
          setPaymentStatus('success');
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully!",
          });
          setTimeout(() => {
            onSuccess();
          }, 2000);
          return;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          toast({
            title: "Payment Verification Failed",
            description: "We couldn't verify your payment. Please contact support if funds were deducted.",
            variant: "destructive"
          });
          return;
        }
        
        // Check again after interval
        setTimeout(checkStatus, interval);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('failed');
      }
    };
    
    // Start checking
    checkStatus();
  };

  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Pay with M-Pesa</h3>
        <p className="text-muted-foreground">Amount: KES {amount.toFixed(2)}</p>
      </div>
      
      {paymentStatus === 'idle' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="phone"
                className="pl-10"
                type="tel"
                placeholder="e.g., 0712345678 or 254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter your M-Pesa phone number</p>
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
              Please check your phone for the M-Pesa prompt and enter your PIN
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={onCancel}
          >
            Cancel
          </Button>
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
                setTransactionId(null);
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

export default MpesaPaymentForm;
