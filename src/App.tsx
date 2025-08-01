import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings, Plus, Download, Upload, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SessionSidebar } from './components/SessionSidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { streamChatCompletion, AVAILABLE_MODELS } from './services/aiService';
import { 
  saveSessions, 
  loadSessions, 
  saveCurrentSessionId, 
  loadCurrentSessionId,
  createSession,
  updateSession,
  deleteSession,
  clearAllSessions,
  exportSessions,
  importSessions
} from './services/sessionService';
import { saveSettings, loadSettings, resetSettings } from './services/settingsService';
import { fileService } from './services/fileService';
import type { Session, Message, AppSettings, UploadedFile } from './types';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('openrouter/horizon-alpha');
  const [settings, setSettings] = useState<AppSettings>({
    customSystemPrompt: '',
    theme: 'dark',
    fontSize: 'medium',
    enableAnimations: true,
    autoSave: true,
    maxHistoryLength: 100
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load settings, sessions and current session on mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    const loadedSessions = loadSessions();
    const loadedCurrentSessionId = loadCurrentSessionId();
    
    setSettings(loadedSettings);
    setSessions(loadedSessions);
    setCurrentSessionId(loadedCurrentSessionId);
    
    // Apply theme
    applyTheme(loadedSettings.theme);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, streamingMessage]);

  // Save sessions when they change
  useEffect(() => {
    if (sessions.length > 0 && settings.autoSave) {
      saveSessions(sessions);
    }
  }, [sessions, settings.autoSave]);

  // Save current session ID when it changes
  useEffect(() => {
    if (currentSessionId) {
      saveCurrentSessionId(currentSessionId);
    }
  }, [currentSessionId]);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto theme - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  };

  const getCurrentSession = (): Session | null => {
    return sessions.find(s => s.id === currentSessionId) || null;
  };

  const handleNewSession = () => {
    const newSession: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: currentModel,
      systemPrompt: settings.customSystemPrompt
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
    setUploadedFiles([]);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
    setStreamingMessage(null);
    setIsThinking(false);
    setUploadedFiles([]);
    
    // Update current model based on session
    const session = sessions.find(s => s.id === sessionId);
    if (session?.model) {
      setCurrentModel(session.model);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    
    // Update current session's model
    if (currentSessionId) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, model }
          : session
      ));
    }
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    applyTheme(newSettings.theme);
  };

  const handleFileUpload = async (files: File[]) => {
    const processingPromises = files.map(async (file) => {
      try {
        const processedFile = await fileService.processFile(file);
        return processedFile;
      } catch (error) {
        toast.error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
      }
    });

    const processedFiles = (await Promise.all(processingPromises)).filter(Boolean) as UploadedFile[];
    setUploadedFiles(prev => [...prev, ...processedFiles]);
    
    if (processedFiles.length > 0) {
      toast.success(`Successfully uploaded ${processedFiles.length} file(s)`);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    // Cancel any ongoing streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    let sessionId = currentSessionId;
    
    // Create new session if none exists
    if (!sessionId) {
      const newSession = createSession();
      newSession.model = currentModel;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    // Add user message
    setSessions(prev => {
      const updated = updateSession(prev, sessionId!, [
        ...(prev.find(s => s.id === sessionId)?.messages || []),
        userMessage
      ]);
      
      return updated;
    });

    setIsLoading(true);
    setIsThinking(false);
    
    const assistantMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      artifacts: [],
      toolResults: []
    };

    setStreamingMessage(assistantMessage);

    try {
      abortControllerRef.current = new AbortController();
      const currentSession = sessions.find(s => s.id === sessionId);
      const messages = currentSession ? [...currentSession.messages, userMessage] : [userMessage];

      let fullContent = '';
      let artifacts: any[] = [];
      let toolResults: any[] = [];
      
      for await (const chunk of streamChatCompletion(
        messages, 
        currentModel, 
        settings.customSystemPrompt,
        {
          temperature: 0.7,
          maxTokens: 4000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      )) {
        if (chunk.isThinking) {
          setIsThinking(true);
          continue;
        }

        setIsThinking(false);
        fullContent = chunk.content;
        
        if (chunk.artifacts) {
          artifacts = chunk.artifacts;
        }
        if (chunk.toolResults) {
          toolResults = chunk.toolResults;
        }
        
        setStreamingMessage({
          ...assistantMessage,
          content: fullContent,
          artifacts,
          toolResults
        });
      }

      // Add final assistant message
      const finalAssistantMessage = {
        ...assistantMessage,
        content: fullContent,
        artifacts,
        toolResults
      };

      setSessions(prev => updateSession(prev, sessionId!, [
        ...(prev.find(s => s.id === sessionId)?.messages || []),
        finalAssistantMessage
      ]));

      setStreamingMessage(null);
      setIsThinking(false);
      setUploadedFiles([]); // Clear uploaded files after sending
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setStreamingMessage(null);
      setIsThinking(false);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleExportSessions = () => {
    try {
      const data = exportSessions();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloaked-chat-sessions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Sessions exported successfully');
    } catch (error) {
      toast.error('Failed to export sessions');
    }
  };

  const handleImportSessions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const importedSessions = importSessions(data);
        setSessions(importedSessions);
        toast.success(`Successfully imported ${importedSessions.length} sessions`);
      } catch (error) {
        toast.error('Failed to import sessions');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear all sessions? This action cannot be undone.')) {
      clearAllSessions();
      setSessions([]);
      setCurrentSessionId(null);
      toast.success('All sessions cleared');
    }
  };

  const currentSession = getCurrentSession();
  const hasMessages = currentSession && (currentSession.messages.length > 0 || streamingMessage);

  return (
    <>
      <Helmet>
        <title>CloakedChat - AI Chatbot</title>
        <meta name="description" content="Powerful AI Chatbot powered by Horizon Alpha" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Sidebar */}
        <SessionSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4 shadow-sm">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {currentSession?.title || 'CloakedChat'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSessions}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Export sessions"
              >
                <Download size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer" title="Import sessions">
                <Upload size={18} className="text-gray-600 dark:text-gray-300" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSessions}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleClearAllSessions}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                title="Clear all sessions"
              >
                <Trash2 size={18} />
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!hasMessages ? (
              <WelcomeScreen 
                onSendMessage={handleSendMessage} 
                currentModel={currentModel}
                onModelChange={handleModelChange}
                onFileUpload={handleFileUpload}
                uploadedFiles={uploadedFiles}
                onRemoveFile={handleRemoveFile}
              />
            ) : (
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                  {currentSession?.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {streamingMessage && (
                    <ChatMessage 
                      message={streamingMessage} 
                      isStreaming={true} 
                      isThinking={isThinking}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
            
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder={hasMessages ? "Message CloakedChat..." : "Ask me anything..."}
              currentModel={currentModel}
              onModelChange={handleModelChange}
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              onRemoveFile={handleRemoveFile}
            />
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;