
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

// Import specific features components as needed

const AITradingSignals = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const { toast } = useToast();
  const { user, getTradingSignals, analyzeMarket } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [analysisData, setAnalysisData] = useState<MarketAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState(tab || 'signals');

  useEffect(() => {
    // Set page title
    document.title = 'AI Trading Signals | TradeWizard';
    
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
    
    // Load initial data
    loadData();
    
  }, [user, tab, navigate]);

  // Update URL when tab changes
  useEffect(() => {
    if (tab !== activeTab && activeTab) {
      navigate(`/ai-trading-signals/${activeTab}`, { replace: true });
    }
  }, [activeTab, tab, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Load signals
      const signalsData = await getTradingSignals();
      setSignals(signalsData || []);
      
      // Load market analysis for a default symbol
      if (!analysisData) {
        try {
          const analysis = await analyzeMarket('EURUSD', '1h');
          setAnalysisData(analysis);
        } catch (error) {
          console.error('Failed to load market analysis:', error);
        }
      }
    } catch (error) {
      console.error('Error loading AI trading data:', error);
      toast({
        title: "Error",
        description: "Failed to load trading data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMarket = async (symbol: string, timeframe: string) => {
    try {
      setIsLoading(true);
      const analysis = await analyzeMarket(symbol, timeframe);
      setAnalysisData(analysis);
      
      toast({
        title: "Analysis Complete",
        description: `Market analysis for ${symbol} (${timeframe}) is ready`,
      });
    } catch (error) {
      console.error('Error analyzing market:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show placeholder component if user is not admin
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="pb-8">
            <h1 className="text-3xl font-bold mb-2">AI Trading Features</h1>
            <p className="text-muted-foreground">
              Advanced AI-powered tools to enhance your trading decisions
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-4 md:w-[600px]">
              <TabsTrigger value="signals">Signals</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="backtesting">Backtesting</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signals" className="mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Trading Signals</h2>
                <p>This feature is under development. Check back soon for real-time trading signals powered by our advanced AI algorithms.</p>
                <div className="mt-8 text-center">
                  <TradingLoader text="Feature coming soon" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
                <p>This feature is under development. Soon you'll be able to get detailed market analysis for any trading pair, including support/resistance levels, trend detection, and trade recommendations.</p>
                <div className="mt-8 text-center">
                  <TradingLoader text="Feature coming soon" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <AITradingChat />
              </div>
            </TabsContent>
            
            <TabsContent value="backtesting" className="mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Strategy Backtesting</h2>
                <p>This feature is under development. Soon you'll be able to backtest your trading strategies using historical data and AI optimization.</p>
                <div className="mt-8 text-center">
                  <TradingLoader text="Feature coming soon" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AITradingSignals;
