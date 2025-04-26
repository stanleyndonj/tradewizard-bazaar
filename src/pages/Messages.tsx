
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBackend } from '@/context/BackendContext';
import { toast } from '@/hooks/use-toast';
import ChatInterface from '@/components/admin/ChatInterface';
import CustomerChat from '@/components/customer/CustomerChat';
import { TradingLoader } from '@/components/ui/loader';
import { AlertCircle } from 'lucide-react';

const Messages = () => {
  const navigate = useNavigate();
  const { user, loadConversations } = useBackend();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set page title
    document.title = 'Messages | TradeWizard';
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the messaging feature",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    // Load conversations
    loadConversations()
      .catch(err => {
        console.error("Error loading conversations:", err);
        setError("Unable to load conversations. The messaging service might be temporarily unavailable.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, navigate, loadConversations]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    loadConversations()
      .catch(err => {
        console.error("Error loading conversations:", err);
        setError("Unable to load conversations. The messaging service might be temporarily unavailable.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 px-4 max-w-7xl mt-20 flex-grow flex items-center justify-center">
          <TradingLoader text="Loading messages..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-10">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          
          {error ? (
            <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-3">Connection Error</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">{error}</p>
              <button 
                onClick={handleRetry} 
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden">
              {user?.is_admin ? <ChatInterface /> : <CustomerChat />}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
