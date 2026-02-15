import React, { useState } from 'react';
import { Plus, MessageSquare, Settings, PanelLeftClose, Feather, Search, Trash2, ChevronDown } from 'lucide-react';
import { ChatSession } from '../types';
import { TRANSLATIONS, Language } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, onToggle, onNewChat, onOpenSettings, 
    sessions, onSelectSession, onDeleteSession, currentSessionId, lang 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = TRANSLATIONS[lang];

  // Real filtering logic
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
        {/* Mobile Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={onToggle}
        />

        <div 
        className={`
            fixed inset-y-0 ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            w-[280px] bg-qalam-panel/95 backdrop-blur-xl border-qalam-border
            md:relative md:translate-x-0 
            ${isOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full') + ' md:w-0 md:opacity-0 md:overflow-hidden'}
        `}
        >
            {/* Brand Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-qalam-border shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Feather size={18} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold tracking-tight text-lg text-white font-sans">Qalam<span className="text-blue-500">X</span></span>
                </div>
                <button onClick={onToggle} className="md:hidden text-qalam-subtext hover:text-white">
                    <PanelLeftClose size={20} />
                </button>
            </div>

            {/* Real Search Bar */}
            <div className="px-4 pt-4 pb-2 shrink-0">
                <div className="relative group">
                    <Search size={14} className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} text-qalam-subtext group-focus-within:text-blue-400 transition-colors`} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder} 
                        className={`w-full bg-qalam-surface border border-qalam-border rounded-lg py-2.5 ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-sm text-white placeholder-qalam-subtext focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all`}
                    />
                </div>
            </div>

            {/* Main Action */}
            <div className="px-4 py-2 shrink-0">
                <button 
                    onClick={() => { onNewChat(); if (window.innerWidth < 768) onToggle(); }}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black h-10 rounded-lg font-bold text-sm transition-transform active:scale-95 hover:bg-blue-50 shadow-md"
                >
                    <Plus size={18} />
                    <span>{t.newChat}</span>
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
                
                {/* Sessions Section */}
                <div>
                    <div className="text-[11px] font-bold text-qalam-subtext/60 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                        <span>{searchQuery ? t.searchPlaceholder : t.recent}</span>
                    </div>
                    
                    <div className="space-y-0.5">
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => (
                                <button 
                                    key={session.id}
                                    onClick={() => { onSelectSession(session.id); if (window.innerWidth < 768) onToggle(); }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative ${currentSessionId === session.id ? 'bg-white/10 text-white' : 'text-qalam-subtext hover:bg-qalam-surface hover:text-white'}`}
                                >
                                    <MessageSquare size={16} className={`shrink-0 ${currentSessionId === session.id ? 'text-blue-400' : 'opacity-50'}`} />
                                    <span className={`text-sm truncate font-medium flex-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {session.title || t.newChat}
                                    </span>
                                    
                                    <div 
                                        className={`p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-all absolute top-1.5 bottom-1.5 z-10 flex items-center ${
                                            // Visible on mobile always, hidden on desktop until hover
                                            'opacity-100 md:opacity-0 md:group-hover:opacity-100 text-qalam-subtext/60'
                                        }`}
                                        style={lang === 'ar' ? { left: '8px' } : { right: '8px' }}
                                        onClick={(e) => onDeleteSession(session.id, e)}
                                    >
                                        <Trash2 size={14} />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-4 text-qalam-subtext/50 text-xs">
                                {t.noResults}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-qalam-border space-y-1 bg-qalam-panel/50 shrink-0">
                <button 
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-qalam-subtext hover:bg-qalam-surface hover:text-white transition-all group"
                >
                    <Settings size={18} />
                    <span className="text-sm font-medium">{t.settings}</span>
                </button>
            </div>
        </div>
    </>
  );
};

export default Sidebar;