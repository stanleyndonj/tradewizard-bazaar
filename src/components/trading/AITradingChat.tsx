
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Bot, Send, Image, Loader2, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  attachmentUrl?: string;
}

export const AITradingChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial welcome message
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI trading assistant. I can help you analyze charts, suggest trading strategies, and answer questions about technical analysis or market trends. How can I assist you today?",
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages([initialMessage]);
  }, []);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!input.trim() && !attachment) {
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'sending',
      attachmentUrl: previewUrl || undefined,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setAttachment(null);
    setPreviewUrl(null);
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the recent price action, this looks like a potential breakout pattern. I'd recommend waiting for confirmation before entering a position.",
        "Looking at these indicators, I can see the RSI is approaching overbought territory. Consider taking profits or setting tighter stop losses.",
        "The chart shows a classic head and shoulders pattern forming. This is typically bearish - watch for a break of the neckline for confirmation.",
        "I notice a bullish divergence between price and RSI. This could indicate a potential reversal from the current downtrend.",
        "The volume profile suggests strong accumulation at these levels. This might provide good support for an upward move.",
      ];
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: attachment 
          ? `I've analyzed the chart you shared. ${responses[Math.floor(Math.random() * responses.length)]}` 
          : responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        status: 'sent',
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.includes('image')) {
      toast({
        title: "Invalid file",
        description: "Only image files are supported",
        variant: "destructive",
      });
      return;
    }
    
    setAttachment(file);
    setIsUploading(true);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (e.target.value) e.target.value = '';
  };
  
  const removeAttachment = () => {
    setAttachment(null);
    setPreviewUrl(null);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Bot className="mr-2 h-5 w-5 text-trading-blue" />
          AI Trading Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-4 pt-1 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-2`}>
                  <Avatar className="h-8 w-8">
                    {message.role === 'assistant' ? (
                      <>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-trading-blue text-white">AI</AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>U</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.attachmentUrl && (
                        <div className="mb-2">
                          <img 
                            src={message.attachmentUrl} 
                            alt="Attachment" 
                            className="max-w-full rounded border border-border"
                          />
                        </div>
                      )}
                      <p>{message.content}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {formatTime(message.timestamp)}
                      {message.status === 'sending' && ' · Sending...'}
                      {message.status === 'error' && ' · Failed to send'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row max-w-[80%] gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-trading-blue text-white">AI</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {previewUrl && (
          <div className="relative mb-2 w-full">
            <div className="flex items-center p-2 border rounded">
              <img src={previewUrl} alt="Preview" className="h-16 object-contain" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2 h-8 w-8" 
                onClick={removeAttachment}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex w-full items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleAttachmentClick}
            disabled={isLoading || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image className="h-4 w-4" />
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about trading strategies, chart analysis, or market trends..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={(!input.trim() && !attachment) || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AITradingChat;
