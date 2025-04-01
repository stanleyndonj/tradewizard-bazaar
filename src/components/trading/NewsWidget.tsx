
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Calendar, ArrowUpRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  url: string;
  category: 'market' | 'economic' | 'earnings';
  sentiment?: 'positive' | 'negative' | 'neutral';
}

const dummyNews: NewsItem[] = [
  {
    id: '1',
    title: 'Fed signals potential rate cuts later this year as inflation cools',
    source: 'Financial Times',
    timestamp: '2023-06-15T14:30:00Z',
    url: '#',
    category: 'economic',
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Tech stocks rally on positive earnings reports from major players',
    source: 'Wall Street Journal',
    timestamp: '2023-06-15T12:15:00Z',
    url: '#',
    category: 'market',
    sentiment: 'positive',
  },
  {
    id: '3',
    title: 'Oil prices drop amid concerns over global demand',
    source: 'Reuters',
    timestamp: '2023-06-15T10:45:00Z',
    url: '#',
    category: 'market',
    sentiment: 'negative',
  },
  {
    id: '4',
    title: 'Major retailer reports disappointing quarterly results',
    source: 'Bloomberg',
    timestamp: '2023-06-15T09:30:00Z',
    url: '#',
    category: 'earnings',
    sentiment: 'negative',
  },
  {
    id: '5',
    title: 'European markets open higher following positive economic data',
    source: 'CNBC',
    timestamp: '2023-06-15T08:00:00Z',
    url: '#',
    category: 'market',
    sentiment: 'positive',
  },
  {
    id: '6',
    title: 'Consumer confidence index beats expectations',
    source: 'MarketWatch',
    timestamp: '2023-06-14T16:45:00Z',
    url: '#',
    category: 'economic',
    sentiment: 'positive',
  },
  {
    id: '7',
    title: 'Tech company announces major acquisition deal',
    source: 'TechCrunch',
    timestamp: '2023-06-14T14:20:00Z',
    url: '#',
    category: 'market',
    sentiment: 'neutral',
  },
];

interface EconomicEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  country: string;
  forecast?: string;
  previous?: string;
}

const dummyEconomicCalendar: EconomicEvent[] = [
  {
    id: '1',
    title: 'Non-Farm Payrolls',
    date: '2023-07-07',
    time: '08:30 ET',
    impact: 'high',
    country: 'US',
    forecast: '180K',
    previous: '175K',
  },
  {
    id: '2',
    title: 'FOMC Meeting Minutes',
    date: '2023-07-05',
    time: '14:00 ET',
    impact: 'high',
    country: 'US',
  },
  {
    id: '3',
    title: 'Retail Sales m/m',
    date: '2023-07-16',
    time: '08:30 ET',
    impact: 'medium',
    country: 'US',
    forecast: '0.3%',
    previous: '0.2%',
  },
  {
    id: '4',
    title: 'GDP q/q',
    date: '2023-07-27',
    time: '08:30 ET',
    impact: 'high',
    country: 'US',
    forecast: '2.4%',
    previous: '2.0%',
  },
];

export const NewsWidget = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('news');

  useEffect(() => {
    // Simulate API fetch with a delay
    const timer = setTimeout(() => {
      setNewsItems(dummyNews);
      setEconomicEvents(dummyEconomicCalendar);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    
    // Simulate refresh with delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Market News & Events</CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="news">Market News</TabsTrigger>
            <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="news" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/4 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {newsItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.source}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={getSentimentColor(item.sentiment)}>
                        {item.sentiment?.charAt(0).toUpperCase() + item.sentiment?.slice(1) || 'Neutral'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6">
                  <Button variant="outline">
                    View More News
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {economicEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge variant="outline">{event.country}</Badge>
                          <Badge variant="outline" className={getImpactColor(event.impact)}>
                            {event.impact.toUpperCase()} IMPACT
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {event.date}
                        </div>
                        <p className="text-sm">{event.time}</p>
                      </div>
                    </div>
                    
                    {(event.forecast || event.previous) && (
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        {event.forecast && (
                          <div>
                            <p className="text-muted-foreground">Forecast:</p>
                            <p className="font-medium">{event.forecast}</p>
                          </div>
                        )}
                        {event.previous && (
                          <div>
                            <p className="text-muted-foreground">Previous:</p>
                            <p className="font-medium">{event.previous}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div className="text-center mt-6">
                  <Button variant="outline">
                    View Full Calendar
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NewsWidget;
