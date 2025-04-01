
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, TrendingUp, Lock, Search, LineChart, Clock, Zap, BarChart3, CandlestickChart } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { MarketAnalysis, TradingSignal, analyzeMarket, getTradingSignals } from '@/lib/backend';
import EnhancedPaymentModal from '@/components/marketplace/EnhancedPaymentModal';
import { TradingLoader } from '@/components/ui/loader';

// Import the new components
import MarketDataWidget from '@/components/trading/MarketDataWidget';
import TradingCalculators from '@/components/trading/TradingCalculators';
import AITradingChat from '@/components/trading/AITradingChat';
import NewsWidget from '@/components/trading/NewsWidget';

const AITradingSignals = () => {
  const navigate = useNavigate();
  const { user, robots, isLoading: backendLoading } = useBackend();
  
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [analysisResult, setAnalysisResult] = useState<MarketAnalysis | null>(null);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('forex');
  const [timeframe, setTimeframe] = useState('1h');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [customSymbol, setCustomSymbol] = useState('EUR/USD');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('signals');
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState<any>(null);

  useEffect(() => {
    document.title = 'AI Trading Signals | TradeWizard';
    
    if (!backendLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access AI Trading Signals",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [backendLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      // Check if user has subscription or is admin
      const checkAccess = async () => {
        try {
          // Check if user email is in admin list or has robots_delivered
          setHasSubscription(user.robots_delivered || false);
          setIsAdmin(user.is_admin || false);
          
          if (user.robots_delivered || user.is_admin) {
            // Load signals for users with access
            await loadSignals(activeTab, timeframe);
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
        } finally {
          setSignalsLoading(false);
        }
      };
      
      checkAccess();
    }
  }, [user, activeTab, timeframe]);

  const loadSignals = async (market: string, tf: string) => {
    setSignalsLoading(true);
    try {
      const data = await getTradingSignals(market, tf);
      setSignals(data);
    } catch (error) {
      console.error("Error loading signals:", error);
      toast({
        title: "Error loading signals",
        description: "Failed to load trading signals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSignalsLoading(false);
    }
  };

  const handleMarketChange = (value: string) => {
    setActiveTab(value);
    loadSignals(value, timeframe);
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    loadSignals(activeTab, value);
  };

  const handleSymbolAnalysis = async () => {
    if (!customSymbol) {
      toast({
        title: "Symbol required",
        description: "Please enter a trading symbol to analyze",
        variant: "destructive",
      });
      return;
    }
    
    setAnalysisLoading(true);
    try {
      const analysis = await analyzeMarket(customSymbol, timeframe);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error("Error analyzing market:", error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Find a premium robot for payment modal
  const findPremiumRobot = () => {
    // Find first premium robot or create a placeholder
    const premiumRobot = robots.find(robot => (robot.category || 'paid') === 'paid');
    
    if (premiumRobot) {
      return premiumRobot;
    } else {
      // Create a placeholder if no premium robot exists
      return {
        id: "premium-ai-signals",
        name: "AI Trading Signals Premium",
        price: 49.99,
        currency: "USD",
        description: "Get unlimited access to AI Trading Signals"
      };
    }
  };

  // Handle subscription upgrade - Open payment modal directly
  const handleUpgradeSubscription = () => {
    const premiumRobot = findPremiumRobot();
    setSelectedRobot(premiumRobot);
    setIsPaymentModalOpen(true);
  };

  // Handle successful payment
  const handlePaymentComplete = (paymentMethod: string) => {
    // This would typically involve a backend call to verify payment
    toast({
      title: "Payment successful",
      description: `Your payment via ${paymentMethod} has been received. Your subscription is now active.`,
    });
    
    // Update user subscription status
    setHasSubscription(true);
    
    // Load signals
    loadSignals(activeTab, timeframe);
    
    // Close modal
    setIsPaymentModalOpen(false);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Show loading state with our trading loader for all loading states
  if (backendLoading || (signalsLoading && (hasSubscription || isAdmin))) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <TradingLoader text="Loading AI Trading Signals..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="section-container py-10">
          {/* Access restricted UI for non-subscribers */}
          {!hasSubscription && !isAdmin && (
            <div className="max-w-4xl mx-auto text-center py-16">
              <div className="mb-8">
                <Badge variant="outline" className="px-3 py-1 text-sm mb-2">
                  <Lock className="w-3 h-3 mr-1" /> Premium Feature
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  AI Trading Signals
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Get access to real-time AI-powered trading signals, market analysis, news, and trading tools with our premium subscription.
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-10">
                <Card className="bg-muted/50">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-trading-blue" />
                      Market Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Receive real-time trading signals with entry, exit, and stop-loss points.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl flex items-center">
                      <CandlestickChart className="mr-2 h-5 w-5 text-trading-green" />
                      Technical Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      In-depth technical analysis for any trading pair or asset.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-trading-red" />
                      Trading Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Advanced tools including position calculators, watchlists, and AI chat.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Button 
                size="lg" 
                className="mt-6"
                onClick={handleUpgradeSubscription}
              >
                Upgrade Subscription
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Instant access after payment. Cancel anytime.
              </p>
            </div>
          )}
          
          {/* Premium content for subscribers and admins */}
          {(hasSubscription || isAdmin) && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">AI Trading Signals</h1>
                  <p className="text-muted-foreground">
                    AI-powered trading signals and market analysis
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    <Clock className="w-3 h-3 mr-1" /> {timeframe}
                  </Badge>
                  <Badge variant="outline" className="bg-trading-blue/10 text-trading-blue px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" /> {isAdmin ? 'Admin Access' : 'Premium Access'}
                  </Badge>
                </div>
              </div>
              
              {/* Main navigation tabs */}
              <Tabs defaultValue="signals" value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="w-full grid grid-cols-4 mb-6">
                  <TabsTrigger value="signals">Signals</TabsTrigger>
                  <TabsTrigger value="market-data">Market Data</TabsTrigger>
                  <TabsTrigger value="tools">Trading Tools</TabsTrigger>
                  <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
                </TabsList>
                
                {/* Signals Tab Content */}
                <TabsContent value="signals" className="space-y-6">
                  <Tabs defaultValue="forex" value={activeTab} onValueChange={handleMarketChange}>
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                      <TabsList className="mb-4 md:mb-0">
                        <TabsTrigger value="forex">Forex</TabsTrigger>
                        <TabsTrigger value="crypto">Crypto</TabsTrigger>
                        <TabsTrigger value="stocks">Stocks</TabsTrigger>
                      </TabsList>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleTimeframeChange('5m')} className={timeframe === '5m' ? 'bg-secondary' : ''}>5m</Button>
                        <Button variant="outline" size="sm" onClick={() => handleTimeframeChange('15m')} className={timeframe === '15m' ? 'bg-secondary' : ''}>15m</Button>
                        <Button variant="outline" size="sm" onClick={() => handleTimeframeChange('1h')} className={timeframe === '1h' ? 'bg-secondary' : ''}>1h</Button>
                        <Button variant="outline" size="sm" onClick={() => handleTimeframeChange('4h')} className={timeframe === '4h' ? 'bg-secondary' : ''}>4h</Button>
                        <Button variant="outline" size="sm" onClick={() => handleTimeframeChange('1d')} className={timeframe === '1d' ? 'bg-secondary' : ''}>1d</Button>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-grow">
                          <Label htmlFor="symbol-search">Custom Symbol Analysis</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="symbol-search"
                              placeholder="Enter symbol (e.g., EUR/USD, BTC/USD)"
                              value={customSymbol}
                              onChange={(e) => setCustomSymbol(e.target.value)}
                            />
                            <Button onClick={handleSymbolAnalysis} disabled={analysisLoading}>
                              {analysisLoading ? 'Analyzing...' : 'Analyze'}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="w-full md:w-auto">
                          <Label htmlFor="quick-search">Quick Filter</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="quick-search"
                              placeholder="Filter signals..."
                              value={searchSymbol}
                              onChange={(e) => setSearchSymbol(e.target.value)}
                              className="w-full md:w-[200px]"
                            />
                            <Button variant="outline">
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Analysis Result */}
                    {analysisResult && (
                      <Card className="mb-8 bg-muted/30 border-trading-blue/20">
                        <CardHeader>
                          <CardTitle className="text-xl flex justify-between">
                            <span>Analysis: {analysisResult.symbol}</span>
                            <Badge className={`${analysisResult.direction === 'BUY' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                              {analysisResult.direction}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Confidence: {analysisResult.confidence}% • Timeframe: {analysisResult.timeframe}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-background rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground">Entry Price</p>
                              <p className="text-lg font-semibold">{analysisResult.entry_price}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground">Stop Loss</p>
                              <p className="text-lg font-semibold text-red-500">{analysisResult.stop_loss}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground">Take Profit</p>
                              <p className="text-lg font-semibold text-green-500">{analysisResult.take_profit}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Analysis Summary</h4>
                            <p className="text-sm">{analysisResult.analysis_summary}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Technical Indicators</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>RSI:</span>
                                  <span className="font-medium">{analysisResult.technical_indicators.rsi}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>MACD:</span>
                                  <span className="font-medium">{analysisResult.technical_indicators.macd}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Support/Resistance</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Support:</span>
                                  <span className="font-medium">{analysisResult.support_resistance.support_levels.join(', ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Resistance:</span>
                                  <span className="font-medium">{analysisResult.support_resistance.resistance_levels.join(', ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Trading Signals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {signalsLoading ? (
                        <TradingLoader text="Generating signals..." />
                      ) : (
                        signals
                          .filter(signal => searchSymbol ? signal.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) : true)
                          .map((signal) => (
                            <Card key={signal.id} className="overflow-hidden">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <CardTitle>{signal.symbol}</CardTitle>
                                  <Badge className={signal.direction === 'BUY' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                                    {signal.direction}
                                  </Badge>
                                </div>
                                <CardDescription>
                                  {formatTime(signal.timestamp)} • {signal.timeframe} • {signal.strength}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pb-3">
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Entry</p>
                                    <p className="font-medium">{signal.entry_price}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Stop Loss</p>
                                    <p className="font-medium text-red-500">{signal.stop_loss}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Take Profit</p>
                                    <p className="font-medium text-green-500">{signal.take_profit}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Signal Analysis</p>
                                  <p className="text-sm">{signal.analysis}</p>
                                </div>
                              </CardContent>
                              <CardFooter className="bg-muted/30 py-3 border-t flex justify-between">
                                <Badge variant="outline" className="bg-primary/10">
                                  {signal.confidence}% Confidence
                                </Badge>
                                <Button variant="outline" size="sm">
                                  <LineChart className="h-4 w-4 mr-1" />
                                  Detailed Analysis
                                </Button>
                              </CardFooter>
                            </Card>
                          ))
                      )}
                    </div>
                  </Tabs>
                </TabsContent>
                
                {/* Market Data Tab Content */}
                <TabsContent value="market-data" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <MarketDataWidget />
                    </div>
                    <div>
                      <NewsWidget />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Trading Tools Tab Content */}
                <TabsContent value="tools" className="space-y-6">
                  <TradingCalculators />
                </TabsContent>
                
                {/* AI Chat Tab Content */}
                <TabsContent value="ai-chat" className="space-y-6">
                  <AITradingChat />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Payment Modal */}
      {isPaymentModalOpen && selectedRobot && (
        <EnhancedPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          robot={selectedRobot}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default AITradingSignals;
