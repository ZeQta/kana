'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { FileUpload } from './FileUpload';
import { Send, Paperclip, X } from 'lucide-react';
import { FileAttachment } from '@/types';

interface ChatInputProps {
  onSendMessage: (content: string, files: FileAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Message CloakedChat...",
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && files.length === 0) || disabled) return;

    onSendMessage(message.trim(), files);
    setMessage('');
    setFiles([]);
    setShowFileUpload(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFilesAdded = (newFiles: FileAttachment[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemoved = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className}`}>
      {/* File Upload Section */}
      {showFileUpload && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Attach Files
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(false)}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
          
          <FileUpload
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
            files={files}
          />
        </div>
      )}

      {/* Input Section */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Attached Files Preview */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  <span className="truncate max-w-32">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleFileRemoved(file.id)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-end gap-3">
            {/* File Upload Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={`h-10 w-10 p-0 flex-shrink-0 ${
                showFileUpload ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              disabled={disabled}
            >
              <Paperclip size={18} />
            </Button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
              
              {/* Send Button */}
              <Button
                type="submit"
                disabled={(!message.trim() && files.length === 0) || disabled}
                className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-md"
                size="sm"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
            Press Enter to send, Shift + Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
};