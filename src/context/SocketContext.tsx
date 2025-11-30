import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onNewMessage: (callback: (message: Message) => void) => (() => void) | undefined;
  onMessageRead: (callback: (data: { conversationId: string; readBy: string }) => void) => (() => void) | undefined;
  onTypingStart: (callback: (data: { conversationId: string; userId: string }) => void) => (() => void) | undefined;
  onTypingStop: (callback: (data: { conversationId: string; userId: string }) => void) => (() => void) | undefined;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(window.location.origin, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, token]);

  const joinConversation = (conversationId: string) => {
    socket?.emit('join:conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socket?.emit('leave:conversation', conversationId);
  };

  const sendMessage = (conversationId: string, content: string) => {
    socket?.emit('message:send', { conversationId, content });
  };

  const markAsRead = (conversationId: string) => {
    socket?.emit('message:read', conversationId);
  };

  const startTyping = (conversationId: string) => {
    socket?.emit('typing:start', conversationId);
  };

  const stopTyping = (conversationId: string) => {
    socket?.emit('typing:stop', conversationId);
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    socket?.on('message:new', callback);
    return () => {
      socket?.off('message:new', callback);
    };
  };

  const onMessageRead = (callback: (data: { conversationId: string; readBy: string }) => void) => {
    socket?.on('message:read', callback);
    return () => {
      socket?.off('message:read', callback);
    };
  };

  const onTypingStart = (callback: (data: { conversationId: string; userId: string }) => void) => {
    socket?.on('typing:start', callback);
    return () => {
      socket?.off('typing:start', callback);
    };
  };

  const onTypingStop = (callback: (data: { conversationId: string; userId: string }) => void) => {
    socket?.on('typing:stop', callback);
    return () => {
      socket?.off('typing:stop', callback);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        sendMessage,
        markAsRead,
        startTyping,
        stopTyping,
        onNewMessage,
        onMessageRead,
        onTypingStart,
        onTypingStop,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
