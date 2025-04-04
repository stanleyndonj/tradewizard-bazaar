import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Eye, 
  AlertTriangle, 
  BarChart, 
  LineChart,
  Plus,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TradingLoader } from '@/components/ui/loader';
import { useBackend } from '@/context/BackendContext';
import { TradingSignal, MarketAnalysis } from '@/lib/backend';

const AITradingSignals = () => {
  const navigate = useNavigate();
  const { user, getTradingSignals, analyzeMarket } = useBackend();
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('forex');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [analysisSymbol, setAnalysisSymbol] = useState('BTCUSD');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'AI Trading Signals | TradeWizard';
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access AI Trading Signals",
        variant: "destructive",
      });
      localStorage.setItem('redirectAfterAuth', '/ai-trading-signals');
      navigate('/auth');
    } else {
      loadTradingSignals();
    }
  }, [user, navigate]);

  const loadTradingSignals = useCallback(async () => {
    setLoadingSignals(true);
    setError(null);
    try {
      const fetchedSignals = await getTradingSignals(selectedMarket, selectedTimeframe);
      setSignals(fetchedSignals);
    } catch (err: any) {
      console.error('Error fetching trading signals:', err);
      setError(err.message || 'Failed to load trading signals.');
      toast({
        title: "Error",
        description: err.message || "Failed to load trading signals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSignals(false);
    }
  }, [getTradingSignals, selectedMarket, selectedTimeframe]);

  const handleMarketAnalysis = async () => {
    setLoadingAnalysis(true);
    setError(null);
    try {
      const analysis = await analyzeMarket(analysisSymbol, selectedTimeframe);
      setMarketAnalysis(analysis);
    } catch (err: any) {
      console.error('Error analyzing market:', err);
      setError(err.message || 'Failed to analyze market.');
      toast({
        title: "Error",
        description: err.message || "Failed to analyze market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const getSignalStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong':
        return 'text-green-500';
      case 'Moderate':
        return 'text-yellow-500';
      case 'Weak':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const addToWatchlist = (signalId: string) => {
    setWatchlist(prev => {
      if (prev.includes(signalId)) {
        toast({
          title: "Info",
          description: "Signal already in watchlist",
        });
        return prev;
      }
      toast({
        title: "Success",
        description: "Signal added to watchlist",
        variant: "default"
      });
      return [...prev, signalId];
    });
  };

  const removeFromWatchlist = (signalId: string) => {
    setWatchlist(prev => {
      const newList = prev.filter(id => id !== signalId);
      toast({
        title: "Success",
        description: "Signal removed from watchlist",
        variant: "default"
      });
      return newList;
    });
  };

  const isInWatchlist = (signalId: string) => {
    return watchlist.includes(signalId);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="section-container py-10">
          <SectionHeader
            subtitle="Data-Driven Decisions"
            title="AI Trading Signals"
            description="Make informed trading decisions with our AI-powered trading signals and market analysis."
            centered
          />
          
          <div className="mt-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              {/* Market and Timeframe Selection */}
              <div className="flex items-center gap-4">
                <Select value={selectedMarket} onValueChange={(value) => {
                  setSelectedMarket(value);
                  loadTradingSignals();
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    {/* Add more markets as needed */}
                  </SelectContent>
                </Select>
                
                <Select value={selectedTimeframe} onValueChange={(value) => {
                  setSelectedTimeframe(value);
                  loadTradingSignals();
                }}>
                  <SelectTrigger className="w-[180px]">
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
                  </SelectContent>
                </Select>
              </div>
              
              {/* Market Analysis Input and Button */}
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Enter Symbol (e.g., BTCUSD)"
                  value={analysisSymbol}
                  onChange={(e) => setAnalysisSymbol(e.target.value)}
                  className="max-w-[200px]"
                />
                <Button onClick={handleMarketAnalysis} disabled={loadingAnalysis}>
                  {loadingAnalysis ? <TradingLoader size="sm" /> : 'Analyze Market'}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center mb-4">
                <AlertTriangle className="inline-block h-5 w-5 mr-2 align-middle" />
                {error}
              </div>
            )}
            
            {/* Trading Signals Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Trading Signals ({signals.length})
              </h2>
              
              {loadingSignals ? (
                <div className="flex justify-center">
                  <TradingLoader text="Loading signals..." />
                </div>
              ) : signals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {signals.map((signal) => (
                    <Card key={signal.id} className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {signal.symbol}
                          <Badge variant="secondary">{signal.market}</Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 text-xs">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimestamp(signal.timestamp)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {signal.direction === 'BUY' ? (
                            <TrendingUp className="text-green-500 h-5 w-5" />
                          ) : (
                            <TrendingDown className="text-red-500 h-5 w-5" />
                          )}
                          <p>
                            {signal.direction} -{' '}
                            <span className={getSignalStrengthColor(signal.strength)}>
                              {signal.strength}
                            </span>
                          </p>
                        </div>
                        <p className="text-sm">Confidence: {signal.confidence}%</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Entry:</p>
                            <p>{signal.entry_price}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stop Loss:</p>
                            <p>{signal.stop_loss}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Take Profit:</p>
                            <p>{signal.take_profit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Timeframe:</p>
                            <p>{signal.timeframe}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() =>
                            isInWatchlist(signal.id)
                              ? removeFromWatchlist(signal.id)
                              : addToWatchlist(signal.id)
                          }
                        >
                          {isInWatchlist(signal.id) ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Remove Watchlist
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Watchlist
                            </>
                          )}
                        </Button>
                        <a href={`https://www.tradingview.com/chart/?symbol=${signal.symbol}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Chart
                          </Button>
                        </a>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No trading signals available for the selected market and timeframe.</p>
                </div>
              )}
            </section>
            
            {/* Market Analysis Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Market Analysis</h2>
              
              {loadingAnalysis ? (
                <div className="flex justify-center">
                  <TradingLoader text="Analyzing market..." />
                </div>
              ) : marketAnalysis ? (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle>{marketAnalysis.symbol} Analysis</CardTitle>
                    <CardDescription className="flex items-center space-x-2 text-xs">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimestamp(marketAnalysis.timestamp)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <span className="font-semibold">Summary:</span>{' '}
                      {marketAnalysis.analysis_summary}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Direction:</p>
                        <p>{marketAnalysis.direction}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence:</p>
                        <p>{marketAnalysis.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Entry Price:</p>
                        <p>{marketAnalysis.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stop Loss:</p>
                        <p>{marketAnalysis.stop_loss}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Take Profit:</p>
                        <p>{marketAnalysis.take_profit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Sentiment:</p>
                        <p>{marketAnalysis.market_sentiment}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mt-4">Technical Indicators</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">RSI:</p>
                        <p>{marketAnalysis.technical_indicators.rsi}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">MACD:</p>
                        <p>{marketAnalysis.technical_indicators.macd}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SMA 50:</p>
                        <p>{marketAnalysis.technical_indicators.moving_averages.sma_50}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SMA 200:</p>
                        <p>{marketAnalysis.technical_indicators.moving_averages.sma_200}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a href={`https://www.tradingview.com/chart/?symbol=${marketAnalysis.symbol}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <BarChart className="h-4 w-4 mr-2" />
                        View Chart on TradingView
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Enter a symbol and click "Analyze Market" to view market analysis.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AITradingSignals;
