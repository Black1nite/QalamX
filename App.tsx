import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import InputCapsule from './components/InputCapsule';
import MessageBubble from './components/MessageBubble';
import SettingsModal from './components/SettingsModal';
import { Message, Sender, ModelType, AppSettings, ChatSession } from './types';
import { detectDirection, parseThinkingResponse, generateId, fileToBase64 } from './utils/helpers';
import { DEFAULT_LANGUAGE, DEFAULT_DIRECTION, INITIAL_GREETING_AR, INITIAL_GREETING_EN } from './constants';
import { streamResponse } from './services/geminiService';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    language: DEFAULT_LANGUAGE as 'ar' | 'en',
    direction: DEFAULT_DIRECTION as 'rtl' | 'ltr',
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModel, setCurrentModel] = useState<ModelType>(ModelType.Lite);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [sessions] = useState<ChatSession[]>([
    { id: '1', title: 'Quantum Computing Intro', preview: '...', timestamp: Date.now() },
    { id: '2', title: 'تحليل المتنبي', preview: '...', timestamp: Date.now() }
  ]);

  useEffect(() => {
    const greeting = settings.language === 'ar' ? INITIAL_GREETING_AR : INITIAL_GREETING_EN;
    setMessages([{
      id: 'init',
      text: greeting,
      sender: Sender.Model,
      timestamp: Date.now(),
      modelUsed: ModelType.Lite
    }]);
  }, [settings.language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, model: ModelType, attachmentFiles: File[]) => {
    if (!text.trim() && attachmentFiles.length === 0) return;
    
    // Process attachments
    const attachments = await Promise.all(
      attachmentFiles.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await fileToBase64(file)
      }))
    );

    const newUserMessage: Message = {
      id: generateId(),
      text,
      sender: Sender.User,
      timestamp: Date.now(),
      attachments
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    const aiMessageId = generateId();
    setMessages(prev => [...prev, {
      id: aiMessageId,
      text: '',
      sender: Sender.Model,
      timestamp: Date.now(),
      modelUsed: model,
      isThinking: model === ModelType.Pro, 
      thinkingContent: '',
      finalContent: ''
    }]);

    let fullResponseText = '';

    await streamResponse(
      messages, 
      text, 
      model, 
      attachments,
      settings.language, 
      (chunk) => {
        fullResponseText += chunk;
        
        setMessages(prev => prev.map(msg => {
          if (msg.id === aiMessageId) {
            if (model === ModelType.Pro) {
               const { thinkingContent, finalContent } = parseThinkingResponse(fullResponseText);
               return {
                 ...msg,
                 text: fullResponseText,
                 thinkingContent: thinkingContent || (msg.isThinking ? 'Thinking process initialized...' : ''),
                 finalContent: finalContent,
                 isThinking: !fullResponseText.includes('</thinking>')
               };
            } else {
              return { ...msg, text: fullResponseText, finalContent: fullResponseText, isThinking: false };
            }
          }
          return msg;
        }));
        
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            if (scrollHeight - scrollTop - clientHeight < 200) {
                 scrollToBottom();
            }
        }
    });

    setIsLoading(false);
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === aiMessageId) {
        return { ...msg, isThinking: false };
      }
      return msg;
    }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div 
      className="flex h-[100dvh] bg-background text-text font-sans overflow-hidden selection:bg-primary/20"
      dir={settings.direction}
    >
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Top Left Glow */}
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
         {/* Bottom Right Glow */}
         <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        onNewChat={() => setMessages([])}
        onOpenSettings={() => setShowSettings(true)}
        language={settings.language}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-background/60 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
           <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-surface-highlight to-black border border-white/10 flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
              <span className="font-bold text-lg tracking-tight">Qalam<span className="text-primary font-normal">X</span></span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-subtext hover:text-white transition-colors">
             <Menu size={24} strokeWidth={1.5} />
           </button>
        </div>

        {/* Chat Scroll Area */}
        <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto scroll-smooth no-scrollbar"
        >
          <div className="max-w-4xl mx-auto px-4 py-6 md:p-8 min-h-full flex flex-col justify-start">
             <div className="h-4 md:h-8"></div>
             
             {messages.map((msg, index) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isLast={index === messages.length - 1}
                language={settings.language}
              />
            ))}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] px-2 md:px-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent">
          <InputCapsule 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            currentModel={currentModel}
            onModelChange={setCurrentModel}
            language={settings.language}
          />
        </div>
      </div>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export default App;