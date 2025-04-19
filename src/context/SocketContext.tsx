
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketIOUrl } from '../lib/apiConfig';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only try to connect if we have an auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No auth token found, skipping socket connection');
      return;
    }

    // Get the correct Socket.IO URL
    const socketUrl = getSocketIOUrl();
    console.log('Connecting to Socket.IO at:', socketUrl);
    
    // Create socket connection with auth token
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
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

    setSocket(socketInstance);

    return () => {
      console.log('Disconnecting Socket.IO');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
