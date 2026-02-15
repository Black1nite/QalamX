import React from 'react';
import { Plus, MessageSquare, Settings, Search, X, Sparkles } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  onNewChat: () => void;
  onOpenSettings: () => void;
  language: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  sessions, 
  onNewChat, 
  onOpenSettings,
  language
}) => {
  const isRTL = language === 'ar';
  
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50
        w-[300px] bg-[#050505]/95 backdrop-blur-2xl border-white/5
        ${isRTL ? 'border-l' : 'border-r'}
        transform transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1)
        ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        md:translate-x-0 md:static flex flex-col h-full shadow-2xl
      `}>
        
        {/* Header */}
        <div className="p-6">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-[#1A1A1A] to-black rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/20 blur-lg"></div>
                   <span className="relative font-bold text-white font-mono">Q</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">Qalam<span className="text-primary font-normal">X</span></h1>
             </div>
             <button onClick={toggleSidebar} className="md:hidden p-2 text-subtext hover:text-white transition-colors">
                <X size={20} />
             </button>
           </div>

           <button 
             onClick={() => { onNewChat(); if(window.innerWidth < 768) toggleSidebar(); }}
             className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-white/10 text-white py-3.5 px-4 rounded-xl transition-all duration-200 group relative overflow-hidden"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
             <Plus size={18} className="group-hover:scale-110 transition-transform" />
             <span className="text-sm font-medium">{isRTL ? 'محادثة جديدة' : 'New Chat'}</span>
           </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 no-scrollbar">
          <div className="px-2 py-3 text-[11px] font-bold text-subtext/40 uppercase tracking-[0.2em]">
            {isRTL ? 'المحفوظات' : 'History'}
          </div>
          {sessions.map((session) => (
            <button 
              key={session.id}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl text-subtext hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-white/5"
            >
              <MessageSquare size={16} className="text-subtext/50 group-hover:text-primary transition-colors" />
              <div className="flex-1 truncate text-sm font-medium opacity-80 group-hover:opacity-100">
                {session.title}
              </div>
            </button>
          ))}
        </div>

        {/* User / Settings */}
        <div className="p-4 m-2 bg-[#0A0A0A] rounded-2xl border border-white/5">
          <button 
            onClick={() => { onOpenSettings(); if(window.innerWidth < 768) toggleSidebar(); }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-subtext hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-surface-highlight to-black border border-white/10 flex items-center justify-center">
               <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <div className="flex-1 text-left rtl:text-right">
               <span className="text-xs font-semibold block text-white">Settings</span>
               <span className="text-[10px] text-subtext/60">Preferences</span>
            </div>
          </button>
          
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 px-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-[#0A0A0A]"></div>
             <div className="flex-1 min-w-0 text-left rtl:text-right">
               <div className="text-xs font-bold text-white truncate">Pro Member</div>
               <div className="text-[10px] text-primary flex items-center gap-1">
                 <Sparkles size={8} />
                 Premium
               </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;