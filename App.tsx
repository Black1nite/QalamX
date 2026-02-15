import React, { useState, useRef, useEffect } from 'react';
import { PanelLeft, Feather } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import SettingsModal from './components/SettingsModal';
import { Message, Role, ModelType, Attachment, ChatSession } from './types';
import { streamChatResponse } from './services/geminiService';
import { parseThinkingContent } from './utils/textParser';
import { getSessions, saveSession, getSettings, saveSettings as saveLocalSettings, deleteSession, AppSettings } from './utils/storage';
import { TRANSLATIONS } from './constants';

const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({ language: 'ar', theme: 'dark' });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Input state moved to InputArea for performance!
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelType>(ModelType.REASONING);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Translations
  const t = TRANSLATIONS[settings.language];

  // Load Data on Mount
  useEffect(() => {
    setSessions(getSessions());
    setSettings(getSettings());
    
    // Auto-open sidebar on desktop, close on mobile
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  // Update Messages when Session Changes
  useEffect(() => {
    if (currentSessionId) {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session) {
            setMessages(session.messages);
            setCurrentModel(session.model);
        }
    } else {
        setMessages([]);
    }
  }, [currentSessionId, sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, messages.length]);


  // Handlers
  const handleSettingsSave = (newSettings: AppSettings) => {
      setSettings(newSettings);
      saveLocalSettings(newSettings);
  };

  const handleClearData = () => {
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
          setCurrentSessionId(null);
      }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleSend = async (textToSend: string, attachment?: Attachment) => {
    if ((!textToSend.trim() && !attachment) || isLoading) return;

    // Create new session if none exists
    let activeSessionId = currentSessionId;
    let newSessionCreated = false;

    if (!activeSessionId) {
        activeSessionId = generateId();
        newSessionCreated = true;
        setCurrentSessionId(activeSessionId);
    }

    const userMsg: Message = {
      id: generateId(),
      role: Role.USER,
      content: textToSend,
      attachment: attachment,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Initial save of session with user message
    const updatedSession: ChatSession = {
        id: activeSessionId!,
        title: newSessionCreated ? (textToSend.slice(0, 30) || (attachment ? attachment.name : 'New Chat')) : (sessions.find(s => s.id === activeSessionId)?.title || 'Chat'),
        messages: newMessages,
        model: currentModel,
        lastUpdated: Date.now()
    };
    saveSession(updatedSession);
    setSessions(getSessions()); // Refresh list

    // Prepare Bot Message
    const botMsgId = generateId();
    const initialBotMsg: Message = {
      id: botMsgId,
      role: Role.MODEL,
      content: '',
      thinking: currentModel === ModelType.REASONING ? '' : undefined,
      isThinking: currentModel === ModelType.REASONING,
      timestamp: Date.now(),
    };
    
    const messagesWithBot = [...newMessages, initialBotMsg];
    setMessages(messagesWithBot);

    let fullText = '';

    await streamChatResponse(
      newMessages,
      currentModel,
      (chunk) => {
        fullText += chunk;
        const { thinking, content } = parseThinkingContent(fullText);
        
        setMessages(prev => {
            const updated = prev.map(msg => {
                if (msg.id === botMsgId) {
                    return {
                        ...msg,
                        content: content,
                        thinking: thinking || undefined,
                        isThinking: !fullText.includes('</thinking>') && currentModel === ModelType.REASONING
                    };
                }
                return msg;
            });
            return updated;
        });
      },
      () => {
        setIsLoading(false);
        // Final Save
        const { thinking, content } = parseThinkingContent(fullText);
        const finalMessages = messagesWithBot.map(msg => {
             if (msg.id === botMsgId) {
                return { ...msg, content, thinking: thinking || undefined, isThinking: false };
             }
             return msg;
        });
        
        const finalSession: ChatSession = {
            ...updatedSession,
            messages: finalMessages,
            lastUpdated: Date.now()
        };
        saveSession(finalSession);
        setSessions(getSessions());
      },
      (error) => {
        setIsLoading(false);
        const errorMessage = error.message.includes('429') || error.message.includes('Quota') 
            ? t.quotaError 
            : `${t.error}: ${error.message}`;
            
        setMessages(prev => [...prev, {
          id: generateId(),
          role: Role.MODEL,
          content: errorMessage,
          timestamp: Date.now()
        }]);
      }
    );
  };

  return (
    <div 
        className="flex h-[100dvh] bg-deep-space text-qalam-text overflow-hidden font-sans relative"
        dir={settings.language === 'ar' ? 'rtl' : 'ltr'}
    >
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        onNewChat={startNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
        lang={settings.language}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSaveSettings={handleSettingsSave}
        onClearData={handleClearData}
      />

      <div className="flex-1 flex flex-col h-full relative w-full transition-all duration-300 isolate">
        
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-14 md:h-16 absolute top-0 left-0 right-0 z-30 pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
                {!isSidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="text-qalam-subtext hover:text-white transition-colors bg-black/20 p-2 rounded-lg backdrop-blur-sm shadow-sm">
                    <PanelLeft size={20} className={settings.language === 'ar' ? '' : 'rotate-180'} />
                </button>
                )}
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 pointer-events-auto">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] md:text-xs font-mono text-qalam-subtext">Ready</span>
            </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative pt-16">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 pb-20 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <div className="opacity-5 scale-150 blur-[2px] pointer-events-none select-none">
                     <Feather size={150} />
                </div>
                <div className="mt-8 text-center max-w-xs text-qalam-subtext/50 text-sm">
                    {t.welcomeDesc}
                </div>
            </div>
          ) : (
            <div className="flex flex-col pb-4 max-w-4xl mx-auto min-h-full pt-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} lang={settings.language} />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <InputArea 
          onSend={handleSend} 
          isLoading={isLoading}
          model={currentModel}
          setModel={setCurrentModel}
          lang={settings.language}
        />
      </div>
    </div>
  );
};

export default App;