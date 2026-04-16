// contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user?._id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log('🔄 Initializing socket connection with token');
    
    // SIMPLE CONNECTION - let Socket.IO handle transport negotiation
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['polling', 'websocket'], // Try polling first, then upgrade
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      path: '/socket.io/'
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('receive-message', (message) => {
      console.log('📨 Received message:', message);
    });

    newSocket.on('message-sent', (data) => {
      console.log('✅ Message sent confirmation:', data);
    });

    newSocket.on('message-error', (error) => {
      console.error('❌ Message error:', error);
    });

    newSocket.on('user-online', ({ userId }) => {
      console.log('👤 User online:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('user-offline', ({ userId }) => {
      console.log('👤 User offline:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Cleaning up socket');
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, [token, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};