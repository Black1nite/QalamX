import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Role, Message } from '../types';
import { Copy, RefreshCw, ChevronRight, Terminal, Feather, FileText } from 'lucide-react';
import { TRANSLATIONS, Language } from '../constants';

interface MessageBubbleProps {
  message: Message;
  lang: Language;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, lang }) => {
  const isUser = message.role === Role.USER;
  const t = TRANSLATIONS[lang];
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  
  useEffect(() => {
      if (!message.isThinking && message.content) {
          setIsThinkingOpen(false);
      }
  }, [message.isThinking, message.content]);

  // Determine direction for the specific message content
  const contentDir = message.content && /[\u0600-\u06FF]/.test(message.content.substring(0, 50)) ? 'rtl' : 'ltr';

  const copyToClipboard = () => {
      if (message.content) {
          navigator.clipboard.writeText(message.content);
      }
  };

  if (isUser) {
      return (
        <div className="w-full py-4 px-4 flex justify-end">
             <div className="max-w-[85%] md:max-w-[75%] bg-[#252529] text-[#E1E1E3] px-5 py-4 rounded-[20px] rounded-br-sm shadow-md border border-white/5 flex flex-col gap-3">
                {/* Real Image Preview for User */}
                {message.attachment && message.attachment.type.startsWith('image/') && (
                    <div className="rounded-lg overflow-hidden border border-white/10 mb-1 max-w-full">
                        <img 
                            src={`data:${message.attachment.type};base64,${message.attachment.data}`} 
                            alt="User upload" 
                            className="max-h-[300px] w-auto object-contain bg-black/50"
                        />
                    </div>
                )}
                 {/* Real File Icon for User */}
                 {message.attachment && !message.attachment.type.startsWith('image/') && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <FileText size={20} className="text-blue-400" />
                        <span className="text-sm truncate max-w-[200px]">{message.attachment.name}</span>
                    </div>
                )}
                
                {message.content && (
                    <div 
                        className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-left dir-auto" 
                        dir={contentDir}
                        style={{ textAlign: contentDir === 'rtl' ? 'right' : 'left' }}
                    >
                        {message.content}
                    </div>
                )}
             </div>
        </div>
      );
  }

  // Model Response (QalamX)
  return (
    <div className="w-full py-4 px-4 flex justify-start animate-fade-in group">
      <div className="max-w-4xl w-full flex gap-4">
        
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mt-1 shadow-glow ring-1 ring-white/10">
            <Feather size={16} className="text-white" strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-start">
            <div className="text-xs font-bold text-qalam-subtext mb-2 flex items-center gap-3 select-none">
                QalamX
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono tracking-wide ${message.isThinking ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                    {message.isThinking ? t.analyzing : t.completed}
                </span>
            </div>

            {/* Technical Thinking Block (Collapsible) */}
            {message.thinking && (
                <div className="w-full mb-3 rounded-xl border border-purple-500/20 bg-[#151518] overflow-hidden shadow-inner relative">
                     {/* Decorative line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500"></div>

                    <button 
                        onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-[#1E1E22] hover:bg-[#252529] transition-colors border-b border-white/5 group-think"
                    >
                         <ChevronRight size={14} className={`text-qalam-subtext transition-transform duration-300 ${isThinkingOpen ? 'rotate-90' : ''}`} />
                         <Terminal size={14} className="text-purple-400" />
                         <span className="text-xs font-mono font-medium text-qalam-subtext group-think-hover:text-white">{t.thinking}</span>
                    </button>
                    
                    {isThinkingOpen && (
                        <div className="p-4 bg-[#0F0F10] overflow-x-auto custom-scrollbar">
                            <div className="font-mono text-xs text-qalam-subtext/90 leading-relaxed whitespace-pre-wrap pl-2" dir="ltr">
                                {message.thinking}
                                {message.isThinking && <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1 align-middle"/>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="text-[16px] leading-8 text-[#E1E1E3] w-full font-sans" dir={contentDir}>
                <div className="markdown-body">
                    {message.content ? (
                         <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                        !message.isThinking && (
                             <div className="h-6 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-300"></span>
                             </div>
                        )
                    )}
                </div>
            </div>

            {/* Action Bar */}
            {!message.isThinking && message.content && (
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={copyToClipboard} className="p-2 text-qalam-subtext/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2" title={t.copy}>
                  <Copy size={14} />
                  <span className="text-xs">{t.copy}</span>
                </button>
                <button className="p-2 text-qalam-subtext/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2" title={t.regenerate}>
                  <RefreshCw size={14} />
                  <span className="text-xs">{t.regenerate}</span>
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MessageBubble);