
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
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
    createConversation,
  } = useBackend();

  const { socket, connected } = useSocket();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);

  // Load conversations when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
      
      // Get list of admins
      fetch(`http://0.0.0.0:8000/api/users/admins`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAdmins(data);
        }
      })
      .catch(err => console.error("Failed to load admins:", err));
    }

    // Join socket room when user is defined
    if (socket && user?.id) {
      socket.emit('join_chat', { userId: user.id });
      
      // Listen for new messages
      socket.on('new_message', (data) => {
        if (data.conversation_id) {
          console.log("New message received:", data);
          getMessages(data.conversation_id);
        }
      });
    }

    return () => {
      if (socket && user?.id) {
        socket.emit('leave_chat', { userId: user.id });
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

  const startConversationWithAdmin = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Create a new conversation
      await createConversation(user.id, user.name || user.email, user.email);
      // After creating, refresh conversations to include the new one
      await loadConversations();
      
      // Select the newly created conversation
      if (conversations && conversations.length > 0) {
        setCurrentConversationId(conversations[0].id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(80vh)] bg-gradient-card rounded-lg overflow-hidden border border-gray-800">
      {/* Right side - messages */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex items-center">
                <div className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  connected ? "bg-green-500" : "bg-red-500"
                )}></div>
                <div>
                  <h3 className="font-medium">TradeWizard Support</h3>
                  <p className="text-xs text-gray-400">
                    {connected ? "Online" : "Offline"}
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
            <h3 className="text-xl font-medium mb-2 text-gradient">Your Messages</h3>
            <p className="text-center max-w-xs mb-6">
              {conversations.length === 0 ? 
                "You don't have any conversations yet. Start a new one with our support team." :
                "Select a conversation from the list to start chatting with our support team"}
            </p>

            {conversations.length === 0 ? (
              <Button
                onClick={startConversationWithAdmin}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={loading}
              >
                {loading ? <TradingLoader small /> : "Start New Conversation"}
              </Button>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <Button
                    key={conv.id}
                    onClick={() => setCurrentConversationId(conv.id)}
                    variant="outline"
                    className="border-blue-500/30 hover:border-blue-500 w-full"
                  >
                    Conversation with Support
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChatInterface;
