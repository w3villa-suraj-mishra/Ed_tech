import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { BASE_URL } from '../../../services/apis';

class ChatSocketManager {
  constructor() {
    this.socket = null;
    this.currentToken = null;
    this.isConnected = false;
    this.listeners = new Map(); // event -> Set of callbacks
    this.statusListeners = new Set();
  }

  connect(token) {
    if (!token) return null;

    if (this.socket && this.currentToken === token && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentToken = token;
    const socketServerUrl =
      process.env.REACT_APP_SOCKET_URL ||
      process.env.REACT_APP_BASE_URL ||
      BASE_URL ||
      'http://localhost:5000';

    // Vercel serverless platforms do not maintain persistent WebSockets/Socket.IO connections.
    // If hosted on vercel.app and no separate socket server is provided, seamlessly switch to REST cloud mode.
    const isVercelServerless =
      !process.env.REACT_APP_SOCKET_URL &&
      (socketServerUrl.includes('vercel.app') ||
        (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')));

    if (isVercelServerless) {
      this.isRestFallback = true;
      this.isConnected = true;
      this._notifyStatus('REST_MODE');
      return null;
    }

    try {
      this.socket = io(socketServerUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 2,
        reconnectionDelay: 2000,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.isRestFallback = false;
        this._notifyStatus('CONNECTED');
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        this._notifyStatus('DISCONNECTED');
      });

      let failedAttempts = 0;
      this.socket.on('connect_error', (err) => {
        failedAttempts++;
        if (failedAttempts >= 2) {
          // Gracefully fallback to REST mode and close socket to avoid 404 polling loop
          this.socket.disconnect();
          this.socket = null;
          this.isRestFallback = true;
          this.isConnected = true;
          this._notifyStatus('REST_MODE');
        } else {
          this.isConnected = false;
          this._notifyStatus('RECONNECTING');
        }
      });

      this.socket.io.on('reconnect', () => {
        this.isConnected = true;
        this.isRestFallback = false;
        this._notifyStatus('RECONNECTED');
      });

      // Reattach registered event listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((cb) => {
          this.socket.on(event, cb);
        });
      });

      return this.socket;
    } catch (e) {
      this.isRestFallback = true;
      this.isConnected = true;
      this._notifyStatus('REST_MODE');
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentToken = null;
      this._notifyStatus('DISCONNECTED');
    }
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    // Immediately notify current status
    callback(this.isConnected ? 'CONNECTED' : 'DISCONNECTED');
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  _notifyStatus(status) {
    this.statusListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {}
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId });
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, { conversationId });
    }
  }

  sendSocketMessage(data, ack) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.MESSAGE_SEND, data, ack);
    }
  }

  startTyping(conversationId, userName) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId, userName });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
    }
  }

  markConversationRead(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId });
    }
  }
}

export const chatSocket = new ChatSocketManager();
export default chatSocket;
