
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart2, 
  ChevronRight, 
  Clock, 
  Lock, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  LineChart,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { MarketAnalysis, TradingSignal, analyzeMarket, getTradingSignals } from '@/lib/backend';
import EnhancedPaymentModal from '@/components/marketplace/EnhancedPaymentModal';

const AITradingSignals = () => {
  const navigate = useNavigate();
  const { user, robots } = useBackend();
  const [activeTab, setActiveTab] = useState('market-analyzer');
  const [marketType, setMarketType] = useState('forex');
  const [timeframe, setTimeframe] = useState('1h');
  const [symbol, setSymbol] = useState('EUR/USD');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState(null);

  // Check for subscription
  const hasSubscription = user?.robots_delivered;
  const isAdmin = user?.is_admin;

  useEffect(() => {
    // Set page title
    document.title = 'AI Trading Signals | TradeWizard';
    
    // Redirect if not logged in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access AI Trading Signals",
        variant: "destructive",
      });
      navigate('/auth', { state: { redirectAfter: '/ai-trading-signals' } });
    }
  }, [user, navigate]);

  // Query for getting trading signals
  const { 
    data: signals, 
    isLoading: signalsLoading, 
    error: signalsError,
    refetch: refetchSignals
  } = useQuery({
    queryKey: ['tradingSignals', marketType, timeframe],
    queryFn: () => getTradingSignals(marketType, timeframe, 20),
    enabled: !!user && (!!hasSubscription || !!isAdmin)
  });

  // State for market analysis
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);

  // Handle market analysis
  const handleAnalyzeMarket = async () => {
    if (!symbol || !timeframe) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeMarket(symbol, timeframe);
      setAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: `Analysis for ${symbol} on ${timeframe} timeframe completed successfully`,
      });
    } catch (error) {
      console.error('Error analyzing market:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Find a premium robot for subscription
  const findPremiumRobot = () => {
    if (!robots || robots.length === 0) return null;
    return robots.find(robot => (robot.category || 'paid') === 'paid');
  };

  // Handle subscription upgrade
  const handleUpgradeSubscription = () => {
    const premiumRobot = findPremiumRobot();
    
    if (premiumRobot) {
      // Open payment modal directly
      setSelectedRobot(premiumRobot);
      setIsPaymentModalOpen(true);
    } else {
      // If no premium robot is found, navigate to marketplace
      navigate('/robot-marketplace');
    }
  };

  // Handle close payment modal
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedRobot(null);
  };

  // Handle payment complete
  const handlePaymentComplete = (paymentMethod: string) => {
    if (!selectedRobot) return;
    
    // This would call purchaseRobot from the backend context
    // For now we just close the modal
    
    setIsPaymentModalOpen(false);
    setSelectedRobot(null);
    
    // Show success message
    toast({
      title: "Subscription Activated",
      description: "Your subscription has been activated. You now have access to AI Trading Signals.",
    });
    
    // Refresh page to show trading signals
    window.location.reload();
  };

  // Render timestamp in human-readable format
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="text-trading-blue mr-2" size={24} />
            <h1 className="text-3xl md:text-4xl font-bold">AI Trading Signals</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-2">
            Advanced trading insights powered by artificial intelligence. Get real-time signals, market analysis, 
            and trading recommendations based on sophisticated algorithms.
          </p>
        </div>
        
        {!hasSubscription && !isAdmin ? (
          <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 mb-10">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-amber-100 dark:bg-amber-800/40 p-3 rounded-full">
                    <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Premium Feature</h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      AI Trading Signals are exclusively available to premium subscribers.
                      Upgrade your subscription to unlock this powerful feature.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleUpgradeSubscription}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full md:w-auto"
                >
                  Upgrade Subscription
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs 
            defaultValue="market-analyzer" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="market-analyzer" className="flex items-center space-x-2">
                  <LineChart className="h-4 w-4" />
                  <span>Market Analyzer</span>
                </TabsTrigger>
                <TabsTrigger value="signal-history" className="flex items-center space-x-2">
                  <BarChart2 className="h-4 w-4" />
                  <span>Signal History</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Market Analyzer Tab */}
            <TabsContent value="market-analyzer" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Analysis Form */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="mr-2 h-5 w-5 text-trading-blue" />
                      Market Analyzer
                    </CardTitle>
                    <CardDescription>
                      Analyze any market for AI-powered trading signals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Market Type</label>
                      <Select 
                        value={marketType} 
                        onValueChange={setMarketType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select market" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="forex">Forex</SelectItem>
                          <SelectItem value="crypto">Crypto</SelectItem>
                          <SelectItem value="stocks">Stocks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Symbol</label>
                      <Input 
                        value={symbol} 
                        onChange={(e) => setSymbol(e.target.value)} 
                        placeholder="e.g. EUR/USD, BTC/USD, AAPL"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timeframe</label>
                      <Select 
                        value={timeframe} 
                        onValueChange={setTimeframe}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5m">5 Minutes</SelectItem>
                          <SelectItem value="15m">15 Minutes</SelectItem>
                          <SelectItem value="30m">30 Minutes</SelectItem>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="4h">4 Hours</SelectItem>
                          <SelectItem value="1d">Daily</SelectItem>
                          <SelectItem value="1w">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleAnalyzeMarket} 
                      className="w-full bg-trading-blue hover:bg-trading-darkBlue"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Market'}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Analysis Results */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-trading-blue" />
                      Analysis Results
                    </CardTitle>
                    <CardDescription>
                      {analysis 
                        ? `Analysis for ${analysis.symbol} on ${analysis.timeframe} timeframe`
                        : 'Submit an analysis request to see results'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis ? (
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                          <div>
                            <Badge 
                              className={`text-sm px-3 py-1 ${
                                analysis.direction === 'BUY' 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {analysis.direction === 'BUY' ? (
                                <TrendingUp className="mr-1 h-3 w-3" />
                              ) : (
                                <TrendingDown className="mr-1 h-3 w-3" />
                              )}
                              {analysis.direction}
                            </Badge>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {formatTimestamp(analysis.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            <span className="font-medium">Confidence:</span>
                            <span className="ml-1">{analysis.confidence}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Summary</h3>
                          <p className="text-muted-foreground">{analysis.analysis_summary}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Entry Price</div>
                            <div className="font-medium text-lg">{analysis.entry_price}</div>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Stop Loss</div>
                            <div className="font-medium text-lg text-red-600">{analysis.stop_loss}</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Take Profit</div>
                            <div className="font-medium text-lg text-green-600">{analysis.take_profit}</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-2">Technical Indicators</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">RSI</div>
                              <div className="font-medium">{analysis.technical_indicators.rsi}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">MACD</div>
                              <div className="font-medium">{analysis.technical_indicators.macd}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">SMA 50</div>
                              <div className="font-medium">{analysis.technical_indicators.moving_averages.sma_50}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">SMA 200</div>
                              <div className="font-medium">{analysis.technical_indicators.moving_averages.sma_200}</div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium mb-2">Support Levels</h3>
                            <div className="space-y-2">
                              {analysis.support_resistance.support_levels.map((level, index) => (
                                <div key={index} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                  <span>Support {index + 1}</span>
                                  <span className="font-medium">{level}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">Resistance Levels</h3>
                            <div className="space-y-2">
                              {analysis.support_resistance.resistance_levels.map((level, index) => (
                                <div key={index} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                  <span>Resistance {index + 1}</span>
                                  <span className="font-medium">{level}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <LineChart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Fill out the form on the left and click "Analyze Market" to generate 
                          AI-powered trading signals and market analysis.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Signal History Tab */}
            <TabsContent value="signal-history" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <Select 
                    value={marketType} 
                    onValueChange={(value) => {
                      setMarketType(value);
                      refetchSignals();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="stocks">Stocks</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={timeframe} 
                    onValueChange={(value) => {
                      setTimeframe(value);
                      refetchSignals();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="30m">30 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">Daily</SelectItem>
                      <SelectItem value="1w">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => refetchSignals()}
                  className="w-full md:w-auto"
                >
                  Refresh Signals
                </Button>
              </div>
              
              {signalsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-trading-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading trading signals...</p>
                </div>
              ) : signalsError ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Error Loading Signals</h3>
                        <p className="text-muted-foreground text-sm">
                          There was a problem loading trading signals. Please try again later.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => refetchSignals()}
                          className="mt-2"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : signals && signals.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {signals.map((signal: TradingSignal) => (
                    <Card key={signal.id} className="overflow-hidden">
                      <div className={`h-1 ${
                        signal.direction === 'BUY' 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`} />
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4 items-start justify-between">
                          <div>
                            <div className="flex items-center mb-1">
                              <h3 className="font-medium text-lg mr-2">{signal.symbol}</h3>
                              <Badge 
                                className={`text-xs ${
                                  signal.direction === 'BUY' 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {signal.direction}
                              </Badge>
                              <Badge className="ml-2 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                                {signal.strength}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(signal.timestamp)}
                              <span className="mx-2">•</span>
                              <span>{signal.timeframe}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full text-sm">
                            <span className="font-medium">Confidence:</span>
                            <span className="ml-1">{signal.confidence}%</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Entry</div>
                            <div className="font-medium">{signal.entry_price}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Stop Loss</div>
                            <div className="font-medium text-red-600">{signal.stop_loss}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Take Profit</div>
                            <div className="font-medium text-green-600">{signal.take_profit}</div>
                          </div>
                        </div>
                        
                        <p className="mt-4 text-sm text-muted-foreground">{signal.analysis}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <BarChart2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Signals Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    No trading signals available for the selected market and timeframe. 
                    Try changing your selection or check back later.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <Footer />
      
      {/* Payment Modal */}
      {isPaymentModalOpen && selectedRobot && (
        <EnhancedPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          robot={selectedRobot}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default AITradingSignals;
