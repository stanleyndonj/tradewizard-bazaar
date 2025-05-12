
import React from 'react';
import { useBackend } from '@/context/BackendContext';
import AdminChatInterface from '@/components/admin/ChatInterface';
import UserChatInterface from '@/components/users/UserChatInterface';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TradingLoader } from '@/components/ui/loader';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';
import ParallaxContainer from '@/components/ui/parallax-container';

const MessagesPage = () => {
  const { user, loadConversations } = useBackend();
  const { connected } = useSocket();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [backendStatus, setBackendStatus] = React.useState<'loading' | 'online' | 'offline'>('loading');

  React.useEffect(() => {
    // Set page title
    document.title = 'Messages | TradeWizard';
    
    // Check if user is logged in
    if (!user) {
      setError("Please sign in to access the messaging feature");
      setIsLoading(false);
      return;
    }
    
    // Check if backend is running
    checkBackendStatus();
  }, [user]);

  // Check if the backend server is running
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`http://0.0.0.0:8000/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setBackendStatus('online');
        // Now that we know backend is online, load conversations
        await loadConversations()
          .catch(err => {
            console.error("Error loading conversations:", err);
            setError("Unable to load conversations. Please try again.");
          });
      } else {
        setBackendStatus('offline');
        setError("The backend server is currently unavailable. Please start the backend server.");
      }
    } catch (error) {
      console.error("Error checking backend status:", error);
      setBackendStatus('offline');
      setError("Cannot connect to the backend server. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setBackendStatus('loading');
    checkBackendStatus();
  };

  return (
    <ParallaxContainer className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      
      <main className="flex-grow pt-24 pb-10">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Messages</h1>
          
          {backendStatus === 'offline' ? (
            <div className="bg-gradient-card rounded-lg shadow-md overflow-hidden p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-3">Backend Server Offline</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                {error || "The backend server is currently not running. Please start the backend server first."}
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleRetry} 
                  className="bg-gradient-button hover:bg-blue-700"
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          ) : error ? (
            <div className="bg-gradient-card rounded-lg shadow-md overflow-hidden p-8 text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-3">Connection Error</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">{error}</p>
              <Button 
                onClick={handleRetry} 
                className="bg-gradient-button hover:bg-blue-700"
              >
                Retry Connection
              </Button>
            </div>
          ) : isLoading ? (
            <div className="container mx-auto py-8 px-4 max-w-7xl mt-20 flex-grow flex items-center justify-center">
              <TradingLoader text="Loading messages..." />
            </div>
          ) : (
            <div className={cn(
              "bg-gradient-card rounded-lg shadow-md overflow-hidden",
              connected ? "border-green-500/30" : "border-red-500/30"
            )}>
              {user?.is_admin ? <AdminChatInterface /> : <UserChatInterface />}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </ParallaxContainer>
  );
};

export default MessagesPage;
