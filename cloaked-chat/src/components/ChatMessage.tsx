'use client';

import React, { useState } from 'react';
import { Message } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ArtifactRenderer } from './ArtifactRenderer';
import { Button } from './ui/Button';
import { Copy, Check, User, Bot } from 'lucide-react';
import { copyToClipboard, formatTimestamp } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isTyping = false,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`group relative ${className}`}>
      <div className={`flex gap-4 p-6 ${isUser ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-green-600 text-white'
          }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {isUser ? 'You' : 'CloakedChat'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* Message Content */}
          <div className="space-y-4">
            {message.content && (
              <div className="text-gray-900 dark:text-gray-100">
                {isUser ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <>
                    <MarkdownRenderer content={message.content} />
                    {isTyping && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Artifacts */}
            {message.artifacts && message.artifacts.length > 0 && (
              <div className="space-y-4">
                {message.artifacts.map((artifact) => (
                  <ArtifactRenderer
                    key={artifact.id}
                    artifact={artifact}
                  />
                ))}
              </div>
            )}

            {/* File Attachments */}
            {message.files && message.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Attached files:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                    >
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Copy Button */}
          {isAssistant && message.content && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};