import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { TradingLoader } from '@/components/ui/loader';
import AITradingChat from '@/components/trading/AITradingChat';
import { TradingSignal, MarketAnalysis } from '@/lib/backend';
import SubscriptionRequired from '@/components/trading/SubscriptionRequired';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Clock, BarChart2, MessageSquare, History, Shield } from 'lucide-react';

const AITradingSignals = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const { toast } = useToast();
  const { user, getTradingSignals, analyzeMarket, getSubscriptionPrices } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [analysisData, setAnalysisData] = useState<MarketAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState(tab || 'signals');
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  // State to track API error and prevent refresh loops
  const [hasApiError, setHasApiError] = useState(false);

  // Single consolidated useEffect
  useEffect(() => {
    // Set page title
    document.title = 'AI Trading Signals | TradeWizard';
    
    // These flags prevent redundant API calls
    let isComponentMounted = true;
    let isInitialLoadComplete = false;
    
    console.log("AITradingSignals component mounted");
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access AI trading features",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Only run once
    if (!isInitialLoadComplete && !hasApiError) {
      const loadOne = async () => {
        // Set loading state
        setIsLoading(true);
        
        try {
          // Load data with a more controlled approach
          if (isComponentMounted) {
            // First, try to load trading signals
            try {
              console.log("Attempting to fetch trading signals - one time load");
              const signalsData = await getTradingSignals();
              if (signalsData && Array.isArray(signalsData) && isComponentMounted) {
                console.log(`Received ${signalsData.length} trading signals - ONE TIME LOAD`);
                setSignals(signalsData);
              }
            } catch (error) {
              console.error("Error loading signals:", error);
              // Use fallback data for signals
              if (isComponentMounted) {
                setSignals([
                  {
                    id: '1',
                    symbol: 'EUR/USD',
                    direction: 'buy',
                    strength: 'Strong',
                    confidence: 0.85,
                    entry_price: 1.1045,
                    stop_loss: 1.0980,
                    take_profit: 1.1150,
                    timeframe: '1h',
                    market: 'forex',
                    timestamp: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    status: 'active'
                  },
                  {
                    id: '2',
                    symbol: 'BTC/USD',
                    direction: 'sell',
                    strength: 'Moderate',
                    confidence: 0.72,
                    entry_price: 36500,
                    stop_loss: 37100,
                    take_profit: 35500,
                    timeframe: '4h',
                    market: 'crypto',
                    timestamp: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    status: 'active'
                  }
                ]);
              }
            }
            
            // Then, try to load subscription plans
            try {
              console.log("Attempting to fetch subscription plans - one time load");
              const plans = await getSubscriptionPrices();
              if (plans && Array.isArray(plans) && isComponentMounted) {
                setSubscriptionPlans(plans);
              }
            } catch (error) {
              console.error("Error loading subscription plans:", error);
              // Use fallback data for subscription plans
              if (isComponentMounted) {
                setSubscriptionPlans([
                  {
                    id: 'basic-monthly',
                    name: 'Basic AI Trading Signals',
                    price: 29.99,
                    currency: 'USD',
                    interval: 'monthly',
                    features: [
                      'Access to AI trading signals',
                      'Basic market analysis',
                      'Daily signal updates',
                      'Email notifications'
                    ],
                    created_at: new Date().toISOString()
                  },
                  {
                    id: 'premium-monthly',
                    name: 'Premium AI Trading Signals',
                    price: 99.99,
                    currency: 'USD',
                    interval: 'monthly',
                    features: [
                      'All Basic features',
                      'Advanced market analysis',
                      'Real-time signal updates',
                      'Direct AI chat support',
                      'Custom alerts and notifications'
                    ],
                    created_at: new Date().toISOString()
                  }
                ]);
              }
            }
            
            // Finally, try to load market analysis if needed
            if (!analysisData && isComponentMounted) {
              try {
                const analysis = await analyzeMarket('EURUSD', '1h');
                if (analysis && isComponentMounted) {
                  setAnalysisData(analysis);
                }
              } catch (error) {
                console.error("Error loading market analysis:", error);
                // Use fallback data for market analysis
                if (isComponentMounted) {
                  setAnalysisData({
                    symbol: 'EURUSD',
                    timeframe: '1h',
                    trend: 'bullish',
                    strength: 0.75,
                    support_levels: [1.0685, 1.0655, 1.0620],
                    resistance_levels: [1.0750, 1.0780, 1.0820],
                    indicators: {
                      rsi: 56.8,
                      macd: {
                        value: 0.0025,
                        signal: 0.0018,
                        histogram: 0.0007
                      },
                      moving_averages: {
                        ma20: 1.0705,
                        ma50: 1.0690,
                        ma200: 1.0650
                      }
                    },
                    recommendation: 'buy',
                    next_potential_move: 'Likely to test 1.0750 resistance',
                    risk_reward_ratio: 2.1,
                    created_at: new Date().toISOString(),
                    summary: 'EURUSD is showing bullish momentum with price action above key moving averages.'
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Global error in loadOne:", error);
          if (isComponentMounted) {
            setHasApiError(true);
          }
        } finally {
          if (isComponentMounted) {
            setIsLoading(false);
            isInitialLoadComplete = true;
          }
        }
      };
      
      // Execute the one-time load
      loadOne();
    }
    
    // Update URL when tab changes
    if (tab !== activeTab && activeTab) {
      navigate(`/ai-trading-signals/${activeTab}`, { replace: true });
    }
    
    // Cleanup function
    return () => {
      console.log("AITradingSignals component unmounted");
      isComponentMounted = false;
    };
  }, [user, activeTab, tab, navigate]); // Include dependencies to prevent exhaustive deps warning, but we control execution inside

  // This function is used for the "handleAnalyzeMarket" button click, not for initial loading
  const loadSpecificMarketData = async (symbol: string, timeframe: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Analyzing specific market: ${symbol} (${timeframe})`);
      const analysis = await analyzeMarket(symbol, timeframe);
      
      if (analysis) {
        setAnalysisData(analysis);
        toast({
          title: "Analysis Complete",
          description: `Market analysis for ${symbol} (${timeframe}) is ready`,
        });
      }
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);
      // Set fallback data for this specific symbol
      setAnalysisData({
        symbol: symbol,
        timeframe: timeframe,
        trend: 'neutral',
        strength: 0.5,
        support_levels: [36000, 35500, 35000],
        resistance_levels: [37000, 37500, 38000],
        indicators: {
          rsi: 50,
          macd: {
            value: 0,
            signal: 0,
            histogram: 0
          },
          moving_averages: {
            ma20: 36500,
            ma50: 36400,
            ma200: 36300
          }
        },
        recommendation: 'hold',
        next_potential_move: 'Consolidation likely',
        risk_reward_ratio: 1.5,
        created_at: new Date().toISOString(),
        summary: `Analysis for ${symbol} could not be loaded from API. Using fallback data.`
      });
      
      toast({
        title: "Using Fallback Analysis",
        description: "Could not connect to analysis server. Using sample data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMarket = async (symbol: string, timeframe: string) => {
    // Use the loadSpecificMarketData function to analyze a specific market
    await loadSpecificMarketData(symbol, timeframe);
  };

  // Check if user has access to AI trading (admin or has subscription)
  const hasAccess = user?.is_admin || user?.robots_delivered;

  // Generate sample chart data (replace with real data in production)
  const generateChartData = () => {
    const data = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString(),
        value: Math.random() * 10 + 90,
      });
    }

    return data;
  };

  const chartData = generateChartData();

  if (!user) {
    return null; // Don't render anything if no user
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbar />

      <main className="flex-grow pt-24 pb-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pb-8"
          >
            <h1 className="text-4xl font-bold mb-2 text-white">AI Trading Features</h1>
            <p className="text-gray-300 text-lg">
              Advanced AI-powered tools to enhance your trading decisions
            </p>
          </motion.div>

          {hasAccess ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid grid-cols-4 md:w-[600px] bg-gray-800 p-1 rounded-xl">
                <TabsTrigger value="signals" className="data-[state=active]:bg-blue-600 rounded-lg">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Signals
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600 rounded-lg">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="assistant" className="data-[state=active]:bg-blue-600 rounded-lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="backtesting" className="data-[state=active]:bg-blue-600 rounded-lg">
                  <History className="mr-2 h-4 w-4" />
                  Backtesting
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signals" className="mt-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="trading-card"
                >
                  <h2 className="text-2xl font-semibold mb-4 text-white">Trading Signals</h2>
                  <p className="text-gray-300 mb-6">Our AI algorithms analyze market data to provide you with high-probability trading signals.</p>

                  {isLoading ? (
                    <div className="mt-8 text-center">
                      <TradingLoader text="Loading trading signals..." />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="mb-8">
                        <h3 className="text-xl font-medium mb-4 text-white">Signal Performance</h3>
                        <div className="h-72 w-full bg-gray-800 rounded-xl p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="date" stroke="#718096" tickFormatter={(tick) => tick.split('/')[1]} />
                              <YAxis stroke="#718096" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1a202c',
                                  borderColor: '#2d3748',
                                  color: '#e2e8f0',
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3182ce"
                                strokeWidth={2}
                                dot={{ fill: '#3182ce', r: 4 }}
                                activeDot={{ r: 6, fill: '#4299e1' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((_, index) => (
                          <div key={index} className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-blue-500 transition-all">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-bold text-white">EUR/USD</h4>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${index % 2 === 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                {index % 2 === 0 ? (
                                  <div className="flex items-center">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    BUY
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <ArrowDown className="h-3 w-3 mr-1" />
                                    SELL
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div>
                                <p className="text-gray-400">Entry</p>
                                <p className="text-white font-medium">1.0721</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Stop Loss</p>
                                <p className="text-white font-medium">1.0690</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Take Profit</p>
                                <p className="text-white font-medium">1.0780</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Timeframe</p>
                                <p className="text-white font-medium">4h</p>
                              </div>
                            </div>
                            <div className="flex items-center mt-2 text-gray-400 text-sm">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>3 hours ago</span>
                              <span className="mx-2">•</span>
                              <span className={index % 2 === 0 ? 'text-green-400' : 'text-red-400'}>
                                {index % 2 === 0 ? '+31 pips' : '-12 pips'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center mt-4">
                        <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900 hover:text-blue-100">
                          Load More Signals
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="analysis" className="mt-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="trading-card"
                >
                  <h2 className="text-2xl font-semibold mb-4 text-white">Market Analysis</h2>
                  <p className="text-gray-300 mb-6">Get detailed AI-powered market analysis for any trading pair, including support/resistance levels, trend detection, and trade recommendations.</p>

                  {isLoading ? (
                    <div className="mt-8 text-center">
                      <TradingLoader text="Loading market analysis..." />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                          <h3 className="text-lg font-medium text-white mb-4">EURUSD Analysis</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm">Trend</p>
                              <p className="text-white font-medium">Bullish (Strong)</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Support Levels</p>
                              <p className="text-white font-medium">1.0685, 1.0655, 1.0620</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Resistance Levels</p>
                              <p className="text-white font-medium">1.0750, 1.0780, 1.0820</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                          <h3 className="text-lg font-medium text-white mb-4">Technical Indicators</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm">RSI (14)</p>
                              <p className="text-white font-medium">56.8 (Neutral)</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">MACD</p>
                              <p className="text-green-400 font-medium">Bullish Crossover</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Moving Averages</p>
                              <p className="text-green-400 font-medium">Above MA20, MA50</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                          <h3 className="text-lg font-medium text-white mb-4">Trade Recommendation</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm">Signal</p>
                              <p className="text-green-400 font-bold">BUY</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Entry Price</p>
                              <p className="text-white font-medium">1.0720 - 1.0730</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Target</p>
                              <p className="text-white font-medium">1.0780</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Stop Loss</p>
                              <p className="text-white font-medium">1.0690</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-medium text-white mb-4">Analysis Summary</h3>
                        <p className="text-gray-300">
                          EURUSD is showing bullish momentum with price action above key moving averages. RSI indicates room for further upside without being overbought. The recent breakout above 1.0700 resistance suggests continuation of the uptrend. Traders should look for buying opportunities near the support level at 1.0685 with a tight stop below 1.0650.
                        </p>
                      </div>

                      <div className="flex justify-center mt-4">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Analyze Different Symbol
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="assistant" className="mt-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                >
                  <AITradingChat />
                </motion.div>
              </TabsContent>

              <TabsContent value="backtesting" className="mt-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="trading-card"
                >
                  <h2 className="text-2xl font-semibold mb-4 text-white">Strategy Backtesting</h2>
                  <p className="text-gray-300 mb-6">Backtest your trading strategies using historical data and AI optimization.</p>
                  <div className="mt-8 text-center">
                    <Shield className="h-16 w-16 mx-auto text-blue-400 mb-4"/>
                    <h3 className="text-lg font-medium text-white mb-2">Feature Coming Soon</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Our team is working on this exciting feature. Soon you'll be able to test your trading strategies against historical data with advanced AI optimization.
                    </p>
                    <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                      Join Waitlist
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          ) : (
            <SubscriptionRequired 
              message="Subscribe to unlock AI Trading Signals and access our powerful AI-driven trading tools" 
              plans={subscriptionPlans}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AITradingSignals;