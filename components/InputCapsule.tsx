import React, { useRef, useState, useEffect } from 'react';
import { Paperclip, ArrowUp, Sparkles, Brain, X } from 'lucide-react';
import { ModelType } from '../types';
import { detectDirection } from '../utils/helpers';
import { MODEL_CONFIGS } from '../constants';

interface InputCapsuleProps {
  onSendMessage: (text: string, model: ModelType, attachments: File[]) => void;
  isLoading: boolean;
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  language: string;
}

const InputCapsule: React.FC<InputCapsuleProps> = ({ 
  onSendMessage, 
  isLoading, 
  currentModel, 
  onModelChange,
  language
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText, currentModel, attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const textDir = detectDirection(inputText);
  const isRTL = language === 'ar';

  return (
    <div className="w-full max-w-3xl mx-auto relative group">
      {/* Model Switcher Pill (Floating above) */}
      <div className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-none z-10 transition-opacity duration-300 opacity-100">
         <div className="pointer-events-auto bg-[#0F0F0F]/80 backdrop-blur-xl border border-white/10 rounded-full p-1 flex shadow-lg">
            {(Object.values(ModelType) as ModelType[]).map((type) => {
              const config = MODEL_CONFIGS[type];
              const isActive = currentModel === type;
              const Icon = type === ModelType.Lite ? Sparkles : Brain;
              
              return (
                <button
                  key={type}
                  onClick={() => onModelChange(type)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? 'text-white shadow-lg' 
                      : 'text-subtext hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 opacity-20 ${config.bg}`}></div>
                  )}
                  <Icon size={14} className={isActive ? (type === ModelType.Pro ? 'text-thinking animate-pulse' : 'text-primary') : ''} />
                  <span className="text-[11px] font-semibold tracking-wide">{config.name}</span>
                </button>
              );
            })}
         </div>
      </div>

      {/* Main Input Capsule */}
      <div className={`
        relative 
        bg-[#0F0F0F]/80 backdrop-blur-2xl
        border border-white/10 
        rounded-[32px] 
        shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        transition-all duration-300
        focus-within:border-white/20 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.6)]
        flex flex-col
        mx-2 md:mx-0
      `}>
        
        {/* Attachments Area */}
        {attachments.length > 0 && (
          <div className="px-4 pt-4 flex flex-wrap gap-2 animate-slide-up-fade">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#1A1A1A] pl-3 pr-2 py-1.5 rounded-xl text-xs text-gray-300 border border-white/5">
                <span className="truncate max-w-[100px] font-mono">{file.name}</span>
                <button onClick={() => removeAttachment(idx)} className="p-1 hover:text-red-400 rounded-full hover:bg-white/10 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end p-2 gap-2">
          {/* Attachment Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-subtext hover:text-white bg-transparent hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
          >
            <Paperclip size={22} strokeWidth={1.5} />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect}
              multiple
            />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRTL ? "اكتب ما يدور في ذهنك..." : "Type your query here..."}
            dir={textDir}
            className={`
              flex-1 bg-transparent border-none outline-none text-[#F3F4F6] text-[16px] md:text-[17px] resize-none py-3.5 max-h-[120px]
              placeholder-gray-600 leading-relaxed font-light
            `}
            rows={1}
            style={{ minHeight: '52px' }}
          />

          {/* Send Button */}
          <button 
            onClick={handleSend}
            disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
              ${inputText.trim() || attachments.length > 0
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-100 hover:scale-105' 
                : 'bg-[#1A1A1A] text-gray-600 scale-100 cursor-not-allowed border border-white/5'}
            `}
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <ArrowUp size={22} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputCapsule;