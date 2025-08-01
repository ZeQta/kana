import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Paperclip, X, FileText, Image, File } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { AVAILABLE_MODELS } from '../services/aiService';
import { fileService } from '../services/fileService';
import type { UploadedFile } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  currentModel: string;
  onModelChange: (model: string) => void;
  onFileUpload: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

export function ChatInput({ 
  onSendMessage, 
  disabled, 
  placeholder = "Message CloakedChat...",
  currentModel,
  onModelChange,
  onFileUpload,
  uploadedFiles,
  onRemoveFile
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.csv', '.json'],
      'application/json': ['.json']
    },
    maxSize: fileService.getMaxFileSize(),
    multiple: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const currentModelInfo = AVAILABLE_MODELS.find(m => m.id === currentModel);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Model Selector */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span>{currentModelInfo?.name || 'Horizon Alpha'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentModelInfo?.provider || 'Cloaked AI'}
              </span>
            </button>

            <AnimatePresence>
              {isModelSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                >
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Select Model</h3>
                    <div className="space-y-1">
                      {AVAILABLE_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            onModelChange(model.id);
                            setIsModelSelectorOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                            currentModel === model.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{model.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Uploaded Files */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                  >
                    <span className="text-lg">{fileService.getFileIcon(file.type)}</span>
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {fileService.formatFileSize(file.size)}
                    </span>
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <X size={14} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-end gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
            {/* File Upload Button */}
            <div {...getRootProps()} className="flex-shrink-0">
              <input {...getInputProps()} />
              <button
                type="button"
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  isDragActive
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300'
                }`}
                title="Upload files"
              >
                <Paperclip size={18} />
              </button>
            </div>
            
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
                className="w-full px-4 py-3 bg-transparent border-0 resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-colors disabled:cursor-not-allowed"
            >
              {disabled ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>

        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg">
                <FileText size={48} className="mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop files here
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload images, PDFs, or text files to analyze
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}