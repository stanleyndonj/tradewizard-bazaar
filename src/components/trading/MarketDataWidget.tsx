
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Star, Plus, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  inWatchlist: boolean;
}

const defaultAssets: Asset[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 69420.50, change: 2.3, volume: 28745921, inWatchlist: true },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3498.75, change: 1.8, volume: 15698423, inWatchlist: false },
  { symbol: 'EUR/USD', name: 'Euro', price: 1.0765, change: -0.2, volume: 98563214, inWatchlist: true },
  { symbol: 'GBP/USD', name: 'British Pound', price: 1.2689, change: -0.4, volume: 74125896, inWatchlist: false },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 187.68, change: 1.1, volume: 36541258, inWatchlist: true },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.32, change: 0.5, volume: 21458963, inWatchlist: false },
];

export const MarketDataWidget = () => {
  const [assets, setAssets] = useState<Asset[]>(defaultAssets);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Simulate API fetch with a delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleWatchlist = (symbol: string) => {
    setAssets(assets.map(asset => 
      asset.symbol === symbol 
        ? { ...asset, inWatchlist: !asset.inWatchlist } 
        : asset
    ));
    
    const asset = assets.find(a => a.symbol === symbol);
    if (asset) {
      toast({
        title: asset.inWatchlist ? "Removed from watchlist" : "Added to watchlist",
        description: `${asset.name} (${asset.symbol}) has been ${asset.inWatchlist ? 'removed from' : 'added to'} your watchlist`,
      });
    }
  };

  const setAlert = (symbol: string) => {
    toast({
      title: "Alert set",
      description: `You will be notified of significant price movements for ${symbol}`,
    });
  };

  const filteredAssets = assets.filter(asset => 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedAssets = activeTab === 'watchlist' 
    ? filteredAssets.filter(asset => asset.inWatchlist) 
    : filteredAssets;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Market Data</CardTitle>
          <Badge variant="outline" className="animate-pulse">Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-[250px]">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-muted-foreground text-sm font-medium">Asset</th>
                <th className="text-right py-2 px-3 text-muted-foreground text-sm font-medium">Price</th>
                <th className="text-right py-2 px-3 text-muted-foreground text-sm font-medium">24h Change</th>
                <th className="text-right py-2 px-3 text-muted-foreground text-sm font-medium">Volume</th>
                <th className="text-center py-2 px-3 text-muted-foreground text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-muted">
                    <td className="py-3 px-3"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-3 px-3 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                    <td className="py-3 px-3 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                    <td className="py-3 px-3 text-right"><Skeleton className="h-6 w-20 ml-auto" /></td>
                    <td className="py-3 px-3 text-center"><Skeleton className="h-8 w-20 mx-auto" /></td>
                  </tr>
                ))
              ) : displayedAssets.length > 0 ? (
                displayedAssets.map((asset) => (
                  <tr key={asset.symbol} className="border-b border-muted hover:bg-muted/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-sm text-muted-foreground">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">${asset.price.toLocaleString()}</td>
                    <td className={`py-3 px-3 text-right font-medium ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <div className="flex items-center justify-end">
                        {asset.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {asset.change >= 0 ? '+' : ''}{asset.change}%
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">{asset.volume.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleWatchlist(asset.symbol)}
                          className={asset.inWatchlist ? 'text-amber-500' : ''}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setAlert(asset.symbol)}>
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No assets found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-right">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Custom Asset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDataWidget;
