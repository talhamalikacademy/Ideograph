
import React, { useState, useEffect } from 'react';
import { CreatorProfile, UserPlan, SidebarView, Template, SavedScript } from '../types';
import { 
  LayoutDashboard, History, Settings, User, LogOut, 
  CreditCard, Bookmark, Crown, Lock, ChevronDown, 
  ChevronRight, Search, Users, Briefcase, 
  MoreHorizontal, ChevronLeft, Layers, Menu, PanelLeftClose, FileText, ArrowRight, PenTool
} from 'lucide-react';
import clsx from 'clsx';
import { TEMPLATES } from '../constants';

interface SidebarProps {
  creators: CreatorProfile[];
  selectedCreator: CreatorProfile;
  onSelectCreator: (creator: CreatorProfile) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenSubscription: () => void;
  isDarkMode: boolean;
  userPlan?: UserPlan;
  isOpen: boolean; // Mobile open state
  onClose: () => void; // Mobile close handler
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  history: SavedScript[];
  onLoadTemplate: (template: Template) => void;
  onSelectHistory: (script: SavedScript) => void;
  // Lifted Search Props
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Pro State
  isPro: boolean;
}

interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  isCollapsed: boolean; // Desktop collapsed state
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ 
  title, icon, isExpanded, onToggle, children, isDarkMode, isCollapsed
}) => {
  return (
    <div className={clsx("mb-2 transition-all", isCollapsed ? "px-1" : "")}>
      <button 
        onClick={onToggle}
        className={clsx(
          "w-full flex items-center transition-colors group relative",
          isCollapsed ? "justify-center p-2 rounded-xl" : "justify-between px-3 py-2 rounded-lg",
          isDarkMode 
            ? "hover:bg-white/5 text-slate-400 hover:text-white" 
            : "hover:bg-slate-100 text-slate-500 hover:text-slate-900",
           isCollapsed && isExpanded && (isDarkMode ? "bg-white/5 text-white" : "bg-slate-100 text-slate-900")
        )}
        title={isCollapsed ? title : undefined}
        aria-expanded={isExpanded}
      >
        <div className={clsx("flex items-center gap-2", isCollapsed ? "justify-center" : "")}>
           <span className={clsx("transition-opacity", !isCollapsed && "opacity-70 group-hover:opacity-100")}>{icon}</span>
           {!isCollapsed && <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">{title}</span>}
        </div>
        {!isCollapsed && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        
        {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {title}
            </div>
        )}
      </button>

      <div className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out", 
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className={clsx("pt-1 pb-2 space-y-1", isCollapsed ? "flex flex-col items-center" : "pl-2")}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  creators, 
  selectedCreator, 
  onSelectCreator,
  onOpenSettings,
  onOpenHistory,
  onOpenSubscription,
  isDarkMode,
  userPlan = 'free',
  isOpen,
  onClose,
  activeView,
  onViewChange,
  history,
  onLoadTemplate,
  onSelectHistory,
  searchQuery,
  setSearchQuery,
  isPro
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    workspace: true,
    content: true,
    account: false
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // --- Filtering Logic ---
  const filteredCreators = creators.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.style.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTemplates = TEMPLATES.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredHistory = history.filter(h => 
    h.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Resizing Logic
  const startResizing = React.useCallback(() => { setIsResizing(true); }, []);
  const stopResizing = React.useCallback(() => { setIsResizing(false); }, []);
  const resize = React.useCallback((mouseMoveEvent: MouseEvent) => {
      if (isResizing && !isCollapsed) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 240 && newWidth < 450) setSidebarWidth(newWidth);
      }
    }, [isResizing, isCollapsed]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const NavItem = ({ icon, label, onClick, isActive = false }: { icon: React.ReactNode, label: string, onClick: () => void, isActive?: boolean }) => (
    <button 
      onClick={onClick}
      className={clsx(
        "flex items-center transition-all duration-200 border border-transparent group relative",
        isCollapsed 
            ? "justify-center w-10 h-10 rounded-xl" 
            : "w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium",
        isActive 
          ? (isDarkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100")
          : (isDarkMode ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")
      )}
      title={isCollapsed ? label : undefined}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
            {label}
        </div>
      )}
    </button>
  );

  return (
    <>
      <div 
        className={clsx(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={clsx(
          "fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col border-r shadow-2xl md:shadow-none transition-all duration-300 ease-in-out will-change-[width,transform]",
          isDarkMode ? "bg-[#020617] border-white/5" : "bg-white border-slate-200",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ width: window.innerWidth >= 768 ? (isCollapsed ? 80 : sidebarWidth) : '85%' }}
      >
        <div className={clsx(
            "h-16 flex items-center border-b dark:border-white/5 border-slate-100 flex-shrink-0 transition-all",
            isCollapsed ? "justify-center px-0" : "justify-between px-4"
        )}>
          <div className={clsx("flex items-center gap-3 overflow-hidden", isCollapsed ? "w-8" : "w-auto")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 flex-shrink-0">
               <PenTool size={18} className="fill-white/20" />
            </div>
            <div className={clsx("transition-opacity duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>
              <h1 className={clsx("font-bold text-sm leading-none whitespace-nowrap", isDarkMode ? "text-white" : "text-slate-900")}>Ideograph</h1>
              <span className="text-[10px] opacity-50 uppercase tracking-widest font-mono whitespace-nowrap">Studio AI</span>
            </div>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={clsx(
                "hidden md:flex p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition-colors",
                isCollapsed ? "absolute top-20 left-1/2 -translate-x-1/2" : ""
            )}
          >
             {isCollapsed ? <Menu size={20} /> : <PanelLeftClose size={18} />}
          </button>
          <button onClick={onClose} className="md:hidden p-2 text-slate-500"><ChevronLeft size={20} /></button>
        </div>

        {/* Search Input - Conditional Display */}
        {activeView !== 'studio' && (
            <div className={clsx("p-3 transition-all animate-in fade-in slide-in-from-top-2", isCollapsed ? "px-2" : "")}>
                {!isCollapsed ? (
                    <div className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                        isDarkMode ? "bg-black/40 border-white/5 focus-within:border-indigo-500/50" : "bg-slate-50 border-slate-200 focus-within:border-indigo-500/50"
                    )}>
                        <Search size={14} className="opacity-50 flex-shrink-0" />
                        <input 
                        type="text"
                        placeholder={activeView === 'templates' ? "Search templates..." : "Search history..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none placeholder-opacity-50"
                        />
                    </div>
                ) : (
                   <button className="w-full h-10 flex items-center justify-center rounded-xl bg-black/20 text-slate-400">
                        <Search size={18} />
                    </button>
                )}
            </div>
        )}

        <div className={clsx("flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide space-y-4", isCollapsed ? "p-2" : "p-3")}>
          <SidebarSection 
            title="Workspace" 
            icon={<Briefcase size={14} />}
            isExpanded={expandedSections.workspace} 
            onToggle={() => toggleSection('workspace')}
            isDarkMode={isDarkMode}
            isCollapsed={isCollapsed}
          >
             <NavItem icon={<LayoutDashboard size={18} />} label="Studio" onClick={() => { onViewChange('studio'); if(window.innerWidth < 768) onClose(); }} isActive={activeView === 'studio'} />
             <NavItem icon={<Layers size={18} />} label="Templates" onClick={() => { onViewChange('templates'); setSearchQuery(''); if(window.innerWidth < 768) onClose(); }} isActive={activeView === 'templates'} />
             <NavItem icon={<History size={18} />} label="History" onClick={() => { onViewChange('history'); setSearchQuery(''); if(window.innerWidth < 768) onClose(); }} isActive={activeView === 'history'} />
          </SidebarSection>

          <SidebarSection 
            title={activeView === 'studio' ? "Personas" : "Items"} 
            icon={activeView === 'studio' ? <Users size={14} /> : <FileText size={14} />}
            isExpanded={expandedSections.content} 
            onToggle={() => toggleSection('content')}
            isDarkMode={isDarkMode}
            isCollapsed={isCollapsed}
          >
             <div className="space-y-1 w-full min-h-[100px]">
               {activeView === 'studio' && (
                  <>
                     {filteredCreators.map((creator) => {
                        // Strict Lock Logic using isPro
                        const isLocked = creator.locked && !isPro;
                        const isSelected = selectedCreator.id === creator.id;
                        
                        return (
                        <button
                            key={creator.id}
                            onClick={() => {
                                // CLICK GUARD
                                if (isLocked) return; 
                                onSelectCreator(creator);
                                if(window.innerWidth < 768) onClose(); 
                            }}
                            className={clsx(
                            "flex items-center transition-all border group relative",
                            isCollapsed ? "w-10 h-10 justify-center rounded-full mx-auto" : "w-full gap-3 p-2 rounded-lg",
                            isSelected
                                ? (isDarkMode ? "bg-white/10 border-white/10" : "bg-white border-slate-200 shadow-sm")
                                : "border-transparent hover:bg-black/5 dark:hover:bg-white/5",
                            // VISUAL FEEDBACK
                            isLocked ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer"
                            )}
                            title={isCollapsed ? creator.name : undefined}
                        >
                            <div className={clsx(
                                "relative overflow-hidden border flex-shrink-0 transition-transform",
                                !isLocked && "group-hover:scale-105",
                                isCollapsed ? "w-8 h-8 rounded-full" : "w-8 h-8 rounded-full",
                                isSelected && !isCollapsed ? "ring-2 ring-offset-1" : ""
                            )}
                            style={{ 
                                borderColor: isSelected ? creator.hex : 'transparent',
                                '--tw-ring-offset-color': isDarkMode ? '#020617' : '#ffffff',
                                '--tw-ring-color': creator.hex
                            } as React.CSSProperties}
                            >
                                <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                                {isLocked && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                     <Lock size={12} className="text-white opacity-80" />
                                </div>
                                )}
                            </div>
                            
                            {!isCollapsed && (
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className={clsx("text-xs font-bold truncate", isSelected ? (isDarkMode ? "text-white" : "text-slate-900") : "opacity-70 group-hover:opacity-100")}>
                                        {creator.name}
                                    </div>
                                    <div className="text-[10px] opacity-50 truncate">{creator.style}</div>
                                </div>
                            )}
                        </button>
                        );
                     })}
                  </>
               )}

               {activeView === 'templates' && filteredTemplates.map((template) => (
                    <button key={template.id} onClick={() => onLoadTemplate(template)} className={clsx("flex items-center transition-all border group relative text-left", isCollapsed ? "w-10 h-10 justify-center rounded-xl mx-auto" : "w-full gap-3 p-3 rounded-lg", isDarkMode ? "hover:bg-white/5 border-transparent hover:border-white/10" : "hover:bg-slate-50 border-transparent hover:border-slate-200")}>
                        {isCollapsed ? <FileText size={18} className="text-indigo-500" /> : (
                            <>
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0"><FileText size={14} className="text-indigo-500" /></div>
                                <div className="flex-1 overflow-hidden">
                                    <div className={clsx("text-xs font-bold truncate", isDarkMode ? "text-slate-200" : "text-slate-800")}>{template.title}</div>
                                    <div className="text-[10px] opacity-50 truncate">{template.description}</div>
                                </div>
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                            </>
                        )}
                    </button>
               ))}

               {activeView === 'history' && filteredHistory.map((item) => (
                    <button key={item.id} onClick={() => onSelectHistory(item)} className={clsx("flex items-center transition-all border group relative text-left", isCollapsed ? "w-10 h-10 justify-center rounded-xl mx-auto" : "w-full gap-3 p-3 rounded-lg", isDarkMode ? "hover:bg-white/5 border-transparent hover:border-white/10" : "hover:bg-slate-50 border-transparent hover:border-slate-200")}>
                        {isCollapsed ? <History size={18} className="opacity-70" /> : (
                            <>
                                <div className="flex-1 overflow-hidden">
                                    <div className={clsx("text-xs font-bold truncate", isDarkMode ? "text-slate-200" : "text-slate-800")}>{item.topic}</div>
                                    <div className="text-[10px] opacity-50 truncate flex items-center gap-1"><span>{new Date(item.createdAt).toLocaleDateString()}</span><span>•</span><span>{item.creatorName}</span></div>
                                </div>
                            </>
                        )}
                    </button>
               ))}
             </div>
          </SidebarSection>
          
          <SidebarSection 
             title="Account" 
             icon={<User size={14} />}
             isExpanded={expandedSections.account} 
             onToggle={() => toggleSection('account')}
             isDarkMode={isDarkMode}
             isCollapsed={isCollapsed}
          >
             <NavItem icon={<Settings size={18} />} label="Settings" onClick={() => { onOpenSettings(); onClose(); }} />
             <NavItem icon={<CreditCard size={18} />} label="Subscription" onClick={() => { onOpenSubscription(); onClose(); }} />
          </SidebarSection>
        </div>

        <div className={clsx("border-t mt-auto relative transition-all", isDarkMode ? "border-white/5 bg-[#020617]" : "border-slate-100 bg-slate-50", isCollapsed ? "p-2" : "p-4")}>
           <button onClick={() => setShowProfileMenu(!showProfileMenu)} className={clsx("w-full flex items-center rounded-xl transition-colors group relative", isCollapsed ? "justify-center p-2" : "gap-3 p-2", isDarkMode ? "hover:bg-white/5" : "hover:bg-white hover:shadow-sm")}>
              <div className={clsx("w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0", isPro ? "bg-gradient-to-r from-yellow-500 to-orange-600" : "bg-gradient-to-r from-blue-500 to-indigo-600")}>
                 {isPro ? 'PRO' : 'FR'}
              </div>
              {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left overflow-hidden">
                        <div className={clsx("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-slate-900")}>User Account</div>
                        <div className="text-[10px] opacity-60 truncate">{isPro ? 'Pro Creator' : 'Starter Plan'}</div>
                    </div>
                    <MoreHorizontal size={16} className="opacity-50" />
                  </>
              )}
           </button>
           {showProfileMenu && (
             <div className={clsx("absolute bottom-full mb-2 rounded-xl shadow-2xl border p-1 z-50 animate-in slide-in-from-bottom-2 fade-in", isCollapsed ? "left-14 w-48" : "left-4 right-4", isDarkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-slate-200")}>
                <button onClick={() => { setShowProfileMenu(false); onOpenSubscription(); }} className={clsx("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium", isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-50 text-slate-700")}><Crown size={14} className="text-yellow-500" /> Upgrade Plan</button>
                <div className="h-px bg-white/5 my-1" />
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10"><LogOut size={14} /> Log Out</button>
             </div>
           )}
        </div>
        
        {!isCollapsed && (
            <div className="hidden md:flex absolute top-0 right-0 w-1 h-full cursor-col-resize items-center justify-center hover:bg-indigo-500/50 transition-colors group z-50" onMouseDown={startResizing}>
                <div className="h-8 w-1 bg-slate-400/20 rounded-full group-hover:bg-indigo-500" />
            </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
