
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Landmark, Phone } from 'lucide-react';
import MpesaPaymentForm from './MpesaPaymentForm';

interface EnhancedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  onPaymentComplete: (paymentMethod: string) => void;
}

const EnhancedPaymentModal = ({ isOpen, onClose, robot, onPaymentComplete }: EnhancedPaymentModalProps) => {
  const [activeTab, setActiveTab] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      onPaymentComplete('Credit Card');
      setIsSubmitting(false);
    }, 1500);
  };

  const handleBankTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentComplete('Bank Transfer');
  };

  const handleMpesaSuccess = () => {
    onPaymentComplete('M-Pesa');
  };

  // Calculate price in KES for M-Pesa (assuming USD to KES conversion rate of 130)
  const mpesaAmount = robot.currency === 'USD' ? robot.price * 130 : robot.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {robot.name} - {robot.currency} {robot.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="card" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 gap-2 mb-6">
            <TabsTrigger value="card" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Card</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center space-x-2">
              <Landmark className="h-4 w-4" />
              <span>Bank</span>
            </TabsTrigger>
            <TabsTrigger value="mpesa" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>M-Pesa</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card">
            <form onSubmit={handleCardPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input 
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input 
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
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
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input 
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="bank">
            <form onSubmit={handleBankTransfer} className="space-y-4">
              <div className="border p-4 rounded-md bg-muted/50">
                <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                <div className="text-sm space-y-2">
                  <p>Bank: <span className="font-medium">TradeWizard Bank</span></p>
                  <p>Account Number: <span className="font-medium">1234567890</span></p>
                  <p>Account Name: <span className="font-medium">TradeWizard Ltd</span></p>
                  <p>Reference: <span className="font-medium">Order-{robot.id}</span></p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                After making the transfer, click "Confirm Payment" below and we'll verify your payment.
              </p>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="mpesa">
            <MpesaPaymentForm
              amount={mpesaAmount}
              robotId={robot.id}
              onSuccess={handleMpesaSuccess}
              onCancel={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedPaymentModal;
