import React from 'react';
import { X, Moon, Sun, Key, MessageSquare, Crown } from 'lucide-react';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  isPro: boolean;
  onTogglePro: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  apiKey,
  onApiKeyChange,
  customPrompt,
  onCustomPromptChange,
  isPro,
  onTogglePro
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={clsx(
        "w-full max-w-lg rounded-3xl shadow-2xl p-6 transition-all border",
        isDarkMode ? "bg-[#0f172a] text-white border-white/10" : "bg-white text-slate-900 border-slate-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Pro Simulation */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <Crown size={14} className="text-yellow-500" /> Subscription Status
            </label>
            <div 
              onClick={onTogglePro}
              className={clsx(
                "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors border",
                isDarkMode ? "bg-black/20 border-white/5 hover:bg-black/30" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                 <div className={clsx("p-2 rounded-full", isPro ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : "bg-slate-500/20 text-slate-500")}>
                    <Crown size={18} fill={isPro ? "currentColor" : "none"} />
                 </div>
                 <div>
                    <div className="font-bold text-sm">{isPro ? 'Pro Active' : 'Free Tier'}</div>
                    <div className="text-xs opacity-60">Simulate subscription state</div>
                 </div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full p-1 transition-colors relative",
                isPro ? "bg-emerald-500" : "bg-slate-500/50"
              )}>
                <div className={clsx(
                  "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                  isPro ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
          </div>

          <div className="h-px bg-current opacity-10 my-4" />

          {/* Appearance */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Appearance</label>
            <div 
              onClick={onToggleTheme}
              className={clsx(
                "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors border",
                isDarkMode ? "bg-black/20 border-white/5 hover:bg-black/30" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
                <span className="font-medium text-sm">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full p-1 transition-colors relative",
                isDarkMode ? "bg-indigo-600" : "bg-slate-300"
              )}>
                <div className={clsx(
                  "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                  isDarkMode ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
              <Key size={14} /> Gemini API Configuration
            </label>
            <input 
              type="password" 
              placeholder="Paste Google Gemini API Key" 
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              className={clsx(
                "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm",
                isDarkMode 
                  ? "bg-black/20 border-white/10 placeholder-slate-500" 
                  : "bg-white border-slate-200 placeholder-slate-400"
              )}
            />
          </div>

          {/* Custom Persona */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
              <MessageSquare size={14} /> Customize Persona
            </label>
            <textarea 
              rows={3}
              placeholder="Override the system instructions for the selected creator..."
              value={customPrompt}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              className={clsx(
                "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm",
                isDarkMode 
                  ? "bg-black/20 border-white/10 placeholder-slate-500" 
                  : "bg-white border-slate-200 placeholder-slate-400"
              )}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;