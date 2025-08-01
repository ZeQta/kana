'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Button } from '@/components/ui/Button';
import { Message, Conversation, FileAttachment } from '@/types';
import { ConversationStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { Bot, AlertCircle } from 'lucide-react';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const loadedConversations = ConversationStorage.getConversations();
    setConversations(loadedConversations);
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, currentConversationId]);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    ConversationStorage.addConversation(newConversation);
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    setSidebarOpen(false);
    setError(null);
  };

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setSidebarOpen(false);
    setError(null);
  };

  const deleteConversation = (conversationId: string) => {
    ConversationStorage.deleteConversation(conversationId);
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
    
    if (currentConversationId === conversationId) {
      setCurrentConversationId(updatedConversations[0]?.id || null);
    }
  };

  const renameConversation = (conversationId: string, newTitle: string) => {
    ConversationStorage.updateConversation(conversationId, { title: newTitle });
    setConversations(conversations.map(c => 
      c.id === conversationId ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    ));
  };

  const generateTitle = (content: string): string => {
    const words = content.trim().split(' ').slice(0, 6);
    return words.join(' ') + (content.split(' ').length > 6 ? '...' : '');
  };

  const sendMessage = async (content: string, files: FileAttachment[]) => {
    if (!content.trim() && files.length === 0) return;

    let conversationId = currentConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      const newConversation: Conversation = {
        id: generateId(),
        title: generateTitle(content) || 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      ConversationStorage.addConversation(newConversation);
      setConversations([newConversation, ...conversations]);
      conversationId = newConversation.id;
      setCurrentConversationId(conversationId);
    }

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      files: files.length > 0 ? files : undefined
    };

    // Add user message to conversation
    const updatedConversations = conversations.map(c => {
      if (c.id === conversationId) {
        const updatedMessages = [...c.messages, userMessage];
        const updatedConv = {
          ...c,
          messages: updatedMessages,
          updatedAt: Date.now(),
          title: c.messages.length === 0 ? generateTitle(content) : c.title
        };
        ConversationStorage.updateConversation(conversationId!, updatedConv);
        return updatedConv;
      }
      return c;
    });

    setConversations(updatedConversations);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API
      const conversation = updatedConversations.find(c => c.id === conversationId);
      const apiMessages = conversation?.messages || [];

      // Add file content to message if available
      let messageContent = content;
      if (files.length > 0) {
        const fileDescriptions = files.map(f => {
          if (f.content) {
            return `File: ${f.name}\nContent: ${f.content}`;
          }
          return `File: ${f.name} (${f.type})`;
        }).join('\n\n');
        
        messageContent = content + (content ? '\n\n' : '') + fileDescriptions;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...apiMessages.slice(0, -1), { ...userMessage, content: messageContent }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        artifacts: data.artifacts?.map((artifact: { name: string; type: string; content: string; description?: string }) => ({
          ...artifact,
          id: generateId()
        }))
      };

      // Add assistant message to conversation
      const finalConversations = updatedConversations.map(c => {
        if (c.id === conversationId) {
          const finalMessages = [...c.messages, assistantMessage];
          const finalConv = { ...c, messages: finalMessages, updatedAt: Date.now() };
          ConversationStorage.updateConversation(conversationId!, finalConv);
          return finalConv;
        }
        return c;
      });

      setConversations(finalConversations);

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      
      // Remove the user message if there was an error
      const revertedConversations = conversations.map(c => {
        if (c.id === conversationId) {
          const revertedConv = { ...c, updatedAt: Date.now() };
          ConversationStorage.updateConversation(conversationId!, revertedConv);
          return revertedConv;
        }
        return c;
      });
      setConversations(revertedConversations);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const retryLastMessage = () => {
    if (!currentConversation || currentConversation.messages.length === 0) return;
    
    const lastUserMessage = [...currentConversation.messages]
      .reverse()
      .find(m => m.role === 'user');
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, lastUserMessage.files || []);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewConversation={createNewConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentConversation ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Bot size={64} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-semibold mb-2">Welcome to CloakedChat</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Powered by the Horizon Alpha model
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Start a conversation by typing a message below
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">CloakedChat</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Display */}
            {error && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={retryLastMessage}
                    className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <ChatInput
              onSendMessage={sendMessage}
              disabled={isLoading}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bot size={64} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to CloakedChat</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select a conversation or start a new chat to begin
              </p>
              <Button onClick={createNewConversation}>
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
