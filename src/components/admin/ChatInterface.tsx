import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBackend } from '@/context/BackendContext';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';
import { TradingLoader } from '@/components/ui/loader';

const ChatInterface = () => {
  const { 
    user, 
    getUsers,
    conversations, 
    chatMessages, 
    currentConversation, 
    setCurrentConversationId,
    sendMessage,
    getConversations,
    getMessages,
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
      getConversations();

      // If admin, load all users
      if (user.is_admin) {
        getUsers().catch(error => console.error("Error loading users:", error));
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
  }, [user, socket, getConversations, getUsers]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      getMessages(currentConversation.id);
    }
  }, [currentConversation, getMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, currentConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentConversation || loading) return;

    try {
      setLoading(true);
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

        <ScrollArea className="flex-grow">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <MessageSquare className="h-10 w-10 mb-2" />
              <p className="text-center">No conversations found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation) => {
                const unreadCount = getUnreadCount(conversation.id);

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors",
                      currentConversation?.id === conversation.id
                        ? "bg-gray-800"
                        : "bg-gray-900"
                    )}
                    onClick={() => setCurrentConversationId(conversation.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-200">{conversation.user_name}</p>
                        <p className="text-xs text-gray-400">{conversation.user_email}</p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-400 mt-1 truncate">
                        {conversation.last_message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right side - messages */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center">
              <div>
                <h3 className="font-medium">{currentConversation.user_name}</h3>
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
                              : "bg-gray-800 text-gray-100 rounded-bl-none"
                          )}
                        >
                          {message.text}
                          <div className={cn(
                            "text-xs mt-1",
                            isCurrentUser ? "text-blue-200" : "text-gray-400"
                          )}>
                            {new Date(message.timestamp).toLocaleTimeString()}
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
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-grow bg-gray-800 border-gray-700"
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