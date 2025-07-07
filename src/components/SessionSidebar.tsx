import React from 'react';
import { MessageSquare, Plus, Trash2, ExternalLink } from 'lucide-react';
import type { Session } from '../types';

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onClose
}: SessionSidebarProps) {
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-gray-800 border-r border-gray-700 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out z-50 lg:relative lg:translate-x-0 lg:z-auto`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={onNewSession}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus size={20} />
              New Chat
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id
                      ? 'bg-gray-700 border border-gray-600'
                      : 'hover:bg-gray-750'
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                      {session.model === 'gemini-2.5-pro' && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                          Agentic
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
              
              {sortedSessions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer with branding */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                Made with ❤️ in India
              </p>
              <a
                href="https://zeqta.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
              >
                <span className="font-semibold">
                  Singularity
                </span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}