export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  artifacts?: Artifact[];
  toolResults?: any[];
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

export interface StreamResponse {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  content: string;
  metadata: ArtifactMetadata;
  renderState?: ArtifactRenderState;
  history?: ArtifactVersion[];
}

export type ArtifactType = 
  | 'text/html'
  | 'application/vnd.kana.react'
  | 'text/markdown'
  | 'application/vnd.kana.code'
  | 'image/svg+xml'
  | 'application/vnd.kana.chart'
  | 'application/vnd.kana.game';

export interface ArtifactMetadata {
  title: string;
  description?: string;
  language?: string;
  libraries?: string[];
  created: number;
  lastModified: number;
  version: number;
  archived?: boolean;
}

export interface ArtifactRenderState {
  containerId: string;
  status: 'rendering' | 'ready' | 'error';
  error?: string;
  rendererInstance?: any;
}

export interface ArtifactVersion {
  version: number;
  content: string;
  timestamp: number;
  changeType: 'create' | 'update' | 'rewrite';
}

export interface LibraryConfig {
  version: string;
  url: string;
  dependencies?: string[];
  type?: 'js' | 'css';
}

export interface AppSettings {
  customSystemPrompt: string;
}