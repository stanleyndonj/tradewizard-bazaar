
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Calculator, ArrowRight, RefreshCcw } from 'lucide-react';

export const TradingCalculators = () => {
  // Position Size Calculator state
  const [positionAmount, setPositionAmount] = useState<string>('1000');
  const [riskPercentage, setRiskPercentage] = useState<string>('2');
  const [entryPrice, setEntryPrice] = useState<string>('100');
  const [stopLoss, setStopLoss] = useState<string>('95');
  const [positionSize, setPositionSize] = useState<number | null>(null);
  
  // Profit/Loss Calculator state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeEntryPrice, setTradeEntryPrice] = useState<string>('100');
  const [tradeExitPrice, setTradeExitPrice] = useState<string>('110');
  const [tradeSize, setTradeSize] = useState<string>('1');
  const [profitLoss, setProfitLoss] = useState<number | null>(null);
  const [profitLossPercentage, setProfitLossPercentage] = useState<number | null>(null);
  
  // Pip Value Calculator state
  const [lotSize, setLotSize] = useState<string>('1');
  const [pipValue, setPipValue] = useState<number | null>(null);
  
  const calculatePositionSize = () => {
    if (!positionAmount || !riskPercentage || !entryPrice || !stopLoss) {
      toast({
        title: "Incomplete data",
        description: "Please fill in all fields to calculate position size",
        variant: "destructive",
      });
      return;
    }
    
    const accountSize = parseFloat(positionAmount);
    const risk = parseFloat(riskPercentage) / 100;
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    
    if (isNaN(accountSize) || isNaN(risk) || isNaN(entry) || isNaN(stop)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }
    
    const riskAmount = accountSize * risk;
    const priceDifference = Math.abs(entry - stop);
    const calculatedSize = riskAmount / priceDifference;
    
    setPositionSize(parseFloat(calculatedSize.toFixed(2)));
  };
  
  const calculateProfitLoss = () => {
    if (!tradeEntryPrice || !tradeExitPrice || !tradeSize) {
      toast({
        title: "Incomplete data",
        description: "Please fill in all fields to calculate profit/loss",
        variant: "destructive",
      });
      return;
    }
    
    const entry = parseFloat(tradeEntryPrice);
    const exit = parseFloat(tradeExitPrice);
    const size = parseFloat(tradeSize);
    
    if (isNaN(entry) || isNaN(exit) || isNaN(size)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }
    
    let pl: number;
    if (tradeType === 'buy') {
      pl = (exit - entry) * size;
    } else {
      pl = (entry - exit) * size;
    }
    
    const plPercentage = (pl / (entry * size)) * 100;
    
    setProfitLoss(parseFloat(pl.toFixed(2)));
    setProfitLossPercentage(parseFloat(plPercentage.toFixed(2)));
  };
  
  const calculatePipValue = () => {
    if (!lotSize) {
      toast({
        title: "Incomplete data",
        description: "Please enter a lot size to calculate pip value",
        variant: "destructive",
      });
      return;
    }
    
    const lot = parseFloat(lotSize);
    
    if (isNaN(lot)) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    
    // Standard pip value calculation for forex
    // For simplicity, assuming trading EUR/USD where 1 pip = $10 per standard lot
    const calculatedPipValue = lot * 10;
    
    setPipValue(parseFloat(calculatedPipValue.toFixed(2)));
  };
  
  const resetCalculators = () => {
    // Reset position size calculator
    setPositionAmount('1000');
    setRiskPercentage('2');
    setEntryPrice('100');
    setStopLoss('95');
    setPositionSize(null);
    
    // Reset profit/loss calculator
    setTradeType('buy');
    setTradeEntryPrice('100');
    setTradeExitPrice('110');
    setTradeSize('1');
    setProfitLoss(null);
    setProfitLossPercentage(null);
    
    // Reset pip value calculator
    setLotSize('1');
    setPipValue(null);
    
    toast({
      title: "Calculators reset",
      description: "All calculators have been reset to default values",
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-trading-blue" />
          Trading Calculators
        </CardTitle>
        <CardDescription>
          Essential calculators for risk management and trade planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="position-size">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="position-size">Position Size</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit/Loss</TabsTrigger>
            <TabsTrigger value="pip-value">Pip Value</TabsTrigger>
          </TabsList>
          
          <TabsContent value="position-size" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account-size">Account Size</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="account-size"
                    value={positionAmount}
                    onChange={(e) => setPositionAmount(e.target.value)}
                    className="rounded-l-none"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="risk-percentage">Risk Percentage</Label>
                <div className="flex mt-1">
                  <Input
                    id="risk-percentage"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(e.target.value)}
                    className="rounded-r-none"
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="entry-price">Entry Price</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="entry-price"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="rounded-l-none"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="stop-loss">Stop Loss Price</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="stop-loss"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="rounded-l-none"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Button onClick={calculatePositionSize}>Calculate Position Size</Button>
              
              {positionSize !== null && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Recommended Position Size:</p>
                  <p className="text-2xl font-bold">{positionSize} units</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="profit-loss" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Trade Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button
                    variant={tradeType === 'buy' ? 'default' : 'outline'}
                    onClick={() => setTradeType('buy')}
                    className={tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    Buy (Long)
                  </Button>
                  <Button
                    variant={tradeType === 'sell' ? 'default' : 'outline'}
                    onClick={() => setTradeType('sell')}
                    className={tradeType === 'sell' ? 'bg-red-500 hover:bg-red-600' : ''}
                  >
                    Sell (Short)
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="trade-size">Position Size</Label>
                <Input
                  id="trade-size"
                  value={tradeSize}
                  onChange={(e) => setTradeSize(e.target.value)}
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="entry-price-pl">Entry Price</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="entry-price-pl"
                    value={tradeEntryPrice}
                    onChange={(e) => setTradeEntryPrice(e.target.value)}
                    className="rounded-l-none"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="exit-price">Exit Price</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="exit-price"
                    value={tradeExitPrice}
                    onChange={(e) => setTradeExitPrice(e.target.value)}
                    className="rounded-l-none"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Button onClick={calculateProfitLoss}>Calculate Profit/Loss</Button>
              
              {profitLoss !== null && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Profit/Loss:</p>
                  <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {profitLoss >= 0 ? '+' : ''}{profitLoss} ({profitLossPercentage}%)
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pip-value" className="space-y-4">
            <div>
              <Label htmlFor="lot-size">Lot Size</Label>
              <Input
                id="lot-size"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                type="number"
                min="0.01"
                step="0.01"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Standard lot = 1.0, Mini lot = 0.1, Micro lot = 0.01
              </p>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Button onClick={calculatePipValue}>Calculate Pip Value</Button>
              
              {pipValue !== null && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Value per Pip:</p>
                  <p className="text-2xl font-bold">${pipValue}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-right">
          <Button variant="outline" size="sm" onClick={resetCalculators}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Reset Calculators
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingCalculators;
