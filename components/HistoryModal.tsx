import React from 'react';
import { X, Calendar, User, Trash2, ArrowRight, Zap, PlayCircle } from 'lucide-react';
import { SavedScript } from '../types';
import clsx from 'clsx';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedScript[];
  onSelectScript: (script: SavedScript) => void;
  onDeleteScript: (id: string) => void;
  isDarkMode: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectScript,
  onDeleteScript,
  isDarkMode
}) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className={clsx(
        "relative w-full max-w-md h-full shadow-2xl transition-transform transform translate-x-0 flex flex-col",
        isDarkMode ? "bg-[#0f172a] border-l border-white/10" : "bg-white border-l border-slate-200"
      )}>
        {/* Header */}
        <div className={clsx(
          "p-6 border-b flex items-center justify-between",
          isDarkMode ? "border-white/10" : "border-slate-100"
        )}>
          <div>
             <h2 className={clsx("text-xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>Script History</h2>
             <p className="text-xs opacity-60">Local Memory • {history.length} Saved</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X size={20} className={isDarkMode ? "text-white" : "text-slate-900"} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                <PlayCircle size={48} className="mb-4" />
                <p>No scripts found in memory.</p>
                <p className="text-xs mt-2">Generate a script to start your journey.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className={clsx(
                  "group p-4 rounded-xl border transition-all cursor-pointer relative",
                  isDarkMode 
                    ? "bg-[#1e293b]/50 border-white/5 hover:bg-[#1e293b] hover:border-indigo-500/50" 
                    : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                )}
                onClick={() => onSelectScript(item)}
              >
                <div className="flex justify-between items-start mb-2">
                    <span className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                        item.analysis && item.analysis.hookScore > 80 
                            ? "bg-green-500/20 text-green-500" 
                            : !item.analysis 
                                ? "bg-amber-500/20 text-amber-500"
                                : "bg-slate-500/20 text-slate-500"
                    )}>
                        {item.analysis ? (item.analysis.hookScore > 80 ? 'High Performing' : 'Analyzed') : 'Needs Boost'}
                    </span>
                    <span className="text-[10px] opacity-50 font-mono">{formatDate(item.createdAt)}</span>
                </div>

                <h3 className={clsx("font-bold mb-1 line-clamp-1", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                    {item.topic}
                </h3>
                
                <p className={clsx("text-xs line-clamp-2 mb-3 font-mono", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    {item.segments[0]?.audio || "No content..."}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-white/5">
                    <div className="flex items-center gap-2 text-xs opacity-60">
                        <User size={12} /> {item.creatorName}
                    </div>
                     <div className="flex items-center gap-2">
                        <button 
                            className="p-2 hover:text-red-400 transition-colors z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteScript(item.id);
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                        <span className="flex items-center gap-1 text-xs font-bold text-indigo-500 group-hover:underline">
                            Open <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;