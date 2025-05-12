
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
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
    conversations, 
    chatMessages, 
    currentConversation, 
    setCurrentConversationId,
    sendMessage,
    getConversations,
    getMessages,
    loadConversations 
  } = useBackend();

  const { socket, connected } = useSocket();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Load data when component mounts
  useEffect(() => {
    if (user?.is_admin) {
      loadConversations();
    }

    // Join socket room if admin
    if (socket && user?.is_admin) {
      socket.emit('join_admin_chat', { adminId: user.id });
      
      // Listen for new messages
      socket.on('new_message', (data) => {
        if (data.conversation_id) {
          console.log("Admin received new message:", data);
          getMessages(data.conversation_id);
          loadConversations(); // Reload conversation list to update last message and unread count
        }
      });
    }

    return () => {
      // Leave socket room when component unmounts
      if (socket && user?.is_admin) {
        socket.emit('leave_admin_chat', { adminId: user.id });
        socket.off('new_message');
      }
    };
  }, [user, socket, loadConversations, getMessages]);

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

  // Update selected user when conversation changes
  useEffect(() => {
    if (currentConversation) {
      const selected = conversations.find(
        (conv) => conv.id === currentConversation.id
      );
      if (selected) {
        setSelectedUser({
          id: selected.userId,
          name: selected.userName,
          email: selected.userEmail
        });
      }
    }
  }, [conversations, currentConversation]);

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
  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        (conv.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (conv.userEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="flex h-[calc(80vh)] bg-gradient-card rounded-lg overflow-hidden border border-gray-800">
      {/* Left side - conversations list */}
      <div className="w-1/3 border-r border-gray-800 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 bg-gray-800 border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-grow">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 rounded-md cursor-pointer transition-all",
                    currentConversation?.id === conversation.id
                      ? "bg-gradient-to-r from-blue-900/30 to-blue-800/20"
                      : "hover:bg-gray-800/50"
                  )}
                  onClick={() => setCurrentConversationId(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conversation.userName || "User"}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right side - messages */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex items-center">
                <div className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  connected ? "bg-green-500" : "bg-red-500"
                )}></div>
                <div>
                  <h3 className="font-medium">
                    {selectedUser ? selectedUser.name : 'Chat'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selectedUser ? selectedUser.email : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-900/50 to-gray-900/80">
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
                    const isCurrentUser = message.sender === 'admin';

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
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                              : "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 rounded-bl-none"
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
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
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
                  className="ml-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 bg-gradient-to-b from-gray-900/50 to-gray-900/80">
            <MessageSquare className="h-16 w-16 mb-4 text-blue-500" />
            <h3 className="text-xl font-medium mb-2 text-gradient">Admin Messages</h3>
            <p className="text-center max-w-xs">
              Select a conversation from the list to start chatting with users
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
