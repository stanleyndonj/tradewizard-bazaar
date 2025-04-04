import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBackend } from '@/context/BackendContext';
import { TradingSignal } from '@/lib/backend';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
import { TradingLoader } from '@/components/ui/loader';
import { toast } from '@/hooks/use-toast';
import SectionHeader from '@/components/ui-elements/SectionHeader';

const AITradingSignals = () => {
  const { getTradingSignals, analyzeMarket } = useBackend();
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketFilter, setMarketFilter] = useState('forex');
  const [timeframeFilter, setTimeframeFilter] = useState('1h');
  const [symbolToAnalyze, setSymbolToAnalyze] = useState('');
  const [marketAnalysis, setMarketAnalysis] = useState(null);

  useEffect(() => {
    document.title = 'AI Trading Signals | TradeWizard';
    loadSignals();
  }, [marketFilter, timeframeFilter]);

  const loadSignals = async () => {
    setLoading(true);
    try {
      const fetchedSignals = await getTradingSignals(marketFilter, timeframeFilter);
      setSignals(fetchedSignals);
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      toast({
        title: "Error fetching signals",
        description: "Failed to load trading signals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMarket = async () => {
    if (!symbolToAnalyze) {
      toast({
        title: "Error",
        description: "Please enter a symbol to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeMarket(symbolToAnalyze);
      setMarketAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing market:', error);
      toast({
        title: "Error analyzing market",
        description: "Failed to analyze market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIndicator = (trend: string) => {
    if (trend === 'bullish') {
      return <TrendingUp className="text-green-500 w-5 h-5" />;
    } else if (trend === 'bearish') {
      return <TrendingDown className="text-red-500 w-5 h-5" />;
    } else {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TradingLoader text="Loading AI Trading Signals..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-10">
          <SectionHeader
            subtitle="AI Insights"
            title="AI Trading Signals"
            description="Get AI-powered trading signals to enhance your trading strategy."
            centered
          />
          
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="market-filter">Market:</Label>
                  <Select value={marketFilter} onValueChange={setMarketFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="stocks">Stocks</SelectItem>
                      <SelectItem value="commodities">Commodities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timeframe-filter">Timeframe:</Label>
                  <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
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
                      <SelectItem value="1w">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Enter symbol to analyze"
                  value={symbolToAnalyze}
                  onChange={(e) => setSymbolToAnalyze(e.target.value)}
                />
                <Button onClick={handleAnalyzeMarket}>Analyze Market</Button>
              </div>
            </div>
            
            {marketAnalysis && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Market Analysis for {marketAnalysis.symbol}</CardTitle>
                  <CardDescription>Timeframe: {marketAnalysis.timeframe}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trend</p>
                      <div className="flex items-center">
                        {getTrendIndicator(marketAnalysis.trend)}
                        <span className="font-medium ml-1">{marketAnalysis.trend}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
                      <p className="font-medium">{marketAnalysis.recommendation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Price Target</p>
                      <p className="font-medium">{marketAnalysis.next_price_target}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stop Loss Suggestion</p>
                      <p className="font-medium">{marketAnalysis.stop_loss_suggestion}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Summary</p>
                    <p>{marketAnalysis.summary}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {signals.map((signal) => (
                <Card key={signal.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{signal.symbol}</CardTitle>
                        <CardDescription>Timeframe: {signal.timeframe}</CardDescription>
                      </div>
                      <Badge>{signal.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Direction</p>
                        {signal.direction === 'buy' ? (
                          <div className="text-green-500 font-semibold flex items-center">
                            <ArrowUp className="w-4 h-4 mr-1" /> BUY
                          </div>
                        ) : (
                          <div className="text-red-500 font-semibold flex items-center">
                            <ArrowDown className="w-4 h-4 mr-1" /> SELL
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                        <p className="font-medium">{signal.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Entry Price</p>
                        <p className="font-medium">{signal.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Stop Loss</p>
                        <p className="font-medium">{signal.stop_loss}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Take Profit</p>
                        <p className="font-medium">{signal.take_profit}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created at: {new Date(signal.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Trade Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AITradingSignals;
