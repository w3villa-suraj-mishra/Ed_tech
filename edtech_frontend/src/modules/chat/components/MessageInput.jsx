import React, { useState, useRef } from 'react';
import { FiPaperclip, FiSend, FiX, FiFile } from 'react-icons/fi';
import { formatFileSize } from '../utils/chatFormatters';

export default function MessageInput({
  onSendMessage,
  onSendAttachment,
  onKeystroke,
  onStopTyping,
  disabled = false,
  status = 'OPEN',
  onReopen = null
}) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (onKeystroke) onKeystroke();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const content = text.trim();
    if ((!content && !selectedFile) || sending || disabled) return;

    try {
      setSending(true);
      if (onStopTyping) onStopTyping();

      const fileToSend = selectedFile;
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      if (fileToSend) {
        await onSendAttachment(fileToSend, content);
      } else {
        await onSendMessage(content);
      }
    } catch (err) {
      console.error('Error submitting message:', err);
    } finally {
      setSending(false);
    }
  };

  // If conversation is closed
  if (status === 'CLOSED') {
    return (
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500 mb-2">This conversation is closed.</p>
        {onReopen && (
          <button
            onClick={onReopen}
            className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-xs font-bold transition shadow-xs"
          >
            Reopen Conversation
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {/* Attachment Preview Chip */}
      {selectedFile && (
        <div className="flex items-center justify-between gap-2 p-2 mb-2 bg-purple-50 border border-purple-200 rounded-lg text-xs">
          <div className="flex items-center gap-2 truncate">
            <FiFile className="text-purple-700 shrink-0" size={16} />
            <span className="font-semibold text-gray-800 truncate">{selectedFile.name}</span>
            <span className="text-[10px] text-gray-500">({formatFileSize(selectedFile.size)})</span>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-1 rounded-full hover:bg-purple-100 text-gray-500 hover:text-red-500 transition shrink-0"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Input controls */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition shrink-0 cursor-pointer"
          title="Attach file or image"
          disabled={disabled || sending}
        >
          <FiPaperclip size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || sending}
          className="flex-1 max-h-28 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none transition"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || disabled || sending}
          className="p-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 cursor-pointer"
          title="Send"
        >
          <FiSend size={16} />
        </button>
      </form>
    </div>
  );
}
