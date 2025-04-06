
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone } from 'lucide-react';

export type PaymentMethod = 'card' | 'mpesa';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange
}: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Payment Method</h3>
      
      <RadioGroup
        defaultValue={selectedMethod}
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as PaymentMethod)}
        className="grid grid-cols-2 gap-4"
      >
        <div className={`flex flex-col items-center gap-2 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors ${selectedMethod === 'card' ? 'border-primary bg-muted' : 'border-input'}`}>
          <RadioGroupItem value="card" id="payment-card" className="sr-only" />
          <Label htmlFor="payment-card" className="cursor-pointer flex flex-col items-center gap-2">
            <CreditCard className="h-6 w-6" />
            <span className="text-sm font-medium">Card Payment</span>
          </Label>
        </div>
        
        <div className={`flex flex-col items-center gap-2 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors ${selectedMethod === 'mpesa' ? 'border-primary bg-muted' : 'border-input'}`}>
          <RadioGroupItem value="mpesa" id="payment-mpesa" className="sr-only" />
          <Label htmlFor="payment-mpesa" className="cursor-pointer flex flex-col items-center gap-2">
            <Smartphone className="h-6 w-6" />
            <span className="text-sm font-medium">M-PESA</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
