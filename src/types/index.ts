export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  artifacts?: Artifact[];
  toolResults?: any[];
  files?: UploadedFile[];
  isStreaming?: boolean;
  isThinking?: boolean;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  systemPrompt?: string;
}

export interface StreamResponse {
  choices: Array<{
    delta: {
      content?: string;
      tool_calls?: any[];
    };
    finish_reason?: string;
  }>;
}

export interface Artifact {
  id: string;
  name: string;
  type: ArtifactType;
  content: string;
  metadata: ArtifactMetadata;
  renderState?: ArtifactRenderState;
  history?: ArtifactVersion[];
  createdAt: number;
  updatedAt: number;
}

export type ArtifactType = 
  | 'text/html'
  | 'application/vnd.cloaked.react'
  | 'text/markdown'
  | 'application/vnd.cloaked.code'
  | 'image/svg+xml'
  | 'application/vnd.cloaked.chart'
  | 'application/vnd.cloaked.game'
  | 'application/vnd.cloaked.python'
  | 'application/vnd.cloaked.javascript'
  | 'application/vnd.cloaked.typescript'
  | 'application/vnd.cloaked.json'
  | 'application/vnd.cloaked.csv'
  | 'application/vnd.cloaked.sql';

export interface ArtifactMetadata {
  title: string;
  description?: string;
  language?: string;
  libraries?: string[];
  created: number;
  lastModified: number;
  version: number;
  archived?: boolean;
  tags?: string[];
  category?: string;
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
  theme: 'dark' | 'light' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  enableAnimations: boolean;
  autoSave: boolean;
  maxHistoryLength: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
  preview?: string;
  uploadedAt: number;
}

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  supportsMultimodal: boolean;
  supportsFunctionCalling: boolean;
  pricing?: {
    input: number;
    output: number;
  };
}

export interface ChatConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: string;
  orientation: string;
  scope: string;
  startUrl: string;
}