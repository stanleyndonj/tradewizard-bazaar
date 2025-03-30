
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { Loader } from '@/components/ui/loader';

const timeframes = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' }
];

const RobotConfiguration = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, submitRequest, isLoading } = useBackend();

  const [tradingPairs, setTradingPairs] = useState('');
  const [timeframe, setTimeframe] = useState('1h');
  const [riskLevel, setRiskLevel] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `Configure ${type} Robot | TradeWizard`;
    
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to configure your robot",
        variant: "destructive",
      });
      
      localStorage.setItem('redirectAfterAuth', `/configure-robot/${type}`);
      navigate('/auth');
    }
  }, [type, user, isLoading, navigate, toast]);

  const robotTypes: Record<string, string> = {
    mt5: 'MT5',
    binary: 'Binary Options',
    forex: 'Forex',
    crypto: 'Cryptocurrency'
  };

  const getRobotType = () => {
    if (!type) return 'Unknown';
    return robotTypes[type.toLowerCase()] || type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tradingPairs) {
      toast({
        title: "Missing information",
        description: "Please enter at least one trading pair",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await submitRequest(
        getRobotType(),
        tradingPairs,
        timeframe,
        riskLevel
      );
      
      toast({
        title: "Request submitted",
        description: "Your custom robot request has been submitted successfully",
      });
      
      navigate('/customer-dashboard');
    } catch (error) {
      let message = "Failed to submit your request";
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader text="Loading robot configuration..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Configure Your {getRobotType()} Robot</h1>
            <p className="text-muted-foreground mb-8">Fill out the form below to request your custom trading robot.</p>
            
            <Card>
              <CardHeader>
                <CardTitle>Robot Specifications</CardTitle>
                <CardDescription>
                  Tell us what you need and our experts will create a custom robot for you
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="trading-pairs">Trading Pairs</Label>
                    <Input 
                      id="trading-pairs" 
                      placeholder="e.g. EURUSD, GBPUSD, BTCUSD" 
                      value={tradingPairs}
                      onChange={(e) => setTradingPairs(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Comma separated list of currency pairs you want to trade
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select 
                      value={timeframe} 
                      onValueChange={setTimeframe}
                    >
                      <SelectTrigger id="timeframe">
                        <SelectValue placeholder="Select a timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeframes.map((tf) => (
                          <SelectItem key={tf.value} value={tf.value}>
                            {tf.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      The chart timeframe your robot will analyze
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="risk-level">Risk Level: {riskLevel}</Label>
                      <span className="text-sm font-medium">
                        {riskLevel <= 2 ? 'Low' : riskLevel <= 4 ? 'Medium' : 'High'}
                      </span>
                    </div>
                    <Slider
                      id="risk-level"
                      min={1}
                      max={5}
                      step={1}
                      value={[riskLevel]}
                      onValueChange={(value) => setRiskLevel(value[0])}
                      className="py-4"
                    />
                    <p className="text-sm text-muted-foreground">
                      Higher risk means potentially higher returns but more risk of losses
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Submitting Request...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RobotConfiguration;
