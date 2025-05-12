import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackend } from '@/context/BackendContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TradingLoader } from '@/components/ui/loader';
import ParallaxContainer from '@/components/ui/parallax-container';
import { TradingSignal } from '@/lib/backend';

// Don't declare a duplicate TradingSignal interface here

const AITradingSignals = () => {
  const { tab } = useParams<{ tab?: string }>();
  const { tradingSignals, loadTradingSignals, marketAnalyses, loadMarketAnalyses, subscriptionPlans, loadSubscriptionPlans } = useBackend();
  const [isLoading, setIsLoading] = React.useState(true);
  const [market, setMarket] = React.useState('forex');
  const [timeframe, setTimeframe] = React.useState('1h');
  const [count, setCount] = React.useState(10);

  React.useEffect(() => {
    // Set page title
    document.title = 'AI Trading Signals | TradeWizard';
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadTradingSignals(market, timeframe, count),
          loadMarketAnalyses(),
          loadSubscriptionPlans()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadTradingSignals, loadMarketAnalyses, loadSubscriptionPlans, market, timeframe, count]);

  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMarket(e.target.value);
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Ensure the value is parsed as a number
    const newCount = parseInt(e.target.value, 10);
    setCount(newCount);
  };

  // Fix signal strength type errors
  const getSignalStrength = (signal: any): number => {
    if (typeof signal?.strength === 'number') {
      return signal.strength;
    }
    
    // Convert string to number or default to 5
    if (typeof signal?.strength === 'string') {
      return parseInt(signal.strength, 10) || 5;
    }
    
    return 5; // Default strength
  };

  return (
    // ... keep existing code (component UI structure)
    <ParallaxContainer className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      
      <main className="flex-grow pt-24 pb-10">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold mb-6 text-gradient">AI Trading Signals</h1>
          
          <Tabs defaultValue={tab || "signals"} className="w-full">
            <TabsList>
              <TabsTrigger value="signals">Signals</TabsTrigger>
              <TabsTrigger value="market-analysis">Market Analysis</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signals" className="space-y-4">
              <div className="flex items-center space-x-4">
                <select 
                  value={market} 
                  onChange={handleMarketChange}
                  className="bg-gray-700 text-white rounded-md p-2"
                >
                  <option value="forex">Forex</option>
                  <option value="crypto">Crypto</option>
                  <option value="stocks">Stocks</option>
                </select>
                
                <select 
                  value={timeframe} 
                  onChange={handleTimeframeChange}
                  className="bg-gray-700 text-white rounded-md p-2"
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                  <option value="1d">1 Day</option>
                </select>
                
                <select 
                  value={count} 
                  onChange={handleCountChange}
                  className="bg-gray-700 text-white rounded-md p-2"
                >
                  <option value="5">5 Signals</option>
                  <option value="10">10 Signals</option>
                  <option value="20">20 Signals</option>
                  <option value="50">50 Signals</option>
                </select>
              </div>
              
              {isLoading ? (
                <TradingLoader text="Loading AI trading signals..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tradingSignals.map((signal: any, index: number) => (
                    <div key={signal.id || index} className="bg-gradient-card rounded-lg shadow-md overflow-hidden p-4">
                      <h3 className="text-xl font-semibold mb-2">{signal.market} - {signal.timeframe}</h3>
                      <p className="text-gray-300">Type: {signal.signal_type}</p>
                      <p className="text-gray-300">Strength: {getSignalStrength(signal)}</p>
                      <p className="text-gray-300">Entry: {signal.entry_price}</p>
                      <p className="text-gray-300">Stop Loss: {signal.stop_loss}</p>
                      <p className="text-gray-300">Take Profit: {signal.take_profit}</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Created: {new Date(signal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="market-analysis">
              {isLoading ? (
                <TradingLoader text="Loading market analysis..." />
              ) : (
                <div>
                  {marketAnalyses.map((analysis, index) => (
                    <div key={index} className="bg-gradient-card rounded-lg shadow-md overflow-hidden p-4 mb-4">
                      <h3 className="text-xl font-semibold mb-2">{analysis.symbol} - {analysis.timeframe}</h3>
                      <p className="text-gray-300">Trend: {analysis.trend}</p>
                      <p className="text-gray-300">Strength: {analysis.strength}</p>
                      <p className="text-gray-300">Recommendation: {analysis.recommendation}</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Created: {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="subscriptions">
              {isLoading ? (
                <TradingLoader text="Loading subscription plans..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptionPlans.map((plan, index) => (
                    <div key={plan.id} className="bg-gradient-card rounded-lg shadow-md overflow-hidden p-4">
                      <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                      <p className="text-gray-300">Price: {plan.price} {plan.currency}</p>
                      <ul className="list-disc pl-5 text-gray-300">
                        {plan.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </ParallaxContainer>
  );
};

export default AITradingSignals;
