export enum Sender {
  User = 'user',
  Model = 'model',
}

export enum ModelType {
  Lite = 'lite',
  Pro = 'pro',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  // Specific to Model messages
  isThinking?: boolean;
  thinkingContent?: string; // Content inside <thinking> tags
  finalContent?: string;    // Content after <thinking> tags
  modelUsed?: ModelType;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  name: string;
  type: string;
  data: string; // base64
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
}

export interface AppSettings {
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
}
