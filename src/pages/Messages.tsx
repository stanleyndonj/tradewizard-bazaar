
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LogOut, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sample messages (in a real app, these would come from a database)
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the messaging feature",
        variant: "destructive",
      });
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
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate admin response after 1-2 seconds
    setTimeout(() => {
      setIsTyping(false);
      
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! Our team will get back to you shortly.',
        sender: 'admin',
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, adminResponse]);
      
      // Show toast notification
      toast({
        title: "Message received",
        description: "We'll respond as soon as possible!",
      });
    }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
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

  const formattedDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="section-container py-10">
          <div className="glass-card rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-lg">
            {/* Chat header */}
            <div className="bg-trading-blue p-4 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-semibold">Support Chat</h2>
                <div className="flex items-center">
                  <p className="text-sm opacity-80">Connected as {user.name}</p>
                  <div className="ml-2 flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                </div>
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
                {messages.map((msg, index) => {
                  // Check if we need to show the date separator
                  const showDateSeparator = index === 0 || 
                    formattedDate(msg.timestamp) !== formattedDate(messages[index - 1].timestamp);
                  
                  return (
                    <div key={msg.id} className="space-y-2">
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <Badge variant="outline" className="px-3 py-1 bg-background/50">
                            {formattedDate(msg.timestamp)}
                          </Badge>
                        </div>
                      )}
                      <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.sender === 'user'
                              ? 'bg-trading-blue text-white rounded-tr-none animate-fade-in'
                              : 'bg-muted rounded-tl-none animate-fade-in'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-muted rounded-tl-none">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
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
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  className="bg-trading-blue hover:bg-trading-darkBlue transition-colors duration-300"
                  disabled={!message.trim()}
                >
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
