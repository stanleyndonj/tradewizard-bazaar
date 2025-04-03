
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import { TradingLoader } from '@/components/ui/loader';
import Navbar from '@/components/layout/Navbar';
import SubscriptionRequired from '@/components/trading/SubscriptionRequired';
import AITradingChat from '@/components/trading/AITradingChat';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, TrendingUp, MessageSquare, BarChart, ChevronDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTradingSignals, analyzeMarket, TradingSignal, MarketAnalysis } from '@/lib/backend';

const AITradingSignals = () => {
  const { user } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccessRights, setHasAccessRights] = useState(false);
  const [activeTab, setActiveTab] = useState("signals");
  const [market, setMarket] = useState("forex");
  const [timeframe, setTimeframe] = useState("1h");
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("EUR/USD");
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Fetch signals function
  const fetchSignals = async () => {
    if (!hasAccessRights) return;
    
    setSignalsLoading(true);
    try {
      const data = await getTradingSignals(market, timeframe);
      setSignals(data);
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      toast({
        title: "Error",
        description: "Failed to load trading signals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSignalsLoading(false);
    }
  };

  // Fetch analysis function
  const fetchAnalysis = async () => {
    if (!hasAccessRights || !selectedSymbol) return;
    
    setAnalysisLoading(true);
    try {
      const data = await analyzeMarket(selectedSymbol, timeframe);
      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching market analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load market analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    // Set page title
    document.title = 'AI Trading Signals | TradeWizard';
    
    // Check if user has access to trading signals
    const checkAccess = async () => {
      if (user) {
        // Admin users always have access
        if (user.is_admin) {
          setHasAccessRights(true);
        } else {
          // Regular users need a subscription
          setHasAccessRights(!!user.robots_delivered);
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user]);

  // Fetch trading signals when market or timeframe changes
  useEffect(() => {
    if (hasAccessRights) {
      fetchSignals();
    }
  }, [hasAccessRights, market, timeframe]);

  // Fetch analysis when symbol changes
  useEffect(() => {
    if (hasAccessRights && selectedSymbol) {
      fetchAnalysis();
    }
  }, [hasAccessRights, selectedSymbol, timeframe]);

  // If not logged in, redirect to auth page
  if (user === null) {
    // Save current URL to redirect back after login
    localStorage.setItem('redirectAfterAuth', '/ai-trading-signals');
    toast({
      title: "Authentication required",
      description: "Please sign in to access AI Trading Signals",
      variant: "destructive",
    });
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 px-4 max-w-7xl mt-20 flex-grow flex items-center justify-center">
          <TradingLoader text="Loading AI Trading Signals..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto py-8 px-4 max-w-7xl mt-20 flex-grow">
        <div className="flex items-center gap-3 mb-6">
          <Bot className="h-8 w-8 text-trading-blue" />
          <h1 className="text-4xl font-bold">AI Trading Signals</h1>
          {user?.is_admin && (
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
              Admin View
            </span>
          )}
        </div>
        
        {hasAccessRights ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signals" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Trading Signals</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>AI Assistant</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signals" className="animate-fade-in">
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Market</CardTitle>
                    <CardDescription>Select market type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={market} onValueChange={setMarket}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forex">Forex</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="stocks">Stocks</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Timeframe</CardTitle>
                    <CardDescription>Select trading timeframe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5m">5 Minutes</SelectItem>
                        <SelectItem value="15m">15 Minutes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="1d">Daily</SelectItem>
                        <SelectItem value="1w">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Symbol</CardTitle>
                    <CardDescription>Select trading pair</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select symbol" />
                      </SelectTrigger>
                      <SelectContent>
                        {market === "forex" ? (
                          <>
                            <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                            <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                            <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                            <SelectItem value="USD/CHF">USD/CHF</SelectItem>
                          </>
                        ) : market === "crypto" ? (
                          <>
                            <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                            <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                            <SelectItem value="XRP/USD">XRP/USD</SelectItem>
                            <SelectItem value="LTC/USD">LTC/USD</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="AAPL">AAPL</SelectItem>
                            <SelectItem value="MSFT">MSFT</SelectItem>
                            <SelectItem value="AMZN">AMZN</SelectItem>
                            <SelectItem value="GOOGL">GOOGL</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Latest Trading Signals</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchSignals}
                        disabled={signalsLoading}
                      >
                        Refresh
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {signalsLoading ? (
                      <div className="flex justify-center items-center h-80">
                        <TradingLoader text="Loading signals..." />
                      </div>
                    ) : signals.length > 0 ? (
                      <div className="divide-y">
                        {signals.slice(0, 5).map((signal) => (
                          <div key={signal.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{signal.symbol}</span>
                                <Badge variant={signal.direction === 'BUY' ? 'success' : 'destructive'}>
                                  {signal.direction}
                                </Badge>
                                <Badge variant="outline">{signal.timeframe}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(signal.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {signal.analysis}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-background p-2 rounded">
                                <span className="block font-medium">Entry</span>
                                <span>{signal.entry_price}</span>
                              </div>
                              <div className="bg-background p-2 rounded">
                                <span className="block font-medium">Stop Loss</span>
                                <span>{signal.stop_loss}</span>
                              </div>
                              <div className="bg-background p-2 rounded">
                                <span className="block font-medium">Take Profit</span>
                                <span>{signal.take_profit}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center text-xs text-muted-foreground">
                              <span className="mr-1">Confidence:</span>
                              <span className={`font-medium ${
                                signal.confidence > 80 ? 'text-green-600' : 
                                signal.confidence > 65 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {signal.confidence}%
                              </span>
                              <span className="ml-4 mr-1">Strength:</span>
                              <span className="font-medium">{signal.strength}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-80 text-muted-foreground">
                        No signals available for the selected market and timeframe
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Market Analysis: {selectedSymbol}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchAnalysis}
                        disabled={analysisLoading}
                      >
                        Refresh
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {analysisLoading ? (
                      <div className="flex justify-center items-center h-80">
                        <TradingLoader text="Analyzing market..." />
                      </div>
                    ) : analysis ? (
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <Badge 
                            variant={analysis.direction === 'BUY' ? 'success' : 'destructive'}
                            className="mr-2 text-base py-1 px-3"
                          >
                            {analysis.direction}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(analysis.timestamp).toLocaleString()}
                          </span>
                          <span className="ml-auto font-medium">
                            Confidence: {analysis.confidence}%
                          </span>
                        </div>
                        
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <h3 className="font-medium mb-1">Analysis Summary</h3>
                          <p className="text-sm">{analysis.analysis_summary}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-background p-2 rounded">
                            <span className="block font-medium text-sm">Entry Price</span>
                            <span className="text-lg">{analysis.entry_price}</span>
                          </div>
                          <div className="bg-background p-2 rounded">
                            <span className="block font-medium text-sm">Stop Loss</span>
                            <span className="text-lg">{analysis.stop_loss}</span>
                          </div>
                          <div className="bg-background p-2 rounded">
                            <span className="block font-medium text-sm">Take Profit</span>
                            <span className="text-lg">{analysis.take_profit}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Technical Indicators</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>RSI</span>
                              <span className={`font-medium ${
                                analysis.technical_indicators.rsi > 70 ? 'text-red-600' : 
                                analysis.technical_indicators.rsi < 30 ? 'text-green-600' : ''
                              }`}>
                                {analysis.technical_indicators.rsi}
                              </span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>MACD</span>
                              <span className={`font-medium ${
                                analysis.technical_indicators.macd > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {analysis.technical_indicators.macd}
                              </span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>SMA 50</span>
                              <span>{analysis.technical_indicators.moving_averages.sma_50}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>SMA 200</span>
                              <span>{analysis.technical_indicators.moving_averages.sma_200}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>EMA 12</span>
                              <span>{analysis.technical_indicators.moving_averages.ema_12}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/30 rounded">
                              <span>EMA 26</span>
                              <span>{analysis.technical_indicators.moving_averages.ema_26}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium mb-2">Support Levels</h3>
                            <div className="space-y-1">
                              {analysis.support_resistance.support_levels.map((level, index) => (
                                <div key={index} className="flex justify-between p-2 bg-green-50 border border-green-100 rounded">
                                  <span>S{index + 1}</span>
                                  <span className="font-medium">{level}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">Resistance Levels</h3>
                            <div className="space-y-1">
                              {analysis.support_resistance.resistance_levels.map((level, index) => (
                                <div key={index} className="flex justify-between p-2 bg-red-50 border border-red-100 rounded">
                                  <span>R{index + 1}</span>
                                  <span className="font-medium">{level}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-80 text-muted-foreground">
                        Select a symbol and timeframe to see analysis
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Signal History</CardTitle>
                    <CardDescription>
                      Recent trading signals and their performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="flex justify-between p-4 hover:bg-muted/20 transition-colors">
                        <div>
                          <span className="font-medium block">Gold (XAU/USD)</span>
                          <span className="text-xs text-muted-foreground">Jun 15, 2023 - 4H Timeframe</span>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-medium block">+2.3%</span>
                          <span className="text-xs text-muted-foreground">Target Hit</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-4 hover:bg-muted/20 transition-colors">
                        <div>
                          <span className="font-medium block">USD/JPY</span>
                          <span className="text-xs text-muted-foreground">Jun 12, 2023 - 1H Timeframe</span>
                        </div>
                        <div className="text-right">
                          <span className="text-red-600 font-medium block">-0.8%</span>
                          <span className="text-xs text-muted-foreground">Stopped Out</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-4 hover:bg-muted/20 transition-colors">
                        <div>
                          <span className="font-medium block">S&P 500</span>
                          <span className="text-xs text-muted-foreground">Jun 10, 2023 - Daily Timeframe</span>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-medium block">+1.5%</span>
                          <span className="text-xs text-muted-foreground">Target Hit</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-4 hover:bg-muted/20 transition-colors">
                        <div>
                          <span className="font-medium block">BTC/USD</span>
                          <span className="text-xs text-muted-foreground">Jun 8, 2023 - 4H Timeframe</span>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-medium block">+3.2%</span>
                          <span className="text-xs text-muted-foreground">Target Hit</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-4 hover:bg-muted/20 transition-colors">
                        <div>
                          <span className="font-medium block">EUR/GBP</span>
                          <span className="text-xs text-muted-foreground">Jun 5, 2023 - 1H Timeframe</span>
                        </div>
                        <div className="text-right">
                          <span className="text-red-600 font-medium block">-1.1%</span>
                          <span className="text-xs text-muted-foreground">Stopped Out</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="animate-fade-in">
              <AITradingChat />
            </TabsContent>
          </Tabs>
        ) : (
          <SubscriptionRequired />
        )}
      </div>
    </div>
  );
};

export default AITradingSignals;
