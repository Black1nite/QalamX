import { ModelType } from "./types";

export const DEFAULT_LANGUAGE = 'ar';
export const DEFAULT_DIRECTION = 'rtl';

export const MODEL_CONFIGS = {
  [ModelType.Lite]: {
    name: 'Qalam Lite',
    id: 'gemini-3-flash-preview', 
    color: 'text-primary',
    bg: 'bg-primary',
    icon: 'Sparkles',
    description: 'Fast & Efficient'
  },
  [ModelType.Pro]: {
    name: 'Qalam Pro',
    id: 'gemini-3-pro-preview',
    color: 'text-thinking',
    bg: 'bg-thinking',
    icon: 'Brain',
    description: 'Deep Reasoning'
  }
};

export const INITIAL_GREETING_AR = "مرحباً، أنا قلم. كيف يمكنني مساعدتك اليوم؟";
export const INITIAL_GREETING_EN = "Hello, I am Qalam. How can I assist you today?";
