import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Paperclip, Zap, Brain } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  currentModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  onModelChange: (model: 'gemini-2.5-flash' | 'gemini-2.5-pro') => void;
}

export function ChatInput({ 
  onSendMessage, 
  disabled, 
  placeholder = "Message Kana...",
  currentModel,
  onModelChange
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="chat-input-container border-t border-gray-800/50 bg-black/80 backdrop-blur-xl p-3 md:p-4 lg:p-6 safe-area-inset-bottom">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Model Selector */}
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <div className="flex items-center gap-1 bg-gray-900/80 rounded-xl md:rounded-2xl p-1 border border-gray-700/50 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() => onModelChange('gemini-2.5-flash')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-300 ${
                  currentModel === 'gemini-2.5-flash'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Zap size={14} className="md:w-4 md:h-4" />
                <span className="hidden sm:inline">Kana</span>
              </button>
              
              <button
                type="button"
                onClick={() => onModelChange('gemini-2.5-pro')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-300 ${
                  currentModel === 'gemini-2.5-pro'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Brain size={14} className="md:w-4 md:h-4" />
                <span className="hidden sm:inline">Agentic</span>
              </button>
            </div>
          </div>

          {/* Input Container */}
          <div className="relative flex items-end gap-2 md:gap-3 bg-gray-900/80 rounded-2xl md:rounded-3xl p-3 md:p-4 border border-gray-700/50 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 shadow-lg"
            >
              <Paperclip size={16} className="md:w-5 md:h-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-transparent border-0 resize-none focus:outline-none text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-lg leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 disabled:scale-100"
            >
              {disabled ? (
                <Loader size={16} className="md:w-5 md:h-5 animate-spin" />
              ) : (
                <Send size={16} className="md:w-5 md:h-5" />
              )}
            </button>
          </div>
          
          <div className="mt-2 md:mt-3 text-xs text-gray-500 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </form>
    </div>
  );
}