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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from '@/components/ui/checkbox';

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

const orderTypes = [
  { value: 'market', label: 'Market Order' },
  { value: 'limit', label: 'Limit Order' },
  { value: 'stop', label: 'Stop Order' },
  { value: 'stop_limit', label: 'Stop Limit Order' }
];

const contractTypes = [
  { value: 'rise', label: 'Rise' },
  { value: 'fall', label: 'Fall' },
  { value: 'touch', label: 'Touch' },
  { value: 'no_touch', label: 'No Touch' },
  { value: 'in', label: 'In' },
  { value: 'out', label: 'Out' }
];

const currencies = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'JPY', label: 'JPY' },
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' }
];

const markets = [
  { value: 'forex', label: 'Forex' },
  { value: 'crypto', label: 'Cryptocurrencies' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'commodities', label: 'Commodities' },
  { value: 'indices', label: 'Indices' }
];

const predictions = [
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' }
];

const tradingStrategies = [
  { value: 'martingale', label: 'Martingale' },
  { value: 'trend_following', label: 'Trend Following' },
  { value: 'grid', label: 'Grid Trading' },
  { value: 'scalping', label: 'Scalping' },
  { value: 'arbitrage', label: 'Arbitrage' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'custom', label: 'Custom' }
];

// Common form schema fields
const commonFormSchema = {
  botName: z.string().min(3, "Bot name must be at least 3 characters"),
  tradingPairs: z.string().min(3, "Please enter at least one trading pair"),
  timeframe: z.string().min(1, "Please select a timeframe"),
  riskLevel: z.number().min(1).max(5),
  market: z.string().optional(),
  currency: z.string().optional(),
  tradingStrategy: z.string().optional(),
};

// MT5 Bot form schema
const mt5FormSchema = z.object({
  ...commonFormSchema,
  accountCredentials: z.string().optional(),
  volume: z.number().min(0.01).optional(),
  orderType: z.string().optional(),
  stopLoss: z.number().min(0).optional(),
  takeProfit: z.number().min(0).optional(),
  entryRules: z.string().optional(),
  exitRules: z.string().optional(),
  riskManagement: z.string().optional(),
  additionalParameters: z.string().optional(),
});

// Binary Bot form schema
const binaryFormSchema = z.object({
  ...commonFormSchema,
  stakeAmount: z.number().min(1).optional(),
  contractType: z.string().optional(),
  duration: z.string().optional(),
  prediction: z.string().optional(),
});

const RobotConfiguration = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, submitRequest, isLoading } = useBackend();

  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form based on robot type
  const isBinary = type?.toLowerCase().includes('binary');
  const formSchema = isBinary ? binaryFormSchema : mt5FormSchema;
  
  // Types for the form data
  type BinaryFormValues = z.infer<typeof binaryFormSchema>;
  type MT5FormValues = z.infer<typeof mt5FormSchema>;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botName: "",
      tradingPairs: "",
      timeframe: "1h",
      riskLevel: 3,
      market: "",
      currency: "USD",
      tradingStrategy: "",
      // MT5 specific defaults
      ...(isBinary ? {} : {
        volume: 0.01,
        stopLoss: 0,
        takeProfit: 0,
      }),
      // Binary specific defaults
      ...(isBinary ? {
        stakeAmount: 10,
        duration: "60", // 60 seconds
      } : {}),
    },
  });

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    
    try {
      console.log("Form data to submit:", data);
      
      // Convert form data to the request format
      const requestData = {
        robotType: getRobotType(),
        tradingPairs: data.tradingPairs,
        timeframe: data.timeframe,
        riskLevel: data.riskLevel,
        botName: data.botName,
        market: data.market,
        currency: data.currency,
        tradingStrategy: data.tradingStrategy,
      };

      // Add type-specific fields based on the robot type
      if (isBinary) {
        // Safe to cast since we've checked isBinary
        const binaryData = data as BinaryFormValues;
        const response = await submitRequest({
          ...requestData,
          stakeAmount: binaryData.stakeAmount,
          contractType: binaryData.contractType,
          duration: binaryData.duration,
          prediction: binaryData.prediction,
        });
        console.log("Robot request created:", response);
      } else {
        // Safe to cast since we've checked !isBinary
        const mt5Data = data as MT5FormValues;
        const response = await submitRequest({
          ...requestData,
          accountCredentials: mt5Data.accountCredentials,
          volume: mt5Data.volume,
          orderType: mt5Data.orderType,
          stopLoss: mt5Data.stopLoss,
          takeProfit: mt5Data.takeProfit,
          entryRules: mt5Data.entryRules,
          exitRules: mt5Data.exitRules,
          riskManagement: mt5Data.riskManagement,
          additionalParameters: mt5Data.additionalParameters,
        });
        console.log("Robot request created:", response);
      }
      
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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Configure Your {getRobotType()} Robot</h1>
            <p className="text-muted-foreground mb-8">Fill out the form below to request your custom trading robot.</p>
            
            <Card>
              <CardHeader>
                <CardTitle>Robot Specifications</CardTitle>
                <CardDescription>
                  Tell us what you need and our experts will create a custom robot for you
                </CardDescription>
              </CardHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
                    <div className="px-6">
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="basic">Basic Details</TabsTrigger>
                        <TabsTrigger value="strategy">Strategy</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <CardContent>
                      <TabsContent value="basic" className="space-y-4 mt-0">
                        <FormField
                          control={form.control}
                          name="botName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bot Name</FormLabel>
                              <FormControl>
                                <Input placeholder="My Trading Bot" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="tradingPairs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trading Pairs</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. EURUSD, GBPUSD, BTCUSD" {...field} />
                              </FormControl>
                              <p className="text-sm text-muted-foreground">
                                Comma separated list of currency pairs you want to trade
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="timeframe"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Timeframe</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a timeframe" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeframes.map((tf) => (
                                      <SelectItem key={tf.value} value={tf.value}>
                                        {tf.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="market"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Market</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a market" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {markets.map((market) => (
                                      <SelectItem key={market.value} value={market.value}>
                                        {market.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {currencies.map((currency) => (
                                      <SelectItem key={currency.value} value={currency.value}>
                                        {currency.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {isBinary && (
                            <FormField
                              control={form.control}
                              name="stakeAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stake Amount</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          {!isBinary && (
                            <FormField
                              control={form.control}
                              name="volume"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Volume</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0.01" 
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="riskLevel"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between">
                                <FormLabel>Risk Level: {field.value}</FormLabel>
                                <span className="text-sm font-medium">
                                  {field.value <= 2 ? 'Low' : field.value <= 4 ? 'Medium' : 'High'}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={5}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <p className="text-sm text-muted-foreground">
                                Higher risk means potentially higher returns but more risk of losses
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="strategy" className="space-y-4 mt-0">
                        <FormField
                          control={form.control}
                          name="tradingStrategy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trading Strategy</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a trading strategy" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tradingStrategies.map((strategy) => (
                                    <SelectItem key={strategy.value} value={strategy.value}>
                                      {strategy.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {isBinary && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="contractType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contract Type</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select contract type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {contractTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="prediction"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Prediction</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select prediction" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {predictions.map((pred) => (
                                          <SelectItem key={pred.value} value={pred.value}>
                                            {pred.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (seconds)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="text" 
                                      placeholder="60" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                        
                        {!isBinary && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="orderType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Order Type</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select order type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {orderTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="accountCredentials"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Credentials (optional)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="text" 
                                        placeholder="MT5 account ID" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="stopLoss"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Stop Loss (pips)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="takeProfit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Take Profit (pips)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="advanced" className="space-y-4 mt-0">
                        {!isBinary && (
                          <>
                            <FormField
                              control={form.control}
                              name="entryRules"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Entry Rules</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your entry rules..." 
                                      className="min-h-[80px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="exitRules"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Exit Rules</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your exit rules..." 
                                      className="min-h-[80px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="riskManagement"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Risk Management</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your risk management parameters..." 
                                      className="min-h-[80px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="additionalParameters"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Parameters</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Any other parameters or instructions..." 
                                      className="min-h-[80px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                        
                        {isBinary && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Additional Settings</h3>
                            <p className="text-muted-foreground">
                              Binary bots have simpler configuration. Please use the notes section below for any additional requirements.
                            </p>
                            
                            <FormField
                              control={form.control}
                              name="additionalParameters"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Special Requirements or Notes</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Any special requirements or notes about your binary bot..." 
                                      className="min-h-[150px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </TabsContent>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between border-t p-6">
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            if (activeTab === "basic") {
                              navigate('/');
                            } else if (activeTab === "strategy") {
                              setActiveTab("basic");
                            } else if (activeTab === "advanced") {
                              setActiveTab("strategy");
                            }
                          }}
                        >
                          {activeTab === "basic" ? "Cancel" : "Back"}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        {activeTab !== "advanced" ? (
                          <Button 
                            type="button" 
                            onClick={() => {
                              if (activeTab === "basic") {
                                setActiveTab("strategy");
                              } else if (activeTab === "strategy") {
                                setActiveTab("advanced");
                              }
                            }}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button type="submit" disabled={submitting}>
                            {submitting ? (
                              <>
                                <Loader size="sm" className="mr-2" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Request'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Tabs>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RobotConfiguration;
