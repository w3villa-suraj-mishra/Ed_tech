import { useState, useEffect } from 'react';
import chatSocket from '../sockets/chatSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export function useChatPresence(targetUserId) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (!targetUserId) {
      setIsOnline(false);
      setLastSeen(null);
      return;
    }

    const strTarget = String(targetUserId);

    const handleUserOnline = (data) => {
      if (String(data.userId) === strTarget) {
        setIsOnline(true);
      }
    };

    const handleUserOffline = (data) => {
      if (String(data.userId) === strTarget) {
        setIsOnline(false);
        if (data.lastSeen) {
          setLastSeen(data.lastSeen);
        }
      }
    };

    chatSocket.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    chatSocket.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);

    return () => {
      chatSocket.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      chatSocket.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    };
  }, [targetUserId]);

  return { isOnline, lastSeen };
}

export default useChatPresence;
