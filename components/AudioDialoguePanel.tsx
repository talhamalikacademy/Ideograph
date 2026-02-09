import React from 'react';
import { AudioConfig, AudioDialogueData } from '../types';
import { AUDIO_TONES, AUDIO_SPEEDS, AUDIO_STYLES, getLanguageClass } from '../constants';
import { PlayCircle, Mic2, RefreshCw, Settings2, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface AudioDialoguePanelProps {
  data: AudioDialogueData | undefined;
  config: AudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<AudioConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
  hexColor: string;
  language?: string;
}

const AudioDialoguePanel: React.FC<AudioDialoguePanelProps> = ({
  data,
  config,
  setConfig,
  onGenerate,
  isGenerating,
  hexColor,
  language
}) => {
  
  const handleConfigChange = (key: keyof AudioConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  
  // Determine font class
  const fontClass = getLanguageClass(language);

  const renderDialogue = (text: string) => {
    // Basic formatting for visualization
    // Highlight [PAUSE] blocks and *emphasis*
    const parts = text.split(/(\[.*?\]|\*.*?\*|\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={i} className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-1 rounded mx-1 align-middle font-sans">
            {part.replace('[', '').replace(']', '')}
          </span>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <span key={i} className="font-bold underline decoration-wavy decoration-indigo-400 mx-0.5" style={{ color: hexColor }}>
            {part.replace(/\*/g, '')}
          </span>
        );
      }
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <span key={i} className="italic text-slate-400 text-sm mx-1 font-sans">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in duration-300">
      
      {/* Controls Header - Responsive Grid */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#162032]">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest opacity-60">
            <Settings2 size={14} /> Voice Direction Controls
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase opacity-50">Tone</label>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <select 
                        value={config.tone}
                        onChange={(e) => handleConfigChange('tone', e.target.value)}
                        className="w-full bg-transparent text-sm font-medium outline-none dark:text-white"
                    >
                        {AUDIO_TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase opacity-50">Speed</label>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <select 
                        value={config.speed}
                        onChange={(e) => handleConfigChange('speed', e.target.value)}
                        className="w-full bg-transparent text-sm font-medium outline-none dark:text-white"
                    >
                        {AUDIO_SPEEDS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase opacity-50">Delivery Style</label>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <select 
                        value={config.deliveryStyle}
                        onChange={(e) => handleConfigChange('deliveryStyle', e.target.value)}
                        className="w-full bg-transparent text-sm font-medium outline-none dark:text-white"
                    >
                        {AUDIO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* Regenerate Action */}
        <div className="mt-4 flex justify-end">
             <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: hexColor }}
             >
                <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                {data ? "Regenerate Dialogue" : "Generate Audio Dialogue"}
             </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {!data && !isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                  <Mic2 size={48} className="mb-4" />
                  <p className="font-bold">Ready to Voice</p>
                  <p className="text-xs max-w-xs text-center mt-2">Click generate to transform your script into a professional voice-over script.</p>
              </div>
          ) : isGenerating && !data ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <RefreshCw size={48} className="mb-4 animate-spin text-indigo-500" />
                 <p className="font-bold animate-pulse">Optimizing for Speech...</p>
             </div>
          ) : (
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
                        <Volume2 size={16} /> Spoken Output Preview
                    </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                    <p className={clsx("text-lg md:text-xl dark:text-slate-200 text-slate-800 whitespace-pre-wrap", fontClass)}>
                        {data && renderDialogue(data.dialogue)}
                    </p>
                </div>
            </div>
          )}
      </div>

    </div>
  );
};

export default AudioDialoguePanel;