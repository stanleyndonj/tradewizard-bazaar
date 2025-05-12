
import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBackend } from '@/context/BackendContext';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';
import { TradingLoader } from '@/components/ui/loader';

const CustomerChat = () => {
  const { 
    user,
    conversations, 
    chatMessages, 
    currentConversation, 
    setCurrentConversationId,
    sendMessage,
    getConversations,
    getMessages,
    markMessageAsRead,
    createNewConversation
  } = useBackend();

  const { socket } = useSocket();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data when component mounts
  useEffect(() => {
    if (user) {
      getConversations();

      // If there's only one admin, automatically select that conversation
      if (conversations.length === 1) {
        setCurrentConversationId(conversations[0].id);
      }

      // Join socket room
      if (socket && user) {
        socket.emit('join_user_chat', { userId: user.id });
      }
    }

    return () => {
      // Leave socket room when component unmounts
      if (socket && user) {
        socket.emit('leave_user_chat', { userId: user.id });
      }
    };
  }, [user, socket, getConversations, conversations, setCurrentConversationId]);

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

  // Create a new conversation with the admin if none exists
  const createConversation = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await createNewConversation(user.id, user.name, user.email);
      await getConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(80vh)] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      {/* Right side - messages */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center">
              <div>
                <h3 className="font-medium">TradeWizard Support</h3>
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
            <p className="text-center max-w-xs mb-6">
              {conversations.length === 0 ? 
                "You don't have any conversations yet. Start a new one with our support team." :
                "Select a conversation from the list to start chatting with our support team"}
            </p>

            {conversations.length === 0 && (
              <Button
                onClick={() => {
                  if (user) {
                    setLoading(true);
                    createNewConversation(
                      user.id, 
                      user.name || user.email, 
                      user.email
                    ).then(() => {
                      getConversations();
                      setLoading(false);
                    }).catch(error => {
                      console.error("Error creating conversation:", error);
                      setLoading(false);
                    });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? <TradingLoader small /> : "Start New Conversation"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerChat;
