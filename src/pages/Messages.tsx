
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Sample message type
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  read: boolean;
}

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sample messages (in a real app, these would come from a database)
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Set page title
    document.title = 'Messages | TradeWizard';
    
    // Load sample messages
    const sampleMessages: Message[] = [
      {
        id: '1',
        text: 'Hello! Welcome to TradeWizard. How can I help you today?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        read: true
      },
      {
        id: '2',
        text: 'I have some questions about the MT5 Trading Robot.',
        sender: 'user',
        timestamp: new Date(Date.now() - 85400000),
        read: true
      },
      {
        id: '3',
        text: 'Of course! I\'d be happy to answer your questions about our MT5 Trading Robot. What would you like to know?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 84400000),
        read: true
      },
    ];
    
    setMessages(sampleMessages);
  }, [navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add new message to the list
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      read: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate admin response after 1 second
    setTimeout(() => {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! Our team will get back to you shortly.',
        sender: 'admin',
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, adminResponse]);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="section-container py-10">
          <div className="glass-card rounded-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Chat header */}
            <div className="bg-trading-blue p-4 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-semibold">Support Chat</h2>
                <p className="text-sm opacity-80">Connected as {user.name}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-white hover:bg-trading-darkBlue"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
            
            {/* Messages container */}
            <div className="h-[500px] overflow-y-auto p-4 bg-background/90">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-trading-blue text-white rounded-tr-none'
                          : 'bg-muted rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-grow"
                />
                <Button type="submit" className="bg-trading-blue hover:bg-trading-darkBlue">
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
