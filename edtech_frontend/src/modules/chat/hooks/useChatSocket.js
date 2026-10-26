import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import chatSocket from '../sockets/chatSocket';

export function useChatSocket(providedToken = null) {
  const reduxToken = useSelector((state) => state?.auth?.token);
  const token =
    providedToken ||
    reduxToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('adminToken') || localStorage.getItem('token') : null);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');

  useEffect(() => {
    if (!token) {
      chatSocket.disconnect();
      setConnectionStatus('DISCONNECTED');
      return;
    }

    chatSocket.connect(token);

    const unsubscribe = chatSocket.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, [token]);

  const isConnected =
    connectionStatus === 'CONNECTED' ||
    connectionStatus === 'RECONNECTED' ||
    connectionStatus === 'REST_MODE';

  return {
    socket: chatSocket,
    connectionStatus,
    isConnected,
    isRestFallback: connectionStatus === 'REST_MODE' || Boolean(chatSocket.isRestFallback)
  };
}

export default useChatSocket;
