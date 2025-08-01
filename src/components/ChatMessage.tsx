import React from 'react';
import { User, Bot, Search, Globe, Image, Download, ExternalLink, Loader, Brain, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MessageRenderer } from './MessageRenderer';
import { ArtifactRenderer } from './ArtifactRenderer';
import { fileService } from '../services/fileService';
import type { Message, UploadedFile } from '../types';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export function ChatMessage({ message, isStreaming, isThinking }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const renderFileUploads = (files: UploadedFile[]) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mb-4 space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <span className="text-2xl">{fileService.getFileIcon(file.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileService.formatFileSize(file.size)}
              </p>
            </div>
            {file.preview && file.type.startsWith('image/') && (
              <img
                src={file.preview}
                alt={file.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderThinkingAnimation = () => (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Thinking...</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Analyzing your request
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-4">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderToolResults = (toolResults: any[]) => {
    if (!toolResults || toolResults.length === 0) return null;

    return (
      <div className="space-y-4">
        {toolResults.map((result, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-medium">AI</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Tool Result
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {result.content}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`py-6 ${isUser ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isUser 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}>
              {isUser ? (
                <User size={16} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <span className="text-white font-bold text-sm">C</span>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* User/Assistant Label */}
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {isUser ? 'You' : 'CloakedChat'}
              </span>
              {isStreaming && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  typing...
                </span>
              )}
            </div>

            {/* File Uploads */}
            {isUser && message.files && renderFileUploads(message.files)}

            {/* Message Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MessageRenderer 
                content={message.content} 
                isStreaming={isStreaming}
              />
            </div>

            {/* Tool Results */}
            {!isUser && message.toolResults && renderToolResults(message.toolResults)}

            {/* Artifacts */}
            {!isUser && message.artifacts && message.artifacts.length > 0 && (
              <div className="mt-6 space-y-4">
                {message.artifacts.map((artifact) => (
                  <ArtifactRenderer key={artifact.id} artifact={artifact} />
                ))}
              </div>
            )}

            {/* Thinking Animation */}
            {isThinking && renderThinkingAnimation()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}