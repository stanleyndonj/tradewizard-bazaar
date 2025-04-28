// src/components/users/UserChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBackend } from '@/context/BackendContext';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';
import { TradingLoader } from '@/components/ui/loader';

const UserChatInterface = () => {
  const {
    user,
    conversations,
    chatMessages,
    currentConversation,
    setCurrentConversationId,
    sendMessage,
    getConversations,
    getMessages,
    loadConversations,
    users,
    createConversation,
  } = useBackend();

  const { socket } = useSocket();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  // Load conversations when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
    }

    // Join socket room when user is defined
    if (socket && user?.id) {
      socket.emit('join_chat', { userId: user.id });
    }

    return () => {
      if (socket && user?.id) {
        socket.emit('leave_chat', { userId: user.id });
      }
    };
  }, [user, socket, loadConversations]);

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
      await sendMessage(currentConversation.id, messageText, 'user', user.id);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversationWithAdmin = async (admin: any) => {
    const conversationExists = conversations.some(
      (conversation) => conversation.user_id === user.id
    );
    console.log(
      "conversationExists:",
      conversationExists ? "Yes" : "No",
      conversationExists
    );

    
    if (conversationExists) {
      // Set the existing conversation as current
      const existingConversation = conversations.find(
        (conversation) => conversation.user_id === user.id
      );
      if(existingConversation) {
          setCurrentConversationId(existingConversation.id);
      }
    } else {
      // Create a new conversation
      await createConversation(user.id, user.name, user.email);
      // After creating, refresh conversations to include the new one
      await loadConversations();
    }
  };

  return (
    <div className="flex h-[calc(80vh)] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      {/* Left side - conversations list */}
      <div className="w-1/3 border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <ScrollArea className="flex-grow">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    'p-3 rounded-md cursor-pointer',
                    currentConversation?.id === conversation.id
                      ? 'bg-gray-800'
                      : 'hover:bg-gray-800'
                  )}
                  onClick={() => setCurrentConversationId(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conversation.user_name}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count}
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
            <div className="p-4 border-b border-gray-800 flex items-center">
              <div>
                <h3 className="font-medium">
                  {selectedAdmin ? selectedAdmin.name : 'Chat'}
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedAdmin ? selectedAdmin.email : ''}
                </p>
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
                          'flex',
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg p-3',
                            isCurrentUser
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-800 text-gray-100 rounded-bl-none'
                          )}
                        >
                          {message.text}
                          <div
                            className={cn(
                              'text-xs mt-1',
                              isCurrentUser
                                ? 'text-blue-200'
                                : 'text-gray-400'
                            )}
                          >
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
                  {loading ? <TradingLoader small /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
              <MessageSquare className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">Your Messages</h3>
              {user?.is_admin ? (
                <p className="text-center max-w-xs">
                  Select a conversation from the list to start chatting with users
                </p>
              ) : (
                <>
                  <p className="text-center max-w-xs mb-4">
                    Select an admin to start a conversation.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {users.filter(admin => admin.is_admin).map((admin) => (
                      <Button
                        key={admin.id}
                        onClick={() => startConversationWithAdmin(admin)}
                        variant="outline"
                        className="border border-blue-500 text-blue-500"
                      >
                        {admin.name}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default UserChatInterface;