
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useBackend } from '@/context/BackendContext';

const RobotConfiguration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { submitRobotRequest } = useBackend();
  const { robotType } = location.state || { robotType: "MT5" };
  
  const [formData, setFormData] = useState({
    trading_pairs: "EURUSD",
    timeframe: "H1",
    risk_level: "medium",
    bot_name: "",
    market: "",
    stake_amount: "",
    contract_type: "",
    duration: "",
    prediction: "",
    currency: "USD",
    trading_strategy: "",
    account_credentials: "",
    volume: "",
    order_type: "",
    stop_loss: "",
    take_profit: "",
    entry_rules: "",
    exit_rules: "",
    risk_management: "",
    additional_parameters: ""
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const requestData = {
        robot_type: robotType,
        ...formData
      };
      
      await submitRobotRequest(requestData);
      
      toast({
        title: "Robot Request Submitted",
        description: "Your custom robot request has been submitted successfully. We'll notify you once it's ready.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error submitting robot request:", error);
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Configure Your {robotType} Robot</CardTitle>
          <CardDescription>
            Tell us exactly what you need for your custom trading robot
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bot_name">Bot Name</Label>
                  <Input 
                    id="bot_name" 
                    name="bot_name" 
                    placeholder="Name your bot" 
                    value={formData.bot_name} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trading_pairs">Trading Pairs</Label>
                  <Input
                    id="trading_pairs"
                    name="trading_pairs"
                    placeholder="e.g. EURUSD, BTCUSD"
                    value={formData.trading_pairs}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select
                    value={formData.timeframe}
                    onValueChange={(value) => handleSelectChange("timeframe", value)}
                  >
                    <SelectTrigger id="timeframe">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M1">1 Minute</SelectItem>
                      <SelectItem value="M5">5 Minutes</SelectItem>
                      <SelectItem value="M15">15 Minutes</SelectItem>
                      <SelectItem value="M30">30 Minutes</SelectItem>
                      <SelectItem value="H1">1 Hour</SelectItem>
                      <SelectItem value="H4">4 Hours</SelectItem>
                      <SelectItem value="D1">Daily</SelectItem>
                      <SelectItem value="W1">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="risk_level">Risk Level</Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value) => handleSelectChange("risk_level", value)}
                  >
                    <SelectTrigger id="risk_level">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="market">Market</Label>
                  <Select
                    value={formData.market}
                    onValueChange={(value) => handleSelectChange("market", value)}
                  >
                    <SelectTrigger id="market">
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="stocks">Stocks</SelectItem>
                      <SelectItem value="indices">Indices</SelectItem>
                      <SelectItem value="commodities">Commodities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange("currency", value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="KES">KES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trading_strategy">Trading Strategy</Label>
                <Textarea
                  id="trading_strategy"
                  name="trading_strategy"
                  placeholder="Describe your trading strategy or preferences"
                  value={formData.trading_strategy}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
            
            <Separator />
            
            {robotType === "MT5" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">MT5 Specific Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volume">Trading Volume</Label>
                    <Input
                      id="volume"
                      name="volume"
                      placeholder="e.g. 0.01"
                      value={formData.volume}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="order_type">Order Type</Label>
                    <Select
                      value={formData.order_type}
                      onValueChange={(value) => handleSelectChange("order_type", value)}
                    >
                      <SelectTrigger id="order_type">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stop_loss">Stop Loss (pips or points)</Label>
                    <Input
                      id="stop_loss"
                      name="stop_loss"
                      placeholder="e.g. 50"
                      value={formData.stop_loss}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="take_profit">Take Profit (pips or points)</Label>
                    <Input
                      id="take_profit"
                      name="take_profit"
                      placeholder="e.g. 100"
                      value={formData.take_profit}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="entry_rules">Entry Rules</Label>
                  <Textarea
                    id="entry_rules"
                    name="entry_rules"
                    placeholder="Describe when the robot should enter a trade"
                    value={formData.entry_rules}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exit_rules">Exit Rules</Label>
                  <Textarea
                    id="exit_rules"
                    name="exit_rules"
                    placeholder="Describe when the robot should exit a trade"
                    value={formData.exit_rules}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="risk_management">Risk Management</Label>
                  <Textarea
                    id="risk_management"
                    name="risk_management"
                    placeholder="Describe your risk management preferences"
                    value={formData.risk_management}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account_credentials">MT5 Account Details (Optional)</Label>
                  <Textarea
                    id="account_credentials"
                    name="account_credentials"
                    placeholder="Provide MT5 account details (Server, Account number, etc.)"
                    value={formData.account_credentials}
                    onChange={handleChange}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    This information is optional and will only be used to configure your robot.
                  </p>
                </div>
              </div>
            )}
            
            {robotType === "Binary" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Binary Options Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stake_amount">Stake Amount</Label>
                    <Input
                      id="stake_amount"
                      name="stake_amount"
                      placeholder="e.g. 10"
                      value={formData.stake_amount}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contract_type">Contract Type</Label>
                    <Select
                      value={formData.contract_type}
                      onValueChange={(value) => handleSelectChange("contract_type", value)}
                    >
                      <SelectTrigger id="contract_type">
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call/Up</SelectItem>
                        <SelectItem value="put">Put/Down</SelectItem>
                        <SelectItem value="touch">Touch</SelectItem>
                        <SelectItem value="no_touch">No Touch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      placeholder="e.g. 5 minutes, 1 hour"
                      value={formData.duration}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prediction">Prediction Strategy</Label>
                    <Select
                      value={formData.prediction}
                      onValueChange={(value) => handleSelectChange("prediction", value)}
                    >
                      <SelectTrigger id="prediction">
                        <SelectValue placeholder="Select prediction strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trend_following">Trend Following</SelectItem>
                        <SelectItem value="reversal">Reversal</SelectItem>
                        <SelectItem value="range_breakout">Range Breakout</SelectItem>
                        <SelectItem value="news_based">News Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="additional_parameters">Additional Parameters or Instructions</Label>
              <Textarea
                id="additional_parameters"
                name="additional_parameters"
                placeholder="Any additional parameters or instructions for your custom robot"
                value={formData.additional_parameters}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RobotConfiguration;
