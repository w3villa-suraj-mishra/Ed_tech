export const SOCKET_EVENTS = {
  CONVERSATION_CREATE: 'conversation:create',
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave',

  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',

  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  CONVERSATION_ASSIGN: 'conversation:assign',
  CONVERSATION_STATUS: 'conversation:status',

  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  UNREAD_UPDATE: 'chat:unread_update'
};

export default SOCKET_EVENTS;
