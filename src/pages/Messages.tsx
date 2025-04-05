
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBackend } from '@/context/BackendContext';
import { toast } from '@/hooks/use-toast';
import ChatInterface from '@/components/admin/ChatInterface';
import { TradingLoader } from '@/components/ui/loader';

const Messages = () => {
  const navigate = useNavigate();
  const { user, loadConversations } = useBackend();
  const [isLoading, setIsLoading] = useState(true);

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
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, navigate, loadConversations]);

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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
