
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useBackend } from '@/context/BackendContext';
import { TradingLoader } from '@/components/ui/loader';
import Navbar from '@/components/layout/Navbar';
import SubscriptionRequired from '@/components/trading/SubscriptionRequired';
import AITradingChat from '@/components/trading/AITradingChat';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, TrendingUp, MessageSquare } from 'lucide-react';

const AITradingSignals = () => {
  const { user } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState("signals");

  useEffect(() => {
    // Set page title
    document.title = 'AI Trading Signals | TradeWizard';
    
    // Simulate checking if user has active subscription
    const checkSubscription = async () => {
      if (user) {
        // In a real app, this would be an API call to check subscription status
        // For now, we'll use a mock check based on the robots_delivered field
        setHasSubscription(!!user.robots_delivered);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [user]);

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
        </div>
        
        {hasSubscription ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4">Latest Market Analysis</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-md border border-border">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">EUR/USD</span>
                        <span className="text-green-600 font-medium">BUY</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        The EUR/USD pair is showing a bullish divergence on the 4-hour chart with RSI turning up from oversold conditions.
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-background p-2 rounded">
                          <span className="block font-medium">Entry</span>
                          <span>1.0742</span>
                        </div>
                        <div className="bg-background p-2 rounded">
                          <span className="block font-medium">Stop Loss</span>
                          <span>1.0705</span>
                        </div>
                        <div className="bg-background p-2 rounded">
                          <span className="block font-medium">Take Profit</span>
                          <span>1.0820</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-md border border-border">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">BTC/USD</span>
                        <span className="text-red-600 font-medium">SELL</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Bitcoin is approaching a key resistance level with decreasing volume, suggesting a potential reversal.
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-background p-2 rounded">
                          <span className="block font-medium">Entry</span>
                          <span>63,450</span>
                        </div>
                        <div className="bg-background p-2 rounded">
                          <span className="block font-medium">Stop Loss</span>
                          <span>64,200</span>
                        </div>
                        <div className="bg-background p-2 rounded">
                          <span className="block font-medium">Take Profit</span>
                          <span>61,800</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4">Signal History</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 border-b">
                      <div>
                        <span className="font-medium block">Gold (XAU/USD)</span>
                        <span className="text-xs text-muted-foreground">Jun 15, 2023</span>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-medium block">+2.3%</span>
                        <span className="text-xs text-muted-foreground">Target Hit</span>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 border-b">
                      <div>
                        <span className="font-medium block">USD/JPY</span>
                        <span className="text-xs text-muted-foreground">Jun 12, 2023</span>
                      </div>
                      <div className="text-right">
                        <span className="text-red-600 font-medium block">-0.8%</span>
                        <span className="text-xs text-muted-foreground">Stopped Out</span>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 border-b">
                      <div>
                        <span className="font-medium block">S&P 500</span>
                        <span className="text-xs text-muted-foreground">Jun 10, 2023</span>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-medium block">+1.5%</span>
                        <span className="text-xs text-muted-foreground">Target Hit</span>
                      </div>
                    </div>
                  </div>
                </div>
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
