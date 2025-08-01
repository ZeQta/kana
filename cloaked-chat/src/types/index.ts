export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  artifacts?: Artifact[];
  files?: FileAttachment[];
}

export interface Artifact {
  id: string;
  name: string;
  type: 'html' | 'react' | 'python' | 'javascript' | 'markdown' | 'css' | 'json';
  content: string;
  description?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  content?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface CreateArtifactArgs {
  name: string;
  type: 'html' | 'react' | 'python' | 'javascript' | 'markdown' | 'css' | 'json';
  content: string;
  description?: string;
}