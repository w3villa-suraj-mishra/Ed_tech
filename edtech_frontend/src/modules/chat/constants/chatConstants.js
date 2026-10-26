export const CONVERSATION_STATUS = {
  UNASSIGNED: 'UNASSIGNED',
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  CLOSED: 'CLOSED'
};

export const SENDER_TYPES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SYSTEM: 'SYSTEM'
};

export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  VIDEO: 'VIDEO',
  SYSTEM: 'SYSTEM'
};

export const STATUS_COLORS = {
  UNASSIGNED: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300'
  },
  OPEN: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300'
  },
  PENDING: {
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-300'
  },
  CLOSED: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300'
  }
};
