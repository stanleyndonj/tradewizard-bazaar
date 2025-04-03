
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, UserCircle } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const ChatInterface = () => {
  const { 
    user, 
    conversations, 
    chatMessages, 
    currentConversation, 
    setCurrentConversation,
    sendMessage,
    markMessageAsRead,
    createConversation
  } = useBackend();
  
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // If user is not admin and no conversation exists, create one
  useEffect(() => {
    if (user && !user.is_admin && conversations.length === 0) {
      // Create a conversation with support if none exists for non-admin user
      createConversation('support', 'Support Team', 'support@tradewizard.com');
    }
  }, [user, conversations.length, createConversation]);
  
  // Automatically select first conversation for non-admin users
  useEffect(() => {
    if (user && !user.is_admin && conversations.length > 0 && !currentConversation) {
      setCurrentConversation(conversations[0].id);
    }
  }, [user, conversations, currentConversation, setCurrentConversation]);
  
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
        if (!msg.read && ((user?.is_admin && msg.sender === 'user') || (!user?.is_admin && msg.sender === 'admin'))) {
          markMessageAsRead(msg.id);
        }
      });
    }
  }, [currentConversation, chatMessages, user?.is_admin, markMessageAsRead]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentConversation) return;
    
    setLoading(true);
    
    try {
      await sendMessage(currentConversation, messageText);
      setMessageText('');
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversation(conversationId);
  };
  
  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get current conversation details
  const currentConversationData = currentConversation 
    ? conversations.find(c => c.id === currentConversation) 
    : null;
  
  // For non-admin users, simplify the UI
  if (user && !user.is_admin) {
    return (
      <div className="grid h-[calc(100vh-250px)]">
        <div className="flex flex-col">
          {/* Chat header for non-admin */}
          <div className="p-4 border-b flex items-center bg-trading-blue text-white">
            <Avatar className="h-10 w-10 mr-3 bg-white text-trading-blue">
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Support Team</h3>
              <p className="text-sm opacity-80">Online</p>
            </div>
          </div>
          
          {/* Messages area */}
          <ScrollArea className="flex-1 p-4 h-[calc(100vh-380px)]">
            <div className="space-y-4">
              {currentConversation && chatMessages[currentConversation]?.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-trading-blue text-white rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-blue-100'
                        : 'text-muted-foreground'
                    }`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {!currentConversation && (
                <div className="text-center text-muted-foreground py-10">
                  Loading messages...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Message input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading || !currentConversation}
              />
              <Button type="submit" disabled={loading || !messageText.trim() || !currentConversation}>
                {loading ? <Loader size="sm" /> : <Send size={20} />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  // Admin view (original layout)
  return (
    <div className="grid h-[calc(100vh-200px)] md:grid-cols-[300px_1fr]">
      {/* Conversations sidebar */}
      <div className={`border-r ${currentConversation ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Conversations</h3>
        </div>
        <ScrollArea className="h-[calc(100vh-250px)]">
          {conversations.length > 0 ? (
            <div className="space-y-1 p-2">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-2 rounded hover:bg-muted cursor-pointer ${
                    currentConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{getInitials(conversation.userName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.userName}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-2">{conversation.unreadCount}</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Chat area */}
      <div className={`flex flex-col ${currentConversation ? 'block' : 'hidden md:block'}`}>
        {currentConversation && currentConversationData ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2"
                onClick={() => setCurrentConversation(null)}
              >
                <ArrowLeft size={20} />
              </Button>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>{getInitials(currentConversationData.userName)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{currentConversationData.userName}</h3>
                <p className="text-sm text-muted-foreground">{currentConversationData.userEmail}</p>
              </div>
            </div>
            
            {/* Messages area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages[currentConversation]?.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === (user?.is_admin ? 'admin' : 'user') ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === (user?.is_admin ? 'admin' : 'user')
                          ? 'bg-trading-blue text-white rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === (user?.is_admin ? 'admin' : 'user')
                          ? 'text-blue-100'
                          : 'text-muted-foreground'
                      }`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message input */}
            <div className="p-4 border-t">
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
          <div className="h-full flex items-center justify-center text-center p-4">
            <div>
              <UserCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
