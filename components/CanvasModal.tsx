
import React, { useState, useEffect, useRef } from 'react';
import { ScriptData, CreatorProfile, CanvasHistoryState } from '../types';
import { 
    X, Save, SpellCheck, Check, AlertCircle, Loader2, Undo2, Copy, 
    Wand2, Palette, MessageSquare, Minimize2, Mic, ArrowRight,
    Play, ChevronDown, RotateCcw, RotateCw, History
} from 'lucide-react';
import clsx from 'clsx';
import { runGrammarCheck } from '../services/geminiService';
import { changeScriptTone, changeScriptStyle, summarizeScript, extendScriptWithQuestions } from '../services/canvasService';
import { CREATORS, AUDIO_TONES } from '../constants';

interface CanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: ScriptData;
  creator: CreatorProfile;
  onSave: (newText: string) => void;
  apiKey?: string;
  isDarkMode: boolean;
}

type ToolMode = 'none' | 'tone' | 'style' | 'summary';

const CanvasModal: React.FC<CanvasModalProps> = ({
  isOpen,
  onClose,
  script,
  creator,
  onSave,
  apiKey,
  isDarkMode
}) => {
  // History State for Undo/Redo
  const [history, setHistory] = useState<CanvasHistoryState>({
      past: [],
      present: '',
      future: []
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [grammarChecked, setGrammarChecked] = useState(false);
  
  // Tool State
  const [activeTool, setActiveTool] = useState<ToolMode>('none');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize content on open
  useEffect(() => {
    if (isOpen) {
      let initialContent = '';
      if (script.userEditedScript) {
        initialContent = script.userEditedScript;
      } else {
        initialContent = script.segments.map(seg => {
          return `[VISUAL] ${seg.visual}\n(AUDIO) ${seg.audio}\n`;
        }).join('\n');
      }
      setHistory({
          past: [],
          present: initialContent,
          future: []
      });
      setGrammarChecked(false);
      setPreviewContent(null);
      setActiveTool('none');
    }
  }, [isOpen, script]);

  // History Helper: Update present state
  const updateContent = (newContent: string) => {
      setHistory(prev => ({
          past: [...prev.past, prev.present],
          present: newContent,
          future: []
      }));
      setGrammarChecked(false);
  };

  const handleUndo = () => {
      if (history.past.length === 0) return;
      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, history.past.length - 1);
      setHistory({
          past: newPast,
          present: previous,
          future: [history.present, ...history.future]
      });
  };

  const handleRedo = () => {
      if (history.future.length === 0) return;
      const next = history.future[0];
      const newFuture = history.future.slice(1);
      setHistory({
          past: [...history.past, history.present],
          present: next,
          future: newFuture
      });
  };

  const handleSave = () => {
    onSave(history.present);
    onClose();
  };

  const handleGrammarCheck = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
        const fixedText = await runGrammarCheck(history.present, creator.name, apiKey);
        setPreviewContent(fixedText); // Use preview flow for safety
    } catch (e) {
        console.error("Grammar check failed", e);
        alert("AI Check failed. Please try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleApplyPreview = () => {
      if (previewContent) {
          updateContent(previewContent);
          setPreviewContent(null);
          setActiveTool('none');
      }
  };

  const handleDiscardPreview = () => {
      setPreviewContent(null);
  };

  // --- TOOL HANDLERS ---

  const handleToneChange = async (tone: string) => {
      setIsProcessing(true);
      try {
          const res = await changeScriptTone(history.present, tone, apiKey);
          setPreviewContent(res);
      } catch (e) { console.error(e); alert("Failed to change tone."); } 
      finally { setIsProcessing(false); }
  };

  const handleStyleChange = async (creatorId: string) => {
      const selectedCreator = CREATORS.find(c => c.id === creatorId);
      if (!selectedCreator) return;
      setIsProcessing(true);
      try {
          const res = await changeScriptStyle(history.present, selectedCreator, apiKey);
          setPreviewContent(res);
      } catch (e) { console.error(e); alert("Failed to change style."); }
      finally { setIsProcessing(false); }
  };

  const handleSummarize = async (len: 'Short' | 'Medium' | 'Detailed') => {
      setIsProcessing(true);
      try {
          const res = await summarizeScript(history.present, len, apiKey);
          setPreviewContent(res);
      } catch (e) { console.error(e); alert("Failed to summarize."); }
      finally { setIsProcessing(false); }
  };

  const handleExtendQuestions = async () => {
      setIsProcessing(true);
      try {
          const res = await extendScriptWithQuestions(history.present, apiKey);
          setPreviewContent(res);
      } catch (e) { console.error(e); alert("Failed to extend script."); }
      finally { setIsProcessing(false); }
  };

  if (!isOpen) return null;

  const displayContent = previewContent || history.present;
  const isPreviewing = !!previewContent;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0f172a] animate-in fade-in duration-300 flex flex-col">
      
      {/* 1. PRIMARY TOOLBAR */}
      <div className="h-16 border-b dark:border-white/10 border-slate-200 flex items-center justify-between px-6 bg-white dark:bg-[#0f172a] relative z-20 shadow-sm">
         <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                 <X size={20} className="dark:text-white text-slate-900" />
             </button>
             <div>
                 <h2 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                     Canvas Mode
                     {isPreviewing && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded animate-pulse">PREVIEWING AI CHANGES</span>}
                 </h2>
                 <p className="text-xs opacity-60 dark:text-slate-300 text-slate-600">
                     {isPreviewing ? "Review changes before applying" : `Editing as ${creator.name}`}
                 </p>
             </div>
         </div>

         <div className="flex items-center gap-2">
             {/* History Controls */}
             <div className="flex items-center gap-1 mr-4 border-r dark:border-white/10 border-slate-200 pr-4">
                 <button onClick={handleUndo} disabled={history.past.length === 0 || isPreviewing} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"><RotateCcw size={18} /></button>
                 <button onClick={handleRedo} disabled={history.future.length === 0 || isPreviewing} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"><RotateCw size={18} /></button>
             </div>

             <button 
                onClick={() => setActiveTool(activeTool === 'tone' ? 'none' : 'tone')}
                disabled={isPreviewing}
                className={clsx("p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold", activeTool === 'tone' ? "bg-indigo-500/10 text-indigo-500" : "hover:bg-black/5 dark:hover:bg-white/10")}
             >
                 <Mic size={16} /> Tone
             </button>
             <button 
                onClick={() => setActiveTool(activeTool === 'style' ? 'none' : 'style')}
                disabled={isPreviewing}
                className={clsx("p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold", activeTool === 'style' ? "bg-purple-500/10 text-purple-500" : "hover:bg-black/5 dark:hover:bg-white/10")}
             >
                 <Palette size={16} /> Style
             </button>
             <button 
                onClick={() => setActiveTool(activeTool === 'summary' ? 'none' : 'summary')}
                disabled={isPreviewing}
                className={clsx("p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold", activeTool === 'summary' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-black/5 dark:hover:bg-white/10")}
             >
                 <Minimize2 size={16} /> Summary
             </button>
             
             <button 
                onClick={handleExtendQuestions}
                disabled={isPreviewing}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold"
                title="Add Reflective Questions"
             >
                 <MessageSquare size={16} /> Questions
             </button>

             <button 
                onClick={handleGrammarCheck}
                disabled={isProcessing || isPreviewing}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold"
             >
                 <SpellCheck size={16} /> Grammar
             </button>

             <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2" />

             <button 
                onClick={handleSave}
                disabled={isPreviewing}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 <Save size={16} /> Save
             </button>
         </div>
      </div>

      {/* 2. SECONDARY TOOLBAR (DYNAMIC) */}
      {activeTool !== 'none' && !isPreviewing && (
          <div className="bg-slate-50 dark:bg-[#162032] border-b dark:border-white/5 border-slate-200 p-2 flex items-center justify-center animate-in slide-in-from-top-2 z-10">
              
              {activeTool === 'tone' && (
                  <div className="flex gap-2 items-center">
                      <span className="text-[10px] uppercase font-bold opacity-50 mr-2">Select Target Tone:</span>
                      {AUDIO_TONES.slice(0, 5).map(tone => (
                          <button key={tone} onClick={() => handleToneChange(tone)} className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-xs font-medium transition-colors">
                              {tone}
                          </button>
                      ))}
                  </div>
              )}

              {activeTool === 'style' && (
                  <div className="flex gap-2 items-center overflow-x-auto max-w-3xl scrollbar-hide">
                      <span className="text-[10px] uppercase font-bold opacity-50 mr-2 shrink-0">Rewrite as:</span>
                      {CREATORS.slice(0, 6).map(c => (
                          <button key={c.id} onClick={() => handleStyleChange(c.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500 text-xs font-medium transition-colors shrink-0">
                              <img src={c.avatarUrl} className="w-4 h-4 rounded-full" /> {c.name}
                          </button>
                      ))}
                  </div>
              )}

              {activeTool === 'summary' && (
                  <div className="flex gap-2 items-center">
                      <span className="text-[10px] uppercase font-bold opacity-50 mr-2">Target Length:</span>
                      <button onClick={() => handleSummarize('Short')} className="px-4 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-xs font-medium">Short (Hook Only)</button>
                      <button onClick={() => handleSummarize('Medium')} className="px-4 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-xs font-medium">Balanced</button>
                      <button onClick={() => handleSummarize('Detailed')} className="px-4 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-xs font-medium">Detailed</button>
                  </div>
              )}
          </div>
      )}

      {/* 3. PREVIEW BAR OVERLAY */}
      {isPreviewing && (
          <div className="bg-amber-500 text-white p-3 flex items-center justify-between px-8 animate-in slide-in-from-top-full z-30 shadow-lg">
              <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-full animate-pulse"><Wand2 size={16} /></div>
                  <span className="font-bold text-sm">AI Preview Active</span>
                  <span className="text-xs opacity-80 border-l border-white/20 pl-3">Review the changes below. Original content is safe.</span>
              </div>
              <div className="flex gap-3">
                  <button onClick={handleDiscardPreview} className="px-4 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-xs font-bold transition-colors">Discard</button>
                  <button onClick={handleApplyPreview} className="px-6 py-1.5 rounded-lg bg-white text-amber-600 hover:bg-amber-50 text-xs font-bold transition-colors shadow-sm flex items-center gap-2"><Check size={14} /> Apply Changes</button>
              </div>
          </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative flex">
          <div className="flex-1 h-full overflow-y-auto relative bg-slate-50 dark:bg-[#020617] flex justify-center">
              <div className={clsx(
                  "w-full max-w-4xl min-h-full shadow-xl p-8 md:p-12 relative transition-all duration-500",
                  isPreviewing ? "bg-amber-50 dark:bg-amber-900/10" : "bg-white dark:bg-[#1e293b]"
              )}>
                  
                  {isProcessing && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center cursor-wait">
                          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border dark:border-white/10">
                              <Loader2 size={32} className="animate-spin text-indigo-500" />
                              <div className="text-center">
                                  <div className="font-bold text-sm dark:text-white">AI Processing...</div>
                                  <div className="text-xs opacity-50">Using Gemini 1.5 Pro Reasoning</div>
                              </div>
                          </div>
                      </div>
                  )}

                  <textarea
                    ref={textAreaRef}
                    value={displayContent}
                    onChange={(e) => {
                        if (!isPreviewing) {
                            updateContent(e.target.value);
                        }
                    }}
                    readOnly={isPreviewing}
                    className={clsx(
                        "w-full h-full min-h-[80vh] bg-transparent border-none resize-none focus:ring-0 outline-none text-lg leading-relaxed font-mono",
                        isDarkMode ? "text-slate-200 placeholder-slate-600" : "text-black placeholder-slate-300", // Changed from text-slate-800 to text-black
                        isPreviewing && "opacity-80"
                    )}
                    placeholder="Start typing or load script..."
                    spellCheck={false}
                  />
              </div>
          </div>
      </div>

      {/* Footer Info */}
      <div className="h-8 bg-white dark:bg-[#0f172a] border-t dark:border-white/10 border-slate-200 flex items-center justify-between px-6 text-[10px] uppercase tracking-widest opacity-50">
           <div className="flex gap-4">
               <span>Chars: {displayContent.length}</span>
               {history.past.length > 0 && <span>Undo Steps: {history.past.length}</span>}
           </div>
           <span>Canvas Mode Active</span>
      </div>

    </div>
  );
};

export default CanvasModal;
