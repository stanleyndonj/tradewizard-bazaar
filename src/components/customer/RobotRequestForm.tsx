import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function RobotRequestForm() {
  const { toast } = useToast();
  const { submitRobotRequest } = useBackend();
  const [isLoading, setIsLoading] = useState(false);
  const [robotType, setRobotType] = useState('mt5');
  const navigate = useNavigate(); // Initialize useNavigate

  // MT5 Robot form state
  const [mt5Form, setMt5Form] = useState({
    trading_strategy: '',
    account_credentials: '',
    volume: '',
    order_type: 'market',
    stop_loss: '',
    take_profit: '',
    entry_rules: '',
    exit_rules: '',
    risk_management: '',
    additional_parameters: ''
  });

  // Binary Robot form state
  const [binaryForm, setBinaryForm] = useState({
    trading_strategy: '',
    platform: 'deriv',
    timeframe: '5m',
    risk_per_trade: '',
    instrument_type: 'forex',
    specific_instruments: '',
    indicators: '',
    exit_strategy: '',
    trading_hours: '',
    additional_requirements: ''
  });

  const handleMt5InputChange = (e) => {
    const { name, value } = e.target;
    setMt5Form(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBinaryInputChange = (e) => {
    const { name, value } = e.target;
    setBinaryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    if (robotType === 'mt5') {
      setMt5Form(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setBinaryForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine which form data to submit based on robotType
      const formData = robotType === 'mt5' ? 
        { robot_type: 'mt5', ...mt5Form } : 
        { robot_type: 'binary', ...binaryForm };

      // Submit request
      const response = await submitRobotRequest(formData);

      if (response && response.id) {
        toast({
          title: "Request Submitted",
          description: "Your robot request has been submitted successfully! We'll get back to you soon.",
          duration: 5000, // Added duration
        });

        // Reset form
        if (robotType === 'mt5') {
          setMt5Form({
            trading_strategy: '',
            account_credentials: '',
            volume: '',
            order_type: 'market',
            stop_loss: '',
            take_profit: '',
            entry_rules: '',
            exit_rules: '',
            risk_management: '',
            additional_parameters: ''
          });
        } else {
          setBinaryForm({
            trading_strategy: '',
            platform: 'deriv',
            timeframe: '5m',
            risk_per_trade: '',
            instrument_type: 'forex',
            specific_instruments: '',
            indicators: '',
            exit_strategy: '',
            trading_hours: '',
            additional_requirements: ''
          });
        }
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting robot request:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Custom Trading Robot Request</CardTitle>
        <CardDescription className="text-gray-400">
          Tell us how you want your automated trading robot to perform
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="mt5" onValueChange={setRobotType} value={robotType}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="mt5">MT5 Robot</TabsTrigger>
            <TabsTrigger value="binary">Binary Options Robot</TabsTrigger>
          </TabsList>
        </div>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <TabsContent value="mt5" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="trading_strategy">Trading Strategy</Label>
                  <Input 
                    id="trading_strategy" 
                    name="trading_strategy"
                    placeholder="E.g., Trend Following, Scalping, Grid Trading"
                    value={mt5Form.trading_strategy}
                    onChange={handleMt5InputChange}
                    required
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="account_credentials">Account Details (Broker, Account Type)</Label>
                  <Input 
                    id="account_credentials" 
                    name="account_credentials"
                    placeholder="E.g., IC Markets, Standard Account"
                    value={mt5Form.account_credentials}
                    onChange={handleMt5InputChange}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="volume">Trade Volume</Label>
                    <Input 
                      id="volume" 
                      name="volume"
                      placeholder="E.g., 0.01, 0.1, 1"
                      value={mt5Form.volume}
                      onChange={handleMt5InputChange}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="order_type">Order Type</Label>
                    <Select 
                      name="order_type" 
                      value={mt5Form.order_type}
                      onValueChange={(value) => handleSelectChange('order_type', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stop_loss">Stop Loss (points/pips)</Label>
                    <Input 
                      id="stop_loss" 
                      name="stop_loss"
                      placeholder="E.g., 50, 100"
                      value={mt5Form.stop_loss}
                      onChange={handleMt5InputChange}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="take_profit">Take Profit (points/pips)</Label>
                    <Input 
                      id="take_profit" 
                      name="take_profit"
                      placeholder="E.g., 100, 200"
                      value={mt5Form.take_profit}
                      onChange={handleMt5InputChange}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="entry_rules">Entry Rules</Label>
                  <Textarea 
                    id="entry_rules" 
                    name="entry_rules"
                    placeholder="Describe when the robot should enter trades"
                    value={mt5Form.entry_rules}
                    onChange={handleMt5InputChange}
                    className="min-h-24 bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exit_rules">Exit Rules</Label>
                  <Textarea 
                    id="exit_rules" 
                    name="exit_rules"
                    placeholder="Describe when the robot should exit trades"
                    value={mt5Form.exit_rules}
                    onChange={handleMt5InputChange}
                    className="min-h-24 bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="risk_management">Risk Management Rules</Label>
                  <Textarea 
                    id="risk_management" 
                    name="risk_management"
                    placeholder="E.g., Max daily loss, trailing stop loss, etc."
                    value={mt5Form.risk_management}
                    onChange={handleMt5InputChange}
                    className="min-h-24 bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="additional_parameters">Additional Parameters</Label>
                  <Textarea 
                    id="additional_parameters" 
                    name="additional_parameters"
                    placeholder="Any other specific requirements for your robot"
                    value={mt5Form.additional_parameters}
                    onChange={handleMt5InputChange}
                    className="min-h-24 bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="binary" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="binary_trading_strategy">Trading Strategy</Label>
                  <Input 
                    id="binary_trading_strategy" 
                    name="trading_strategy"
                    placeholder="E.g., Trend Following, Support/Resistance, News Trading"
                    value={binaryForm.trading_strategy}
                    onChange={handleBinaryInputChange}
                    required
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select 
                      name="platform" 
                      value={binaryForm.platform}
                      onValueChange={(value) => handleSelectChange('platform', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="deriv">Deriv</SelectItem>
                        <SelectItem value="pocket_option">Pocket Option</SelectItem>
                        <SelectItem value="iq_option">IQ Option</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select 
                      name="timeframe" 
                      value={binaryForm.timeframe}
                      onValueChange={(value) => handleSelectChange('timeframe', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="1m">1 Minute</SelectItem>
                        <SelectItem value="5m">5 Minutes</SelectItem>
                        <SelectItem value="15m">15 Minutes</SelectItem>
                        <SelectItem value="30m">30 Minutes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="risk_per_trade">Risk Per Trade (%)</Label>
                  <Input 
                    id="risk_per_trade" 
                    name="risk_per_trade"
                    placeholder="E.g., 1%, 2%, 5%"
                    value={binaryForm.risk_per_trade}
                    onChange={handleBinaryInputChange}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="instrument_type">Instrument Type</Label>
                    <Select 
                      name="instrument_type" 
                      value={binaryForm.instrument_type}
                      onValueChange={(value) => handleSelectChange('instrument_type', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="forex">Forex</SelectItem>
                        <SelectItem value="commodities">Commodities</SelectItem>
                        <SelectItem value="indices">Indices</SelectItem>
                        <SelectItem value="crypto">Cryptocurrencies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="specific_instruments">Specific Instruments</Label>
                    <Input 
                      id="specific_instruments" 
                      name="specific_instruments"
                      placeholder="E.g., EUR/USD, GBP/JPY, BTCUSD"
                      value={binaryForm.specific_instruments}
                      onChange={handleBinaryInputChange}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="indicators">Indicators to Use</Label>
                  <Textarea 
                    id="indicators" 
                    name="indicators"
                    placeholder="E.g., RSI, MACD, Bollinger Bands"
                    value={binaryForm.indicators}
                    onChange={handleBinaryInputChange}
                    className="min-h-24 bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exit_strategy">Exit Strategy</Label>
                  <Textarea 
                    id="exit_strategy" 
                    name="exit_strategy"
                    placeholder="When should the robot exit trades?"
                    value={binaryForm.exit_strategy}
                    onChange={handleBinaryInputChange}
                    className="min-h-24 bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="trading_hours">Trading Hours</Label>
                  <Input 
                    id="trading_hours" 
                    name="trading_hours"
                    placeholder="E.g., 09:00-17:00 GMT, specific sessions"
                    value={binaryForm.trading_hours}
                    onChange={handleBinaryInputChange}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="additional_requirements">Additional Requirements</Label>
                  <Textarea 
                    id="additional_requirements" 
                    name="additional_requirements"
                    placeholder="Any other specific requirements for your robot"
                    value={binaryForm.additional_requirements}
                    onChange={handleBinaryInputChange}
                    className="min-h-24 bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
            </TabsContent>

            <CardFooter className="mt-6 px-0">
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Robot Request'
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Tabs>
    </Card>
  );
}