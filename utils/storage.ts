import { ChatSession, Message, ModelType } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'qalamx_sessions',
  SETTINGS: 'qalamx_settings',
  CURRENT_SESSION: 'qalamx_current_session_id'
};

export interface AppSettings {
  language: 'ar' | 'en';
  theme: 'dark' | 'light';
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  theme: 'dark'
};

// --- Sessions Management ---

export const getSessions = (): ChatSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

export const saveSession = (session: ChatSession) => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const deleteSession = (sessionId: string) => {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const clearAllSessions = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
};

// --- Settings Management ---

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};
