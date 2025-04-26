
import { useState, useEffect, useRef } from 'react';
import { useBackend } from '@/context/BackendContext';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TradingLoader } from '@/components/ui/loader';
import { MessageSquare, Send, CheckCheck, Check, Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CustomerChat = () => {
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
    markMessageAsRead,
    createConversation
  } = useBackend();
  
  const { socket } = useSocket();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  
  // Load data when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
      loadUsers();
      
      // Join socket room
      if (socket) {
        socket.emit('join_chat', { userId: user.id });
      }
    }
    
    return () => {
      // Leave socket room when component unmounts
      if (socket && user) {
        socket.emit('leave_chat', { userId: user.id });
      }
    };
  }, [user, socket, loadConversations, loadUsers]);
  
  // Filter admins from users
  useEffect(() => {
    if (users.length > 0) {
      const adminUsers = users.filter(u => u.is_admin);
      setAdmins(adminUsers);
    }
  }, [users]);
  
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
        if (!msg.read && msg.sender === 'admin') {
          markMessageAsRead(msg.id);
        }
      });
    }
  }, [currentConversation, chatMessages, markMessageAsRead]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    setLoading(true);
    
    try {
      if (!currentConversation) {
        // If no conversation exists, create one
        if (user) {
          const newConv = await createConversation(user.id, user.name || user.email, user.email);
          setCurrentConversationId(newConv.id);
          await sendMessage(newConv.id, messageText);
        }
      } else {
        await sendMessage(currentConversation.id, messageText);
      }
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Start a new conversation with an admin
  const startConversationWithAdmin = async (adminId: string, adminName: string, adminEmail: string) => {
    // Check if a conversation already exists with this admin
    const existingConv = conversations.find(c => c.user_id === adminId);
    
    if (existingConv) {
      setCurrentConversationId(existingConv.id);
    } else if (user) {
      // Create a new conversation
      try {
        setLoading(true);
        const newConv = await createConversation(user.id, user.name || user.email, user.email);
        setCurrentConversationId(newConv.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Count unread messages by conversation
  const getUnreadCount = (conversationId: string) => {
    if (!chatMessages[conversationId]) return 0;
    
    return chatMessages[conversationId].filter(
      msg => !msg.read && msg.sender === 'admin'
    ).length;
  };
  
  return (
    <div className="flex h-[calc(80vh)] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      {/* Left sidebar - admin list */}
      <div className="w-1/4 border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <h3 className="font-medium text-white">Support Team</h3>
          <p className="text-xs text-gray-400">Chat with our admins</p>
        </div>
        
        <ScrollArea className="flex-1">
          {admins.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No admins available
            </div>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.id}
                className="p-3 cursor-pointer hover:bg-gray-800 flex items-center border-b border-gray-800"
                onClick={() => startConversationWithAdmin(admin.id, admin.name, admin.email)}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-red-600 flex items-center justify-center text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <div className="font-medium text-white">
                    {admin.name || "Admin"} <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded ml-1">Admin</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Support Team
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* Show existing conversations */}
          {conversations.length > 0 && (
            <>
              <div className="p-3 border-y border-gray-800 bg-gray-800/30">
                <h4 className="text-sm font-medium text-gray-300">Your Conversations</h4>
              </div>
              
              {conversations.map((conversation) => {
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
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-red-600 flex items-center justify-center text-white">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white truncate">
                          Support Team
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
              })}
            </>
          )}
        </ScrollArea>
      </div>
      
      {/* Right side - chat messages */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-gray-800 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-red-600 flex items-center justify-center text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-white">Support Team</h3>
                <p className="text-xs text-gray-400">TradeWizard Admin</p>
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
                    const isCurrentUser = message.sender === 'user';
                    
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
              Select an admin from the list to start a conversation with our support team
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerChat;
