import React, { useState, useEffect } from 'react';
import { X, User, Monitor, Database, ChevronRight, Check, Globe, Moon, Shield, Sparkles } from 'lucide-react';
import { TRANSLATIONS, Language } from '../constants';
import { clearAllSessions, AppSettings } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, currentSettings, onSaveSettings, onClearData 
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState<AppSettings>(currentSettings);
  
  useEffect(() => {
    if (isOpen) {
        setLocalSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  const t = TRANSLATIONS[localSettings.language];

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleClear = () => {
    if (confirm(t.confirmClear)) {
        clearAllSessions();
        onClearData();
        onClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', icon: Globe, label: t.general },
    { id: 'account', icon: User, label: t.account },
    { id: 'data', icon: Database, label: t.data },
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85dvh] md:h-[600px] animate-scale-in" 
        dir={localSettings.language === 'ar' ? 'rtl' : 'ltr'}
      >
        
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-[#121214] border-b md:border-b-0 md:border-l md:border-r-0 border-white/5 p-6 flex flex-col gap-2 shrink-0">
            <h2 className="text-2xl font-bold text-white mb-6 px-2 hidden md:flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                     <Sparkles size={20} className="text-blue-500" />
                </div>
                {t.settings}
            </h2>
            
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap
                                ${isActive 
                                    ? 'bg-white text-black shadow-lg shadow-white/5' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            <Icon size={18} className={isActive ? "text-black" : ""} />
                            <span className="flex-1 text-start">{tab.label}</span>
                            {isActive && <ChevronRight size={16} className={`hidden md:block ${localSettings.language === 'ar' ? 'rotate-180' : ''} text-black/50`} />}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0c]">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 shrink-0">
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        {activeTabLabel}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        {t.manage} {activeTabLabel} {t.preferences}
                    </p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                
                {/* GENERAL SETTINGS */}
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Language Section */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={12} />
                                {t.language}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['ar', 'en'].map((lang) => (
                                    <button 
                                        key={lang}
                                        onClick={() => setLocalSettings({...localSettings, language: lang as any})}
                                        className={`
                                            relative p-5 rounded-2xl border transition-all flex items-center gap-4 group
                                            ${localSettings.language === lang 
                                                ? 'border-blue-500 bg-blue-500/10' 
                                                : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'}
                                        `}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110 ${localSettings.language === lang ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-500'}`}>
                                            {lang === 'ar' ? 'ع' : 'En'}
                                        </div>
                                        <div className="text-start">
                                            <div className={`text-lg font-bold ${localSettings.language === lang ? 'text-white' : 'text-gray-300'}`}>
                                                {lang === 'ar' ? 'العربية' : 'English'}
                                            </div>
                                        </div>
                                        {localSettings.language === lang && (
                                            <div className="absolute top-5 right-5 text-blue-500">
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <Check size={14} className="text-white" strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ACCOUNT SETTINGS */}
                {activeTab === 'account' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in pb-10">
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-4 ring-[#0a0a0c]">
                                <User size={56} className="text-white" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#0a0a0c] p-1.5 rounded-full">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-[#0a0a0c]">
                                    <Check size={14} className="text-white" strokeWidth={4} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-white">{t.guest}</h3>
                            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">{t.guestDesc}</p>
                        </div>
                        <div className="px-5 py-2.5 bg-green-500/10 rounded-full border border-green-500/20 text-xs font-bold tracking-wide text-green-400 flex items-center gap-2 uppercase">
                            <Shield size={12} />
                            Encrypted & Local
                        </div>
                    </div>
                )}

                {/* DATA SETTINGS */}
                {activeTab === 'data' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between group hover:border-red-500/20 transition-all">
                            <div className="space-y-2">
                                <h4 className="text-xl text-red-400 font-bold flex items-center gap-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg">
                                        <Database size={20} />
                                    </div>
                                    {t.clearAll}
                                </h4>
                                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                                    This action will permanently wipe all local data, including chat history and settings.
                                </p>
                            </div>
                            <button 
                                onClick={handleClear}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-red-900/20 whitespace-nowrap active:scale-95"
                            >
                                {t.clearAll}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0a0a0c] shrink-0">
                <button 
                    onClick={onClose} 
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                    {t.cancel}
                </button>
                <button 
                    onClick={handleSave} 
                    className="px-8 py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-100 transition-all shadow-lg shadow-white/5 transform active:scale-95"
                >
                    {t.save}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;