
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, ChevronRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'MT5' | 'Binary';
  category: 'free' | 'paid';
  features: string[];
  imageUrl: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: Robot;
  onPaymentComplete: (paymentMethod: string) => void;
}

const PaymentModal = ({ isOpen, onClose, robot, onPaymentComplete }: PaymentModalProps) => {
  const [paymentTab, setPaymentTab] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleMpesaPayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate M-Pesa payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete("M-Pesa");
    }, 2000);
  };
  
  const handleBankPayment = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast({
        title: "Incomplete information",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate bank payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete("Bank Card");
    }, 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {robot.name} - {robot.currency} {robot.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="mpesa" value={paymentTab} onValueChange={setPaymentTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mpesa" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              M-Pesa
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Bank Card
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mpesa" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                placeholder="Enter M-Pesa number (e.g., 07XX XXX XXX)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You will receive an M-Pesa prompt on your phone to complete the payment.
              </p>
            </div>
            
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleMpesaPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  Pay with M-Pesa
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="bank" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    type="password"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-trading-blue hover:bg-trading-darkBlue"
              onClick={handleBankPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  Pay with Card
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
