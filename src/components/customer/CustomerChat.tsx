
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Clock } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { formatDistanceToNow } from 'date-fns';

const CustomerChat = () => {
  const { 
    user, 
    conversations, 
    chatMessages, 
    currentConversation, 
    setCurrentConversation,
    sendMessage,
    markMessageAsRead
  } = useBackend();
  
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Set the first conversation as current if none is selected
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation) {
      setCurrentConversation(conversations[0].id);
    }
  }, [conversations, currentConversation, setCurrentConversation]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // When messages change or conversation changes, scroll to bottom
  useEffect(() => {
    scrollToBottom();
    
    // Mark all messages in current conversation as read
    if (currentConversation && chatMessages[currentConversation]) {
      chatMessages[currentConversation].forEach(msg => {
        if (!msg.read && msg.sender === 'admin') {
          markMessageAsRead(msg.id);
        }
      });
    }
  }, [currentConversation, chatMessages, markMessageAsRead]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentConversation) return;
    
    setLoading(true);
    
    try {
      await sendMessage(currentConversation, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Start a new support conversation
  const startNewConversation = () => {
    if (conversations.length === 0) {
      // For demonstration purposes, we should already have a conversation
      // But this would be the place to create a new one
      return;
    }
    
    // Select the first conversation for now
    setCurrentConversation(conversations[0].id);
  };
  
  if (conversations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Customer Support</CardTitle>
          <CardDescription>Get help with your trading robots</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-center text-muted-foreground mb-4">
            Start a conversation with our support team to get help with your trading robots
          </p>
          <Button onClick={startNewConversation}>
            Start New Conversation
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Customer Support</CardTitle>
        <CardDescription>Chat with our team for assistance</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {currentConversation && chatMessages[currentConversation] ? (
          <>
            {/* Messages area */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-2">
                {chatMessages[currentConversation].map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'admin' && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>SP</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-trading-blue text-white rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 flex items-center ${
                        message.sender === 'user'
                          ? 'text-blue-100'
                          : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message input */}
            <div className="pt-4 border-t mt-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !messageText.trim()}>
                  {loading ? <Loader size="sm" /> : <Send size={20} />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is ready to help you
              </p>
              <Button onClick={startNewConversation}>
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerChat;
