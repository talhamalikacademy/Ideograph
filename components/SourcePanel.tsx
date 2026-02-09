import React, { useState } from 'react';
import { Citation } from '../types';
import { BookOpen, FileText, Globe, Database, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface SourcePanelProps {
  citations: Citation[];
  isVisible: boolean;
  onToggle: () => void;
}

const SourcePanel: React.FC<SourcePanelProps> = ({ citations, isVisible, onToggle }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={clsx(
      "border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f172a] transition-all duration-300 overflow-hidden",
      isVisible ? "h-auto max-h-96" : "h-12"
    )}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
           <BookOpen size={16} className="text-indigo-500" />
           Data Sources & Citations
           <span className="bg-indigo-500/10 text-indigo-500 text-[10px] px-2 py-0.5 rounded-full">
              {citations.length} Verified
           </span>
        </div>
        {isVisible ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="px-6 pb-6 overflow-y-auto max-h-80">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {citations.map((cite) => (
                 <div key={cite.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:border-indigo-500/30 transition-colors">
                     <div className="flex items-start gap-3">
                         <div className={clsx(
                             "p-2 rounded-lg shrink-0",
                             cite.type === 'News' ? "bg-blue-500/10 text-blue-500" :
                             cite.type === 'Research' ? "bg-purple-500/10 text-purple-500" :
                             cite.type === 'Report' ? "bg-emerald-500/10 text-emerald-500" :
                             "bg-amber-500/10 text-amber-500"
                         )}>
                             {cite.type === 'News' && <Globe size={14} />}
                             {cite.type === 'Research' && <FileText size={14} />}
                             {cite.type === 'Report' && <CheckCircle2 size={14} />}
                             {cite.type === 'Public Data' && <Database size={14} />}
                         </div>
                         <div>
                             <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">{cite.type}</h4>
                             <div className="font-bold text-sm mb-1 dark:text-slate-200 text-slate-800">{cite.sourceName}</div>
                             <p className="text-xs opacity-70 leading-relaxed italic">"{cite.context}"</p>
                             {cite.url && (
                                 <a href={cite.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 hover:underline mt-1 block">
                                     View Source
                                 </a>
                             )}
                         </div>
                     </div>
                 </div>
             ))}
         </div>
         <div className="mt-4 text-center">
             <p className="text-[10px] opacity-40">AI-generated citations based on knowledge base. Verify critical data before publishing.</p>
         </div>
      </div>
    </div>
  );
};

export default SourcePanel;