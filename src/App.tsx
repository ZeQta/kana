import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SessionSidebar } from './components/SessionSidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { streamChatCompletion } from './services/aiService';
import { 
  saveSessions, 
  loadSessions, 
  saveCurrentSessionId, 
  loadCurrentSessionId,
  createSession,
  updateSession
} from './services/sessionService';
import { saveSettings, loadSettings } from './services/settingsService';
import type { Session, Message, AppSettings } from './types';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [currentModel, setCurrentModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [settings, setSettings] = useState<AppSettings>({ customSystemPrompt: '' });
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
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, streamingMessage]);

  // Save sessions when they change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  // Save current session ID when it changes
  useEffect(() => {
    if (currentSessionId) {
      saveCurrentSessionId(currentSessionId);
    }
  }, [currentSessionId]);

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
      model: currentModel
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
    setStreamingMessage(null);
    setIsThinking(false);
    
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

  const handleModelChange = (model: 'gemini-2.5-flash' | 'gemini-2.5-pro') => {
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
      const newSession = createSession(content);
      newSession.model = currentModel;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Add user message
    setSessions(prev => {
      const updated = updateSession(prev, sessionId!, [
        ...(prev.find(s => s.id === sessionId)?.messages || []),
        userMessage
      ]);
      
      // Update session title if it's the first message
      const session = updated.find(s => s.id === sessionId);
      if (session && session.messages.length === 1) {
        session.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      }
      
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
      
      for await (const chunk of streamChatCompletion(messages, currentModel, settings.customSystemPrompt)) {
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
    } catch (error) {
      console.error('Error sending message:', error);
      setStreamingMessage(null);
      setIsThinking(false);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const currentSession = getCurrentSession();
  const hasMessages = currentSession && (currentSession.messages.length > 0 || streamingMessage);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
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
        <header className="bg-black/90 backdrop-blur-xl border-b border-gray-800/50 px-3 md:px-4 lg:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 shadow-2xl safe-area-inset-top">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 md:p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            <Menu size={18} className="md:w-5 md:h-5 text-gray-400" />
          </button>
          
          <div className="flex-1 flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs md:text-sm">K</span>
              </div>
            </div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white truncate">
              {currentSession?.title || 'Kana'}
            </h1>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 md:p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200 flex-shrink-0"
          >
            <Settings size={18} className="md:w-5 md:h-5 text-gray-400" />
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!hasMessages ? (
            <WelcomeScreen 
              onSendMessage={handleSendMessage} 
              currentModel={currentModel}
            />
          ) : (
            <div className="flex-1 overflow-y-auto bg-black">
              <div className="max-w-5xl mx-auto">
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
            placeholder={hasMessages ? "Message Kana..." : "Ask me anything..."}
            currentModel={currentModel}
            onModelChange={handleModelChange}
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
  );
}

export default App;