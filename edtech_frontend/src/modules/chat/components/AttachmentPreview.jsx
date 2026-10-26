import React from 'react';
import { FiDownload, FiFileText, FiImage, FiVideo } from 'react-icons/fi';
import { formatFileSize } from '../utils/chatFormatters';

export default function AttachmentPreview({
  messageType,
  attachmentUrl,
  attachmentName,
  attachmentSize
}) {
  if (!attachmentUrl) return null;

  if (messageType === 'IMAGE') {
    return (
      <div className="mt-1.5 mb-1 max-w-sm rounded-lg overflow-hidden border border-black/10 bg-black/5">
        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block group relative">
          <img
            src={attachmentUrl}
            alt={attachmentName || 'Attachment'}
            className="w-full max-h-60 object-cover rounded-lg group-hover:opacity-95 transition"
            loading="lazy"
          />
        </a>
      </div>
    );
  }

  if (messageType === 'VIDEO') {
    return (
      <div className="mt-1.5 mb-1 max-w-sm rounded-lg overflow-hidden border border-black/10">
        <video
          src={attachmentUrl}
          controls
          className="w-full max-h-60 rounded-lg bg-black"
        />
      </div>
    );
  }

  // Generic File or Document
  return (
    <div className="mt-1.5 mb-1 flex items-center justify-between gap-3 p-2.5 rounded-lg border border-black/10 bg-white/80 backdrop-blur-xs text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <FiFileText size={16} />
        </div>
        <div className="truncate">
          <p className="font-semibold text-gray-800 truncate">{attachmentName || 'Document'}</p>
          <span className="text-[10px] text-gray-500">{formatFileSize(attachmentSize)}</span>
        </div>
      </div>
      <a
        href={attachmentUrl}
        download={attachmentName || 'file'}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition shrink-0"
        title="Download File"
      >
        <FiDownload size={14} />
      </a>
    </div>
  );
}
