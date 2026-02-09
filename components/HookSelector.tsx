
import React, { useState } from 'react';
import { HookOption } from '../types';
import { 
  Sparkles, Flame, Puzzle, Heart, 
  ArrowRight, CheckCircle2, Video, Mic,
  BarChart2
} from 'lucide-react';
import clsx from 'clsx';
import { getLanguageClass } from '../constants';

interface HookSelectorProps {
  hooks: HookOption[];
  onSelect: (hook: HookOption) => void;
  onCancel: () => void;
  language?: string;
}

const HookSelector: React.FC<HookSelectorProps> = ({ hooks, onSelect, onCancel, language }) => {
  const [hoveredHookId, setHoveredHookId] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Mystery': return <Puzzle size={18} className="text-purple-500" />;
      case 'Controversy': return <Flame size={18} className="text-red-500" />;
      case 'Relatable Story': return <Heart size={18} className="text-pink-500" />;
      default: return <Sparkles size={18} className="text-indigo-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Mystery': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-500/30';
      case 'Controversy': return 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-500/30';
      case 'Relatable Story': return 'border-pink-200 bg-pink-50 dark:bg-pink-900/10 dark:border-pink-500/30';
      default: return 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-500/30';
    }
  };

  const langClass = getLanguageClass(language);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 dark:text-white text-slate-900">
          Choose Your Hook
        </h2>
        <p className="text-lg opacity-60 max-w-2xl mx-auto">
          We generated 3 competing openings. Select the one that best grabs attention for this topic.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hooks.map((hook, index) => (
          <div 
            key={index}
            className={clsx(
              "relative rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col cursor-pointer group",
              getTypeColor(hook.type),
              hoveredHookId === hook.id ? "scale-[1.02] shadow-2xl ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900" : "hover:shadow-xl"
            )}
            onMouseEnter={() => setHoveredHookId(hook.id)}
            onMouseLeave={() => setHoveredHookId(null)}
            onClick={() => onSelect(hook)}
          >
            {/* Score Badge */}
            <div className="absolute -top-3 right-6 bg-white dark:bg-slate-800 shadow-lg rounded-full px-3 py-1 flex items-center gap-1.5 border dark:border-white/10">
                <BarChart2 size={14} className={hook.score > 85 ? "text-green-500" : "text-amber-500"} />
                <span className="font-bold text-sm dark:text-white">{hook.score}%</span>
                <span className="text-[10px] opacity-50 uppercase tracking-wide">Retention</span>
            </div>

            {/* Type Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                    {getTypeIcon(hook.type)}
                </div>
                <div className="font-bold text-lg dark:text-white">{hook.type}</div>
            </div>

            {/* Content Body */}
            <div className="flex-1 space-y-6">
                {/* Visual */}
                <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                        <Video size={12} /> Visual
                    </div>
                    <p className="text-sm font-mono dark:text-slate-300 text-slate-600 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-transparent group-hover:border-indigo-500/20 transition-colors">
                        {hook.visual}
                    </p>
                </div>

                {/* Audio */}
                <div className="space-y-2">
                     <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                        <Mic size={12} /> Audio
                    </div>
                    <p className={clsx("text-base font-medium leading-relaxed dark:text-white text-slate-800", langClass)}>
                        "{hook.audio}"
                    </p>
                </div>
            </div>

            {/* Footer / Reasoning */}
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                <div className="flex items-start gap-2 mb-4">
                    <Sparkles size={14} className="mt-0.5 opacity-50 text-indigo-500" />
                    <p className="text-xs opacity-70 italic leading-relaxed">
                        {hook.reasoning}
                    </p>
                </div>
                
                <button className={clsx(
                    "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors",
                    hoveredHookId === hook.id 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : "bg-white dark:bg-white/10 text-slate-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-white/20"
                )}>
                    Select This Hook <ArrowRight size={16} />
                </button>
            </div>
            
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
          <button 
            onClick={onCancel}
            className="text-sm font-bold opacity-50 hover:opacity-100 hover:underline transition-opacity"
          >
              Cancel and go back
          </button>
      </div>

    </div>
  );
};

export default HookSelector;
