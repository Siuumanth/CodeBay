import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';

export const useSocket = (channel) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!channel) return;

    // Clean up existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      setConnected(true);
      socketRef.current.emit('subscribe', channel);
    });

    socketRef.current.on('message', (message) => {
      setMessages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        content: message, 
        timestamp: new Date() 
      }]);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [channel]);

  return { messages, connected };
};