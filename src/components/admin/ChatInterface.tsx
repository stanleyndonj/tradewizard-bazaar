
import { useState, useEffect, useRef } from 'react';
import { useBackend } from '@/context/BackendContext';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TradingLoader } from '@/components/ui/loader';
import { MessageSquare, Search, Send, User, CheckCheck, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ChatInterface = () => {
  const { 
    user, 
    users,
    conversations, 
    chatMessages, 
    currentConversation, 
    setCurrentConversationId,
    sendMessage,
    loadConversations,
    loadChatMessages,
    loadUsers,
    markMessageAsRead
  } = useBackend();
  
  const { socket } = useSocket();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load data when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
      
      // If admin, load all users
      if (user.is_admin) {
        loadUsers();
      }
      
      // Join socket room
      if (socket && user.is_admin) {
        socket.emit('join_admin_chat', { adminId: user.id });
      }
    }
    
    return () => {
      // Leave socket room when component unmounts
      if (socket && user?.is_admin) {
        socket.emit('leave_admin_chat', { adminId: user.id });
      }
    };
  }, [user, socket, loadConversations, loadUsers]);
  
  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadChatMessages(currentConversation.id);
    }
  }, [currentConversation, loadChatMessages]);
  
  // Handle new socket messages
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: any) => {
        if (currentConversation && message.conversationId === currentConversation.id) {
          loadChatMessages(currentConversation.id);
        } else {
          // If the message is for another conversation, refresh conversations to show unread indicator
          loadConversations();
        }
      };
      
      socket.on('new_message', handleNewMessage);
      
      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, currentConversation, loadChatMessages, loadConversations]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // When messages change or conversation changes, scroll to bottom
  useEffect(() => {
    scrollToBottom();
    
    // Mark all messages in current conversation as read
    if (currentConversation && chatMessages[currentConversation.id]) {
      chatMessages[currentConversation.id].forEach(msg => {
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
      await sendMessage(currentConversation.id, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const searchLower = searchQuery.toLowerCase();
    return (
      conversation.user_name.toLowerCase().includes(searchLower) ||
      conversation.user_email.toLowerCase().includes(searchLower)
    );
  });
  
  // Count unread messages by conversation
  const getUnreadCount = (conversationId: string) => {
    if (!chatMessages[conversationId]) return 0;
    
    return chatMessages[conversationId].filter(
      msg => !msg.read && ((user?.is_admin && msg.sender === 'user') || (!user?.is_admin && msg.sender === 'admin'))
    ).length;
  };
  
  return (
    <div className="flex h-[calc(80vh)] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      {/* Left sidebar - conversations list */}
      <div className="w-1/4 border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 bg-gray-800 border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isActive = currentConversation?.id === conversation.id;
              const unreadCount = getUnreadCount(conversation.id);
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-gray-800 flex items-center border-b border-gray-800",
                    isActive && "bg-gray-800"
                  )}
                  onClick={() => setCurrentConversationId(conversation.id)}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                    {conversation.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white truncate">
                        {conversation.user_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(conversation.last_message_time), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-300 truncate">
                        {conversation.last_message || "No messages yet"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </div>
      
      {/* Right side - chat messages */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-gray-800 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                {currentConversation.user_name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-white">{currentConversation.user_name}</h3>
                <p className="text-xs text-gray-400">{currentConversation.user_email}</p>
              </div>
            </div>
            
            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4">
              {!chatMessages[currentConversation.id] ? (
                <div className="h-full flex items-center justify-center">
                  <TradingLoader text="Loading messages..." />
                </div>
              ) : chatMessages[currentConversation.id].length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare className="h-12 w-12 mb-2" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages[currentConversation.id].map((message) => {
                    const isCurrentUser = 
                      (user?.is_admin && message.sender === 'admin') || 
                      (!user?.is_admin && message.sender === 'user');
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isCurrentUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-800 text-white rounded-bl-none"
                          )}
                        >
                          <p className="break-words">{message.text}</p>
                          <div className="flex justify-end items-center mt-1 space-x-1">
                            <span className="text-xs opacity-70">
                              {format(new Date(message.timestamp), 'h:mm a')}
                            </span>
                            {isCurrentUser && (
                              message.read ? (
                                <CheckCheck className="h-3 w-3 opacity-70" />
                              ) : (
                                <Check className="h-3 w-3 opacity-70" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            
            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800">
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border-gray-700"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="ml-2 bg-blue-600 hover:bg-blue-700"
                  disabled={!messageText.trim() || loading}
                >
                  {loading ? (
                    <TradingLoader small />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-medium mb-2">Your Messages</h3>
            <p className="text-center max-w-xs">
              {user?.is_admin 
                ? "Select a conversation from the list to start chatting with users"
                : "Select an admin to start a conversation"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
