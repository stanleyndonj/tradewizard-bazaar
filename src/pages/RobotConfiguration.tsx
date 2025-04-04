import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import { RobotRequestParams } from '@/lib/backend';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { TradingLoader } from '@/components/ui/loader';

const RobotConfiguration = () => {
  const { type } = useParams<{ type: string }>();
  const { user, submitRobotRequest, loading } = useBackend();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    botName: '',
    tradingPairs: '',
    timeframe: '',
    riskLevel: '5',
    tradingStrategy: '',
    volume: '0.1',
    orderType: 'Market',
    stopLoss: '50',
    takeProfit: '100',
    stakeAmount: '10',
    contractType: 'Call/Put',
    duration: '60',
    prediction: 'Up',
    username: '',
    password: '',
    server: '',
    market: ''
  });

  useEffect(() => {
    // Set page title
    document.title = `Configure ${type} Robot | TradeWizard`;
    
    if (!user && !loading) {
      toast({
        title: "Authentication required",
        description: "Please sign in to configure your robot.",
        variant: "destructive",
      });
      localStorage.setItem('redirectAfterAuth', `/configure-robot/${type}`);
      navigate('/auth');
    }
  }, [user, loading, navigate, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit your robot request.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (type?.toLowerCase() === 'mt5') {
      // For MT5 configuration, change numeric values to strings and fix accountCredentials format
      const mt5RequestParams: RobotRequestParams = {
        userId: user?.id || '',
        type: 'MT5',
        botName: formValues.botName,
        tradingPairs: formValues.tradingPairs,
        timeframe: formValues.timeframe,
        riskLevel: formValues.riskLevel,
        tradingStrategy: formValues.tradingStrategy,
        volume: formValues.volume,
        orderType: formValues.orderType,
        stopLoss: formValues.stopLoss,
        takeProfit: formValues.takeProfit,
        stakeAmount: formValues.stakeAmount.toString(),
        accountCredentials: {
          username: formValues.username,
          password: formValues.password,
          server: formValues.server
        },
        market: formValues.market,
        duration: formValues.duration.toString(),
        prediction: formValues.prediction,
        contractType: formValues.contractType
      };
      
      try {
        await submitRobotRequest(mt5RequestParams);
        toast({
          title: "MT5 Robot Request Submitted",
          description: "Your MT5 robot request has been submitted successfully!",
        });
        navigate('/customer-dashboard', { state: { tab: 'robots' } });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit MT5 robot request. Please try again.",
          variant: "destructive",
        });
      }
    } else if (type?.toLowerCase() === 'binary') {
      // For Binary Bot configuration
      const binaryRequestParams: RobotRequestParams = {
        userId: user?.id || '',
        type: 'Binary',
        botName: formValues.botName,
        tradingPairs: formValues.tradingPairs,
        timeframe: formValues.timeframe,
        riskLevel: formValues.riskLevel,
        tradingStrategy: formValues.tradingStrategy,
        volume: formValues.volume,
        orderType: formValues.orderType,
        stopLoss: formValues.stopLoss,
        takeProfit: formValues.takeProfit,
        stakeAmount: formValues.stakeAmount.toString(),
        accountCredentials: {
          username: formValues.username,
          password: formValues.password,
          server: formValues.server
        },
        market: formValues.market,
        duration: formValues.duration.toString(),
        prediction: formValues.prediction,
        contractType: formValues.contractType
      };
      
      try {
        await submitRobotRequest(binaryRequestParams);
        toast({
          title: "Binary Robot Request Submitted",
          description: "Your Binary robot request has been submitted successfully!",
        });
        navigate('/customer-dashboard', { state: { tab: 'robots' } });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit Binary robot request. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <TradingLoader text="Loading configuration..." />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-10">
          <SectionHeader
            subtitle="Configure Your Robot"
            title={`${type} Robot Configuration`}
            description={`Customize your ${type} trading robot by providing the specifications below.`}
            centered
          />
          
          <div className="max-w-3xl mx-auto mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Configuration */}
              <div>
                <Label htmlFor="botName">Bot Name</Label>
                <Input type="text" id="botName" value={formValues.botName} onChange={handleChange} placeholder="e.g., TrendMaster" />
              </div>
              
              <div>
                <Label htmlFor="tradingPairs">Trading Pairs</Label>
                <Input type="text" id="tradingPairs" value={formValues.tradingPairs} onChange={handleChange} placeholder="e.g., EURUSD, GBPJPY" />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={formValues.timeframe} onValueChange={(value) => setFormValues(prev => ({ ...prev, timeframe: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M1">M1</SelectItem>
                    <SelectItem value="M5">M5</SelectItem>
                    <SelectItem value="M15">M15</SelectItem>
                    <SelectItem value="M30">M30</SelectItem>
                    <SelectItem value="H1">H1</SelectItem>
                    <SelectItem value="H4">H4</SelectItem>
                    <SelectItem value="D1">D1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="riskLevel">Risk Level (%)</Label>
                <Input type="number" id="riskLevel" value={formValues.riskLevel} onChange={handleChange} placeholder="e.g., 5" />
              </div>
              
              <div>
                <Label htmlFor="tradingStrategy">Trading Strategy</Label>
                <Textarea id="tradingStrategy" value={formValues.tradingStrategy} onChange={handleChange} placeholder="Describe your trading strategy..." />
              </div>

              {/* MT5 Specific Configuration */}
              {type?.toLowerCase() === 'mt5' && (
                <>
                  <div>
                    <Label htmlFor="volume">Volume</Label>
                    <Input type="number" id="volume" value={formValues.volume} onChange={handleChange} placeholder="e.g., 0.01" />
                  </div>
                  
                  <div>
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select value={formValues.orderType} onValueChange={(value) => setFormValues(prev => ({ ...prev, orderType: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Market">Market Order</SelectItem>
                        <SelectItem value="Pending">Pending Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="stopLoss">Stop Loss (pips)</Label>
                    <Input type="number" id="stopLoss" value={formValues.stopLoss} onChange={handleChange} placeholder="e.g., 50" />
                  </div>
                  
                  <div>
                    <Label htmlFor="takeProfit">Take Profit (pips)</Label>
                    <Input type="number" id="takeProfit" value={formValues.takeProfit} onChange={handleChange} placeholder="e.g., 100" />
                  </div>
                  
                  <div>
                    <Label htmlFor="username">Account Username</Label>
                    <Input type="text" id="username" value={formValues.username} onChange={handleChange} placeholder="MT5 Account Username" />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Account Password</Label>
                    <Input type="password" id="password" value={formValues.password} onChange={handleChange} placeholder="MT5 Account Password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="server">Server</Label>
                    <Input type="text" id="server" value={formValues.server} onChange={handleChange} placeholder="MT5 Server Address" />
                  </div>
                </>
              )}

              {/* Binary Bot Specific Configuration */}
              {type?.toLowerCase() === 'binary' && (
                <>
                  <div>
                    <Label htmlFor="market">Market</Label>
                    <Input type="text" id="market" value={formValues.market} onChange={handleChange} placeholder="e.g., Forex, Indices" />
                  </div>
                  
                  <div>
                    <Label htmlFor="stakeAmount">Stake Amount</Label>
                    <Input type="number" id="stakeAmount" value={formValues.stakeAmount} onChange={handleChange} placeholder="e.g., 10" />
                  </div>
                  
                  <div>
                    <Label htmlFor="contractType">Contract Type</Label>
                    <Select value={formValues.contractType} onValueChange={(value) => setFormValues(prev => ({ ...prev, contractType: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Call/Put">Call/Put</SelectItem>
                        <SelectItem value="Higher/Lower">Higher/Lower</SelectItem>
                        <SelectItem value="Touch/No Touch">Touch/No Touch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input type="number" id="duration" value={formValues.duration} onChange={handleChange} placeholder="e.g., 60" />
                  </div>
                  
                  <div>
                    <Label htmlFor="prediction">Prediction</Label>
                    <Select value={formValues.prediction} onValueChange={(value) => setFormValues(prev => ({ ...prev, prediction: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select prediction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Up">Up</SelectItem>
                        <SelectItem value="Down">Down</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RobotConfiguration;
