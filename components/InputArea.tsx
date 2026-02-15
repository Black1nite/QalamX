import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Paperclip, Sparkles, Brain, FileText, X, Image as ImageIcon, Camera } from 'lucide-react';
import { ModelType, Attachment } from '../types';
import { fileToBase64, compressImage, formatFileSize } from '../utils/fileHelpers';
import { TRANSLATIONS, Language } from '../constants';
import CameraModal from './CameraModal';

interface InputAreaProps {
  onSend: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
  model: ModelType;
  setModel: (model: ModelType) => void;
  lang: Language;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, model, setModel, lang }) => {
  // Local state is CRITICAL for performance with large text. 
  // We do NOT bubble up state to App on every keystroke.
  const [localInput, setLocalInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [textDir, setTextDir] = useState<'rtl' | 'ltr'>('auto');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isDeepThink = model === ModelType.REASONING;
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // Increased max height
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [localInput]);

  // Auto-detect direction based on first char
  useEffect(() => {
    if (!localInput) {
        setTextDir(lang === 'ar' ? 'rtl' : 'ltr');
        return;
    }
    const firstChar = localInput.trim()[0];
    if (firstChar && /[\u0600-\u06FF]/.test(firstChar)) {
        setTextDir('rtl');
    } else if (firstChar) {
        setTextDir('ltr');
    }
  }, [localInput, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
      try {
        let base64: string;
        let type = file.type;

        if (file.type.startsWith('image/')) {
            base64 = await compressImage(file);
            type = 'image/jpeg';
        } else {
            base64 = await fileToBase64(file);
        }

        setAttachment({
          name: file.name,
          type: type,
          data: base64,
          size: file.size
        });
      } catch (err) {
        console.error(err);
        alert(t.error);
      }
  };

  const handleCameraCapture = (base64: string) => {
      // Create a dummy attachment from camera
      // Size is approximate since we have base64 string
      const sizeInBytes = Math.ceil((base64.length * 3) / 4);
      setAttachment({
          name: `Camera_${new Date().getTime()}.jpg`,
          type: 'image/jpeg',
          data: base64,
          size: sizeInBytes
      });
      setIsCameraOpen(false);
  };

  const handleSendClick = () => {
    if ((!localInput.trim() && !attachment) || isLoading) return;
    onSend(localInput, attachment);
    setLocalInput('');
    setAttachment(undefined);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <>
    <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={handleCameraCapture} 
    />

    <div className="w-full px-4 pb-4 pt-2 z-20">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        
        <div className="flex justify-center mb-1">
            <div className="bg-[#121214] p-1 rounded-full flex gap-1 border border-qalam-border shadow-lg">
                 <button 
                    onClick={() => setModel(ModelType.FAST)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 ${!isDeepThink ? 'bg-qalam-surface text-white shadow-sm ring-1 ring-white/10' : 'text-qalam-subtext hover:text-white'}`}
                 >
                    <Sparkles size={12} className={!isDeepThink ? "text-blue-400" : ""} />
                    <span>{t.modelLite}</span>
                 </button>
                 <button 
                    onClick={() => setModel(ModelType.REASONING)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 ${isDeepThink ? 'bg-qalam-surface text-white shadow-sm ring-1 ring-white/10' : 'text-qalam-subtext hover:text-white'}`}
                 >
                    <Brain size={12} className={isDeepThink ? "text-purple-400" : ""} />
                    <span>{t.modelPro}</span>
                </button>
            </div>
        </div>

        <div 
            className={`
                relative w-full bg-[#121214]/90 backdrop-blur-xl rounded-[24px] border transition-all duration-300 ease-out
                ${isFocused ? 'border-blue-500/50 shadow-glow' : 'border-qalam-border shadow-glass'}
            `}
        >
          {attachment && (
             <div className="mx-4 mt-3 p-2 bg-qalam-surface rounded-xl border border-qalam-border flex items-center gap-3 w-fit animate-fade-in max-w-full">
                 <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex-shrink-0 flex items-center justify-center text-blue-400">
                     {attachment.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                 </div>
                 <div className="flex-1 min-w-0">
                     <div className="text-white text-sm font-medium truncate">{attachment.name}</div>
                     <div className="text-[10px] text-qalam-subtext">{formatFileSize(attachment.size)}</div>
                 </div>
                 <button onClick={() => setAttachment(undefined)} className="p-1 text-qalam-subtext hover:text-red-400 hover:bg-white/5 rounded-full">
                    <X size={16} />
                 </button>
             </div>
          )}

          <textarea
              ref={textareaRef}
              rows={1}
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={attachment ? t.inputPlaceholderFile : t.inputPlaceholder}
              className={`w-full bg-transparent border-none text-white placeholder-qalam-subtext/40 px-5 py-4 min-h-[56px] max-h-[200px] overflow-y-auto focus:outline-none resize-none font-sans text-[16px] leading-relaxed rounded-[24px]`}
              style={{ direction: textDir }}
              disabled={isLoading}
          />

          <div className="flex justify-between items-center px-3 pb-2">
             <div className="flex gap-1">
                {/* Specific accept types to potentially bypass generic "Camera/Files" prompt on some Androids */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect} 
                    accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-full transition-colors text-qalam-subtext hover:text-white hover:bg-qalam-surface`}
                    title={t.attach}
                >
                    <Paperclip size={20} strokeWidth={2} />
                </button>

                {/* Mobile Camera Button - Kept separate */}
                 <button 
                    onClick={() => setIsCameraOpen(true)}
                    className={`p-2.5 rounded-full transition-colors text-qalam-subtext hover:text-white hover:bg-qalam-surface md:hidden`}
                    title="Camera"
                >
                    <Camera size={20} strokeWidth={2} />
                </button>
             </div>

             <button
                onClick={handleSendClick}
                disabled={(!localInput.trim() && !attachment) || isLoading}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
                    ${(localInput.trim() || attachment) && !isLoading 
                    ? 'bg-white text-black hover:scale-105 active:scale-95' 
                    : 'bg-[#2A2A2E] text-[#555] cursor-not-allowed'}
                `}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                    <ArrowUp size={22} strokeWidth={3} />
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default InputArea;