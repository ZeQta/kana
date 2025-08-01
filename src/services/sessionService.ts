import type { Session, Message } from '../types';

const SESSIONS_KEY = 'cloaked_chat_sessions';
const CURRENT_SESSION_KEY = 'cloaked_chat_current_session';

export function saveSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

export function loadSessions(): Session[] {
  try {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

export function saveCurrentSessionId(sessionId: string): void {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  } catch (error) {
    console.error('Error saving current session ID:', error);
  }
}

export function loadCurrentSessionId(): string | null {
  try {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Error loading current session ID:', error);
    return null;
  }
}

export function createSession(title: string = 'New Chat'): Session {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model: 'openrouter/horizon-alpha',
    systemPrompt: undefined
  };
}

export function updateSession(sessions: Session[], sessionId: string, messages: Message[]): Session[] {
  return sessions.map(session => 
    session.id === sessionId 
      ? { 
          ...session, 
          messages, 
          updatedAt: Date.now(),
          title: session.title === 'New Chat' && messages.length > 0 
            ? (messages[0].content.length > 50 
                ? messages[0].content.substring(0, 50) + '...' 
                : messages[0].content)
            : session.title
        }
      : session
  );
}

export function deleteSession(sessions: Session[], sessionId: string): Session[] {
  return sessions.filter(session => session.id !== sessionId);
}

export function updateSessionModel(sessions: Session[], sessionId: string, model: string): Session[] {
  return sessions.map(session => 
    session.id === sessionId 
      ? { ...session, model, updatedAt: Date.now() }
      : session
  );
}

export function updateSessionSystemPrompt(sessions: Session[], sessionId: string, systemPrompt: string): Session[] {
  return sessions.map(session => 
    session.id === sessionId 
      ? { ...session, systemPrompt, updatedAt: Date.now() }
      : session
  );
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing sessions:', error);
  }
}

export function exportSessions(): string {
  try {
    const sessions = loadSessions();
    return JSON.stringify(sessions, null, 2);
  } catch (error) {
    console.error('Error exporting sessions:', error);
    return '[]';
  }
}

export function importSessions(jsonData: string): Session[] {
  try {
    const sessions = JSON.parse(jsonData);
    if (Array.isArray(sessions)) {
      // Validate session structure
      const validSessions = sessions.filter(session => 
        session.id && 
        session.title && 
        Array.isArray(session.messages) &&
        typeof session.createdAt === 'number' &&
        typeof session.updatedAt === 'number'
      );
      
      saveSessions(validSessions);
      return validSessions;
    }
    return [];
  } catch (error) {
    console.error('Error importing sessions:', error);
    return [];
  }
}