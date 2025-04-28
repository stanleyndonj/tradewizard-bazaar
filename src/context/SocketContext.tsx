import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketIOUrl } from '../lib/apiConfig';
import { useBackend } from './BackendContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  lastMessage: any | null;
  lastNotification: any | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  lastMessage: null,
  lastNotification: null
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [lastNotification, setLastNotification] = useState<any | null>(null);
  const { loadNotifications } = useBackend();

  useEffect(() => {
    // Only try to connect if we have an auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No auth token found, skipping socket connection');
      return;
    }

    let socketInstance: Socket | null = null;

    const setupSocket = () => {
      try {
        // Get the correct Socket.IO URL
        const socketUrl = getSocketIOUrl();
        console.log('Connecting to Socket.IO at:', socketUrl);

        // Create socket connection with auth token and better error handling
        socketInstance = io(socketUrl, {
          transports: ['polling', 'websocket'], // Start with polling first as it's more reliable
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
          auth: { token },

        });

        socketInstance.on('connect', () => {
          console.log('Socket.IO connected successfully');
          setConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket.IO disconnected');
          setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          setConnected(false);
        });

        // Listen for new messages
        socketInstance.on('new_message', (message) => {
          console.log('New message received via socket:', message);
          setLastMessage(message);

          // Refresh notifications as we might have a new message notification
          loadNotifications();
        });

        // Listen for new notifications
        socketInstance.on('new_notification', (notification) => {
          console.log('New notification received via socket:', notification);
          setLastNotification(notification);

          // Refresh notifications
          loadNotifications();
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('Error setting up socket connection:', error);
      }
    };

    // Set up socket connection
    setupSocket();

    // Cleanup function
    return () => {
      if (socketInstance) {
        console.log('Disconnecting Socket.IO');
        socketInstance.disconnect();
        setSocket(null);
      }
    };
  }, [loadNotifications]);

  return (
    <SocketContext.Provider value={{ socket, connected, lastMessage, lastNotification }}>
      {children}
    </SocketContext.Provider>
  );
};