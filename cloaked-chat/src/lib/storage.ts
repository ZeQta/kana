import { Conversation } from '@/types';

const STORAGE_KEY = 'cloaked-chat-conversations';

export class ConversationStorage {
  static getConversations(): Conversation[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  static saveConversations(conversations: Conversation[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  static addConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    conversations.unshift(conversation);
    this.saveConversations(conversations);
  }

  static updateConversation(conversationId: string, updates: Partial<Conversation>): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === conversationId);
    
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...updates, updatedAt: Date.now() };
      this.saveConversations(conversations);
    }
  }

  static deleteConversation(conversationId: string): void {
    const conversations = this.getConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    this.saveConversations(filtered);
  }

  static getConversation(conversationId: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(c => c.id === conversationId) || null;
  }

  static clearAllConversations(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}