import type { Session, Message } from '../types';

const SESSIONS_KEY = 'kana_sessions';
const CURRENT_SESSION_KEY = 'kana_current_session';

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadSessions(): Session[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCurrentSessionId(sessionId: string): void {
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
}

export function loadCurrentSessionId(): string | null {
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function createSession(firstMessage: string): Session {
  const now = Date.now();
  const title = firstMessage.length > 50 
    ? firstMessage.substring(0, 50) + '...'
    : firstMessage;

  return {
    id: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    messages: [],
    createdAt: now,
    updatedAt: now
  };
}

export function updateSession(sessions: Session[], sessionId: string, messages: Message[]): Session[] {
  return sessions.map(session => 
    session.id === sessionId 
      ? { ...session, messages, updatedAt: Date.now() }
      : session
  );
}