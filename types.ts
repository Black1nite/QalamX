export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export enum ModelType {
  FAST = 'gemini-3-flash-preview',
  REASONING = 'gemini-3-pro-preview'
}

export interface Attachment {
  name: string;
  type: string; // MIME type (e.g., 'image/png', 'application/pdf')
  data: string; // Base64 encoded string
  size: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachment?: Attachment; // Added real attachment support
  thinking?: string;
  isThinking?: boolean;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: ModelType;
  lastUpdated: number;
}
