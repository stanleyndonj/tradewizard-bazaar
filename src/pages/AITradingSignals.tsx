import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, TrendingUp, Loader2, Home, MessageCircle, Settings, Bell } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { TradingSignal, MarketAnalysis } from '@/lib/backend';
import SubscriptionRequired from '@/components/trading/SubscriptionRequired';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AITradingChat from '@/components/trading/AITradingChat';
import MarketDataWidget from '@/components/trading/MarketDataWidget';
import NewsWidget from '@/components/trading/NewsWidget';
import Navbar from '@/components/layout/Navbar';

const AITradingSignals = () => {
  const { user, getTradingSignals, analyzeMarket } = useBackend();
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [selectedMarket, setSelectedMarket] = useState('forex');
  const [selectedTimeframe, setSelectedTimeframe] = useState('H1');
  const [symbolToAnalyze, setSymbolToAnalyze] = useState('EURUSD');
  const [loading, setLoading] = useState(true);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signals');
  const navigate = useNavigate();
  const { tab } = useParams();
  
  // Determine if user has access to this feature
  const hasAccess = user?.is_admin || (user && user.role === 'premium');

  useEffect(() => {
    if (tab && ['signals', 'analysis', 'chat', 'market-data', 'news'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
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
    } catch (error) {
      console.error('Error analyzing market:', error);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/ai-trading-signals/${value !== 'signals' ? value : ''}`);
  };

  if (!hasAccess) {
    return <SubscriptionRequired message="You need to subscribe to access AI Trading Signals" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Fixed top navigation for quick access */}
      <div className="sticky top-16 z-10 bg-background border-b px-4 py-2 shadow-sm flex items-center justify-between">
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
          <Button 
            variant={activeTab === 'signals' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTabChange('signals')}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Signals
          </Button>
          <Button 
            variant={activeTab === 'analysis' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTabChange('analysis')}
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Analysis
          </Button>
          <Button 
            variant={activeTab === 'chat' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTabChange('chat')}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            AI Chat
          </Button>
          <Button 
            variant={activeTab === 'market-data' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTabChange('market-data')}
          >
            <Bell className="h-4 w-4 mr-1" />
            Market Data
          </Button>
          <Button 
            variant={activeTab === 'news' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTabChange('news')}
          >
            <Settings className="h-4 w-4 mr-1" />
            News
          </Button>
        </div>
        
        <Button variant="secondary" size="sm" asChild>
          <Link to="/dashboard">
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
        <h1 className="text-3xl font-bold mb-6">AI Trading Signals</h1>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
            <TabsTrigger value="chat">AI Trading Chat</TabsTrigger>
            <TabsTrigger value="market-data">Market Data</TabsTrigger>
            <TabsTrigger value="news">Market News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signals">
            <Card className="mb-8">
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
                      <Card key={signal.id} className={`border-l-4 ${
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
          </TabsContent>
          
          <TabsContent value="analysis">
            <Card className="mb-8">
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
                  <Card>
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
                      
                      <Separator className="my-6" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <CardFooter className="text-xs text-gray-500">
                      Analysis generated on: {new Date(marketAnalysis.created_at).toLocaleString()}
                    </CardFooter>
                  </Card>
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="chat">
            <AITradingChat />
          </TabsContent>
          
          <TabsContent value="market-data">
            <MarketDataWidget />
          </TabsContent>
          
          <TabsContent value="news">
            <NewsWidget />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AITradingSignals;
