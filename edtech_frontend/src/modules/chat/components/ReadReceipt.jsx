import React from 'react';
import { BsCheck, BsCheckAll } from 'react-icons/bs';

export default function ReadReceipt({ deliveredAt, readAt, isUserMessage }) {
  if (!isUserMessage) return null;

  if (readAt) {
    // Read: double check in bright sky blue (modern WhatsApp style)
    return <BsCheckAll className="text-sky-300 text-sm ml-1 inline shrink-0 drop-shadow-xs" title="Read" />;
  } else if (deliveredAt) {
    // Delivered: double check in soft visible lilac
    return <BsCheckAll className="text-purple-200/90 text-sm ml-1 inline shrink-0" title="Delivered" />;
  } else {
    // Sent: single check
    return <BsCheck className="text-purple-300/80 text-sm ml-1 inline shrink-0" title="Sent" />;
  }
}
