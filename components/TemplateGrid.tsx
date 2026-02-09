import React from 'react';
import { Template, CreatorProfile } from '../types';
import { Play, Clock, Sparkles, FileText, Lock } from 'lucide-react';
import clsx from 'clsx';

interface TemplateGridProps {
  templates: Template[];
  creators: CreatorProfile[];
  onSelect: (template: Template) => void;
  isDarkMode: boolean;
  searchQuery: string;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  creators,
  onSelect,
  isDarkMode,
  searchQuery
}) => {
  const filtered = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 w-full h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className={clsx("text-3xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                Start from a Template
            </h2>
            <p className={clsx("text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                Proven structures used by the world's top creators.
            </p>
        </div>

        {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
                <FileText size={48} className="mb-4" />
                <p>No templates found for "{searchQuery}"</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((template) => {
                    const creator = creators.find(c => c.id === template.creatorId);
                    if (!creator) return null;
                    
                    return (
                        <div 
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className={clsx(
                                "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                                isDarkMode ? "bg-[#1e293b]/50 border border-white/5" : "bg-white border border-slate-200 shadow-lg"
                            )}
                        >
                            {/* Card Header / Banner */}
                            <div 
                                className="h-32 w-full relative overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${creator.hex}80, ${creator.hex}20)` }}
                            >
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden shadow-lg">
                                        <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs font-bold text-white shadow-sm bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                        {creator.name}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white border border-white/10">
                                        {creator.style}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                                <h3 className={clsx("text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors", isDarkMode ? "text-white" : "text-slate-900")}>
                                    {template.title}
                                </h3>
                                <p className={clsx("text-xs line-clamp-2 mb-4 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                    {template.description}
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t dark:border-white/5 border-slate-100">
                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold opacity-60">
                                        <Clock size={12} /> 60s Shorts
                                    </div>
                                    <button className={clsx(
                                        "p-2 rounded-full transition-colors",
                                        isDarkMode ? "bg-white/5 hover:bg-indigo-500 hover:text-white" : "bg-slate-100 hover:bg-indigo-500 hover:text-white"
                                    )}>
                                        <Play size={16} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    Use Template
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGrid;