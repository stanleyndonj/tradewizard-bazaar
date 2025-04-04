import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import { RobotRequestParams } from '@/lib/backend';
import { toast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TradingLoader } from '@/components/ui/loader';
import SectionHeader from '@/components/ui-elements/SectionHeader';

const RobotConfiguration = () => {
  const { submitRobotRequest, user, loading } = useBackend();
  const navigate = useNavigate();

  // Ensure user is logged in
  useEffect(() => {
    if (!user) {
      // Store the current URL to redirect back after login
      localStorage.setItem('redirectAfterAuth', window.location.pathname);
      navigate('/auth');
    }
  }, [user, navigate]);

  const userId = user?.id || ''; // Get user ID

  // Form state variables
  const [robotType, setRobotType] = useState<'MT5' | 'Binary'>('MT5');
  const [tradingPairs, setTradingPairs] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [riskLevel, setRiskLevel] = useState('');
  const [botName, setBotName] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [strategy, setStrategy] = useState('');
  const [volume, setVolume] = useState(0);
  const [orderType, setOrderType] = useState('');
  const [stopLoss, setStopLoss] = useState(0);
  const [takeProfit, setTakeProfit] = useState(0);
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountServer, setAccountServer] = useState('');

  // Binary options specific fields
  const [stakeAmount, setStakeAmount] = useState(0);
  const [contractType, setContractType] = useState('');
  const [duration, setDuration] = useState('');
  const [prediction, setPrediction] = useState('');
  const [currency, setCurrency] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Convert numeric inputs to strings where required by the type
    const requestParams: RobotRequestParams = {
      userId: userId,
      type: robotType as 'MT5' | 'Binary',
      tradingPairs: tradingPairs,
      timeframe: selectedTimeframe,
      riskLevel: riskLevel,
      botName: botName,
      market: selectedMarket,
      tradingStrategy: strategy,
      volume: volume.toString(), // Convert to string
      orderType: orderType,
      stopLoss: stopLoss.toString(), // Convert to string
      takeProfit: takeProfit.toString(), // Convert to string
      accountCredentials: {
        username: accountUsername,
        password: accountPassword,
        server: accountServer
      },
      // Binary options specific fields
      ...(robotType === 'Binary' && {
        stakeAmount: stakeAmount.toString(), // Convert to string
        contractType: contractType,
        duration: duration,
        prediction: prediction,
        currency: currency
      })
    };

    try {
      await submitRobotRequest(requestParams);
      toast({
        title: "Request submitted",
        description: "Your robot configuration request has been submitted successfully.",
      });
      navigate('/dashboard'); // Redirect to dashboard after successful submission
    } catch (error: any) {
      console.error("Failed to submit robot request:", error);
      toast({
        title: "Request submission failed",
        description: error.message || "Please check the form and try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TradingLoader text="Submitting Robot Configuration..." />
      </div>
    );
  }

  return (
    <div className="container py-24">
      <SectionHeader
        title="Configure Your Robot"
        description="Customize your robot settings to match your trading preferences."
        subtitle="Robot Configuration"
        centered
      />
      <Card className="max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Robot Configuration Form</CardTitle>
          <CardDescription>Fill in the details below to configure your robot.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="robotType">Robot Type</Label>
              <Select value={robotType} onValueChange={(value) => setRobotType(value as 'MT5' | 'Binary')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Robot Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT5">MetaTrader 5 (MT5)</SelectItem>
                  <SelectItem value="Binary">Binary Options</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tradingPairs">Trading Pairs</Label>
              <Input
                type="text"
                id="tradingPairs"
                placeholder="e.g., EURUSD, GBPJPY"
                value={tradingPairs}
                onChange={(e) => setTradingPairs(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="30m">30 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Input
                type="text"
                id="riskLevel"
                placeholder="e.g., High, Medium, Low"
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                type="text"
                id="botName"
                placeholder="Enter Bot Name"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="market">Market</Label>
              <Input
                type="text"
                id="selectedMarket"
                placeholder="e.g., Forex, Crypto"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="strategy">Trading Strategy</Label>
              <Input
                type="text"
                id="strategy"
                placeholder="e.g., Trend Following, Scalping"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="volume">Volume</Label>
              <Input
                type="number"
                id="volume"
                placeholder="Enter Volume"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="orderType">Order Type</Label>
              <Input
                type="text"
                id="orderType"
                placeholder="e.g., Market, Limit"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                type="number"
                id="stopLoss"
                placeholder="Enter Stop Loss"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                type="number"
                id="takeProfit"
                placeholder="Enter Take Profit"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="accountUsername">Account Username</Label>
              <Input
                type="text"
                id="accountUsername"
                placeholder="Enter Account Username"
                value={accountUsername}
                onChange={(e) => setAccountUsername(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="accountPassword">Account Password</Label>
              <Input
                type="password"
                id="accountPassword"
                placeholder="Enter Account Password"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="accountServer">Account Server</Label>
              <Input
                type="text"
                id="accountServer"
                placeholder="Enter Account Server"
                value={accountServer}
                onChange={(e) => setAccountServer(e.target.value)}
              />
            </div>

            {robotType === 'Binary' && (
              <>
                <Separator />

                <div>
                  <Label htmlFor="stakeAmount">Stake Amount</Label>
                  <Input
                    type="number"
                    id="stakeAmount"
                    placeholder="Enter Stake Amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Input
                    type="text"
                    id="contractType"
                    placeholder="e.g., Call, Put"
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    type="text"
                    id="duration"
                    placeholder="e.g., 60 seconds, 5 minutes"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="prediction">Prediction</Label>
                  <Input
                    type="text"
                    id="prediction"
                    placeholder="e.g., Up, Down"
                    value={prediction}
                    onChange={(e) => setPrediction(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    type="text"
                    id="currency"
                    placeholder="e.g., USD, EUR"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button type="submit">Submit Configuration</Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Please review your configuration before submitting.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RobotConfiguration;
