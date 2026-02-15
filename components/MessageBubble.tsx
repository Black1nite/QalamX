import React, { useState } from 'react';
import { Sender, Message, ModelType } from '../types';
import { ChevronDown, ChevronRight, Brain, Sparkles, Copy, RefreshCw, Terminal, Check } from 'lucide-react';
import { MODEL_CONFIGS } from '../constants';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  language: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast, language }) => {
  const isUser = message.sender === Sender.User;
  const isRTL = language === 'ar';
  
  // State for collapsible thinking block
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.finalContent || message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className={`flex w-full mb-8 ${isRTL ? 'justify-start' : 'justify-end'} animate-slide-up-fade`}>
        <div className={`
          max-w-[85%] md:max-w-[70%] rounded-[20px] px-6 py-4
          bg-[#1A1A1A] border border-white/5 text-[#E5E7EB]
          shadow-[0_4px_20px_rgba(0,0,0,0.2)]
          ${isRTL ? 'rounded-br-sm' : 'rounded-bl-sm'}
        `}>
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
               {message.attachments.map((att, i) => (
                 <div key={i} className="bg-black/30 rounded-lg p-1 overflow-hidden border border-white/5">
                    {att.type.startsWith('image') ? (
                      <img src={`data:${att.type};base64,${att.data}`} alt="attachment" className="h-32 rounded-md object-cover" />
                    ) : (
                      <div className="px-4 py-2 flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">📄</div>
                          <span className="text-xs text-gray-300 font-mono">{att.name}</span>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          )}
          <div className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-[16px] font-normal tracking-wide">
            {message.text}
          </div>
        </div>
      </div>
    );
  }

  // Model Message Logic
  const ModelIcon = message.modelUsed === ModelType.Pro ? Brain : Sparkles;
  const modelColorClass = message.modelUsed === ModelType.Pro ? 'text-thinking' : 'text-primary';
  const modelGlowClass = message.modelUsed === ModelType.Pro ? 'shadow-thinking-glow/20' : 'shadow-primary-glow/20';

  return (
    <div className={`flex w-full mb-10 gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'} justify-end group animate-slide-up-fade`}>
      <div className="flex-1 max-w-4xl min-w-0">
        
        {/* Model Header */}
        <div className="flex items-center gap-2 mb-3 ml-1">
           <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${modelColorClass} flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/5`}>
             <ModelIcon size={10} />
             {MODEL_CONFIGS[message.modelUsed || ModelType.Lite].name}
           </span>
        </div>

        {/* Thinking Block (Terminal Style) */}
        {(message.thinkingContent || (message.isThinking && message.modelUsed === ModelType.Pro)) && (
          <div className="mb-6 overflow-hidden rounded-xl border border-thinking/20 bg-[#080808]">
            <button 
              onClick={() => setIsThinkingOpen(!isThinkingOpen)}
              className="w-full flex items-center gap-3 bg-white/5 px-4 py-2.5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                 <Terminal size={14} className="text-thinking" />
                 <span className="text-xs font-mono text-thinking/80">{isRTL ? 'عمليات التحليل' : 'Process Log'}</span>
              </div>
              <div className="flex-1 h-px bg-white/5"></div>
              {isThinkingOpen ? <ChevronDown size={14} className="text-subtext" /> : <ChevronRight size={14} className="text-subtext" />}
            </button>
            
            {isThinkingOpen && (
              <div className="p-4 font-mono text-xs md:text-sm text-subtext/70 leading-relaxed overflow-x-auto relative">
                 <div className="absolute top-0 left-0 w-1 h-full bg-thinking/20"></div>
                 <div className="pl-3">
                  {message.thinkingContent || (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-thinking rounded-full animate-pulse"></span>
                      <span className="animate-pulse">Analyzing context...</span>
                    </div>
                  )}
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Final Content */}
        <div className="text-[#E5E7EB] leading-7 md:leading-8">
           {message.finalContent ? (
             <div className="prose prose-invert prose-p:font-light prose-headings:font-normal prose-strong:text-white max-w-none">
                <ReactMarkdown>{message.finalContent}</ReactMarkdown>
             </div>
           ) : !message.thinkingContent && message.text ? (
             <div className="prose prose-invert prose-p:font-light prose-headings:font-normal prose-strong:text-white max-w-none">
                <ReactMarkdown>{message.text}</ReactMarkdown>
             </div>
           ) : (
             !message.thinkingContent && (
               <div className="flex items-center gap-1.5 h-8">
                 <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                 <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
               </div>
             )
           )}
        </div>
        
        {/* Actions Footer */}
        {!message.isThinking && message.finalContent && (
           <div className="flex gap-4 mt-6 text-subtext/60 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
              <button 
                onClick={handleCopy}
                className="hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md hover:bg-white/5" 
                title="Copy"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button className="hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md hover:bg-white/5" title="Regenerate">
                <RefreshCw size={14} />
                <span>Regenerate</span>
              </button>
           </div>
        )}
      </div>

      {/* Avatar Column */}
      <div className="flex-shrink-0 mt-1 hidden md:block">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-[#0F0F0F] border border-white/10 shadow-lg ${modelGlowClass}`}>
          <div className={`w-4 h-4 rounded-sm rotate-45 ${message.modelUsed === ModelType.Pro ? 'bg-thinking' : 'bg-primary'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;