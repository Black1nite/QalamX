import React from 'react';
import { X, Globe, User, Database, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#151515]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-up">
        <div className="flex h-[500px]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-white/5 bg-white/5 p-4 flex flex-col gap-2">
            <h2 className="text-xl font-bold mb-6 px-2 font-sans">Settings</h2>
            
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-colors">
              <Globe size={18} />
              <span className="text-sm font-medium">General</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-subtext hover:bg-white/5 transition-colors">
              <User size={18} />
              <span className="text-sm font-medium">Account</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-subtext hover:bg-white/5 transition-colors">
              <Database size={18} />
              <span className="text-sm font-medium">Data</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold">General Settings</h3>
              <button onClick={onClose} className="text-subtext hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-subtext mb-3">Interface Language</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => onUpdateSettings({ language: 'ar', direction: 'rtl' })}
                    className={`relative p-4 rounded-xl border transition-all duration-300 ${
                      settings.language === 'ar' 
                        ? 'bg-primary/20 border-primary' 
                        : 'bg-surface hover:bg-surface-hover border-white/5'
                    }`}
                  >
                    <div className="text-lg font-arabic font-bold mb-1">العربية</div>
                    <div className="text-xs text-subtext">Arabic Interface</div>
                    {settings.language === 'ar' && (
                      <div className="absolute top-3 left-3 text-primary">
                        <Check size={16} />
                      </div>
                    )}
                  </button>

                  <button 
                     onClick={() => onUpdateSettings({ language: 'en', direction: 'ltr' })}
                    className={`relative p-4 rounded-xl border transition-all duration-300 ${
                      settings.language === 'en' 
                        ? 'bg-primary/20 border-primary' 
                        : 'bg-surface hover:bg-surface-hover border-white/5'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">English</div>
                    <div className="text-xs text-subtext">English Interface</div>
                    {settings.language === 'en' && (
                      <div className="absolute top-3 right-3 text-primary">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;