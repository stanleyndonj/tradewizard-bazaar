import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  Loader2, 
  Home, 
  MessageCircle, 
  PieChart, 
  BarChart, 
  Newspaper 
} from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { TradingSignal, MarketAnalysis } from '@/lib/backend';
import SubscriptionRequired from '@/components/trading/SubscriptionRequired';
import { useNavigate, Link } from 'react-router-dom';
import AITradingChat from '@/components/trading/AITradingChat';
import MarketDataWidget from '@/components/trading/MarketDataWidget';
import NewsWidget from '@/components/trading/NewsWidget';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from '@/hooks/use-toast';

const AITradingSignals = () => {
  const { user, getTradingSignals, analyzeMarket } = useBackend();
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [selectedMarket, setSelectedMarket] = useState('forex');
  const [selectedTimeframe, setSelectedTimeframe] = useState('H1');
  const [symbolToAnalyze, setSymbolToAnalyze] = useState('EURUSD');
  const [loading, setLoading] = useState(true);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [activeView, setActiveView] = useState('signals');
  const navigate = useNavigate();
  
  // Determine if user has access to this feature
  const hasAccess = user?.is_admin || (user && user.role === 'premium');

  useEffect(() => {
    document.title = 'AI Trading Signals | TradeWizard';
    
    if (hasAccess) {
      fetchSignals();
    }
  }, [hasAccess, selectedMarket, selectedTimeframe]);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const data = await getTradingSignals(selectedMarket, selectedTimeframe, 10);
      setSignals(data);
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trading signals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!symbolToAnalyze) return;
    
    try {
      setAnalyzeLoading(true);
      const data = await analyzeMarket(symbolToAnalyze, selectedTimeframe);
      setMarketAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: `Analysis for ${symbolToAnalyze} completed successfully.`,
      });
    } catch (error) {
      console.error('Error analyzing market:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete market analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzeLoading(false);
    }
  };

  if (!hasAccess) {
    return <SubscriptionRequired message="You need to subscribe to access AI Trading Signals" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">AI Trading Signals</h1>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
            
            {/* Premium Features Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant={activeView === 'signals' ? "default" : "outline"} 
                  className="flex items-center justify-center py-3"
                  onClick={() => setActiveView('signals')}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span>Trading Signals</span>
                </Button>
                
                <Button 
                  variant={activeView === 'analysis' ? "default" : "outline"}
                  className="flex items-center justify-center py-3"
                  onClick={() => setActiveView('analysis')}
                >
                  <PieChart className="h-5 w-5 mr-2" />
                  <span>Market Analysis</span>
                </Button>
                
                <Button 
                  variant={activeView === 'chat' ? "default" : "outline"}
                  className="flex items-center justify-center py-3"
                  onClick={() => setActiveView('chat')}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span>AI Assistant</span>
                </Button>
                
                <Button 
                  variant={activeView === 'market-data' ? "default" : "outline"}
                  className="flex items-center justify-center py-3"
                  onClick={() => setActiveView('market-data')}
                >
                  <BarChart className="h-5 w-5 mr-2" />
                  <span>Market Data</span>
                </Button>
              </div>
            </div>
            
            {/* Active View Content */}
            {activeView === 'signals' && (
              <Card>
                <CardHeader>
                  <CardTitle>Latest Trading Signals</CardTitle>
                  <CardDescription>
                    AI-generated trading signals with high accuracy based on market analysis
                  </CardDescription>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="w-full sm:w-auto">
                      <Label htmlFor="market">Market</Label>
                      <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                        <SelectTrigger className="w-full sm:w-[200px]">
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
                    <div className="w-full sm:w-auto">
                      <Label htmlFor="timeframe">Timeframe</Label>
                      <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div className="w-full sm:w-auto flex items-end">
                      <Button onClick={fetchSignals} className="w-full sm:w-auto">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Refresh Signals'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : signals.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No trading signals available for the selected criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {signals.map((signal) => (
                        <Card key={signal.id} className={`border-l-4 hover:shadow-md transition-shadow ${
                          signal.direction === 'buy' ? 'border-l-green-500' : 'border-l-red-500'
                        }`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <h3 className="text-lg font-bold">{signal.symbol}</h3>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                  signal.direction === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {signal.timeframe || 'H1'}
                                </span>
                              </div>
                              {signal.status && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  signal.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                                  signal.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {signal.status}
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center mb-4">
                              {signal.direction === 'buy' ? (
                                <ArrowUp className="h-6 w-6 text-green-500 mr-2" />
                              ) : (
                                <ArrowDown className="h-6 w-6 text-red-500 mr-2" />
                              )}
                              <span className="text-lg font-semibold">
                                {signal.direction.toUpperCase()}
                              </span>
                              <div className="ml-auto flex flex-col items-end">
                                <span className="text-sm text-muted-foreground">Confidence</span>
                                <span className="text-sm font-medium">
                                  {signal.confidence ? `${Math.round(signal.confidence * 100)}%` : 'N/A'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <div className="text-muted-foreground">Entry Price</div>
                              <div className="text-right font-medium">{signal.entry_price}</div>
                              
                              {signal.stop_loss && (
                                <>
                                  <div className="text-muted-foreground">Stop Loss</div>
                                  <div className="text-right font-medium text-red-600">{signal.stop_loss}</div>
                                </>
                              )}
                              
                              {signal.take_profit && (
                                <>
                                  <div className="text-muted-foreground">Take Profit</div>
                                  <div className="text-right font-medium text-green-600">{signal.take_profit}</div>
                                </>
                              )}
                              
                              <div className="text-muted-foreground">Time</div>
                              <div className="text-right font-medium">
                                {signal.timestamp ? new Date(signal.timestamp).toLocaleString() : 
                                 new Date(signal.created_at).toLocaleString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {activeView === 'analysis' && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Market Analysis</CardTitle>
                  <CardDescription>
                    Get in-depth analysis of any trading pair across multiple timeframes
                  </CardDescription>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="w-full sm:w-auto">
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input 
                        id="symbol" 
                        value={symbolToAnalyze} 
                        onChange={(e) => setSymbolToAnalyze(e.target.value)} 
                        placeholder="e.g. EURUSD, BTCUSD" 
                        className="w-full sm:w-[200px]"
                      />
                    </div>
                    <div className="w-full sm:w-auto">
                      <Label htmlFor="analysis-timeframe">Timeframe</Label>
                      <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div className="w-full sm:w-auto flex items-end">
                      <Button onClick={handleAnalyze} className="w-full sm:w-auto">
                        {analyzeLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze Market'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {analyzeLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : !marketAnalysis ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Enter a symbol and click "Analyze Market" to get detailed analysis.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Card className="border-t-4 border-t-primary">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl flex items-center">
                            {marketAnalysis.symbol} - {marketAnalysis.timeframe} Analysis
                            <span className={`ml-auto px-3 py-1 rounded-full text-sm ${
                              marketAnalysis.trend === 'bullish' ? 'bg-green-100 text-green-800' : 
                              marketAnalysis.trend === 'bearish' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {marketAnalysis.trend.toUpperCase()} TREND
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {marketAnalysis.summary && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-md">
                              <h4 className="font-semibold mb-2 flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5" />
                                Market Summary
                              </h4>
                              <p className="text-gray-700">{marketAnalysis.summary}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3">Key Levels</h4>
                              <div className="space-y-4">
                                <div>
                                  <Label>Support Levels</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {marketAnalysis.support_levels.map((level, i) => (
                                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                        {level}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Resistance Levels</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {marketAnalysis.resistance_levels.map((level, i) => (
                                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                        {level}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {marketAnalysis.next_price_target !== undefined && (
                                  <div>
                                    <Label>Next Price Target</Label>
                                    <div className="font-medium text-green-600 mt-1">{marketAnalysis.next_price_target}</div>
                                  </div>
                                )}
                                {marketAnalysis.stop_loss_suggestion !== undefined && (
                                  <div>
                                    <Label>Suggested Stop Loss</Label>
                                    <div className="font-medium text-red-600 mt-1">{marketAnalysis.stop_loss_suggestion}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-3">Technical Indicators</h4>
                              <div className="space-y-4">
                                <div>
                                  <Label>RSI</Label>
                                  <div className="flex items-center mt-1">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className={`h-2.5 rounded-full ${
                                          marketAnalysis.indicators.rsi > 70 ? 'bg-red-500' : 
                                          marketAnalysis.indicators.rsi < 30 ? 'bg-green-500' : 
                                          'bg-blue-500'
                                        }`} 
                                        style={{ width: `${marketAnalysis.indicators.rsi}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-sm">{marketAnalysis.indicators.rsi}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>MACD</Label>
                                  <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                                    <div>
                                      <span className="text-gray-500">Value:</span> 
                                      <span className={marketAnalysis.indicators.macd.value > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {marketAnalysis.indicators.macd.value.toFixed(2)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Signal:</span> 
                                      <span>{marketAnalysis.indicators.macd.signal.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Histogram:</span> 
                                      <span className={marketAnalysis.indicators.macd.histogram > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {marketAnalysis.indicators.macd.histogram.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Moving Averages</Label>
                                  <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                                    <div>
                                      <span className="text-gray-500">MA20:</span> 
                                      <span>{marketAnalysis.indicators.moving_averages.ma20.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">MA50:</span> 
                                      <span>{marketAnalysis.indicators.moving_averages.ma50.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">MA200:</span> 
                                      <span>{marketAnalysis.indicators.moving_averages.ma200.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                              <h4 className="font-semibold mb-3">Recommendation</h4>
                              <div className={`p-3 rounded-md ${
                                marketAnalysis.recommendation.toLowerCase().includes('buy') ? 'bg-green-100' : 
                                marketAnalysis.recommendation.toLowerCase().includes('sell') ? 'bg-red-100' : 
                                'bg-yellow-100'
                              }`}>
                                {marketAnalysis.recommendation}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-3">Next Potential Move</h4>
                              <div className="p-3 rounded-md bg-blue-50">
                                {marketAnalysis.next_potential_move}
                              </div>
                              
                              <div className="mt-4">
                                <Label>Risk/Reward Ratio</Label>
                                <div className="font-medium mt-1">
                                  {marketAnalysis.risk_reward_ratio.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {activeView === 'chat' && (
              <div className="grid grid-cols-1 gap-6">
                <AITradingChat />
              </div>
            )}
            
            {activeView === 'market-data' && (
              <div className="grid grid-cols-1 gap-6">
                <MarketDataWidget />
              </div>
            )}
            
            {activeView === 'news' && (
              <div className="grid grid-cols-1 gap-6">
                <NewsWidget />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AITradingSignals;
