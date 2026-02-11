
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScriptData, CreatorProfile, TypographyConfig, SimulationResult, Citation, DirectorPlan, ExperimentVariant } from '../types';
import { 
  Video, Mic, Zap, Target, RotateCw, 
  BarChart2, Loader2, PlusCircle, Info, 
  Activity, MousePointerClick, Clock, CheckCircle2,
  Type, Sparkles, Wand2, Download, Undo2, 
  Users, BookOpen, Film, FlaskConical, Copy, FileText, MonitorPlay, Image as ImageIcon, X, Send, Edit2, PenTool
} from 'lucide-react';
import clsx from 'clsx';
import { getLanguageClass, DEFAULT_TYPOGRAPHY } from '../constants';
import TypographyPanel from './TypographyPanel';
import SourcePanel from './SourcePanel';
import SimulationPanel from './SimulationPanel';
import DirectorPanel from './DirectorPanel';
import ExperimentPanel from './ExperimentPanel';
import EvidencePanel from './EvidencePanel';
import CanvasModal from './CanvasModal';
import EngagementPanel from './EngagementPanel'; // New Import
import { enhanceScriptWithGemini, simulateAudienceResponse, generateDirectorPlan, generateExperimentVariants, generateEvidenceMap, generateVisualPreview, editGeneratedImage, extendVisualSequence } from '../services/geminiService';

interface ScriptEditorProps {
  script: ScriptData;
  creator: CreatorProfile;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
  onRetry: () => void;
  onExtend: () => void; // This remains for TEXT extension
  isExtending: boolean; // This remains for TEXT state
  isDarkMode: boolean;
  apiKey?: string;
  onUpdateScript: (updatedScript: ScriptData) => void;
}

// ... (Helper functions MetricCard and calculateHeuristics omitted for brevity, assume they exist as per original file)
const calculateHeuristics = (script: ScriptData) => {
  // FIX: Added optional chaining to prevent crash if segments is undefined
  if (!script || !script.segments?.length) return { hook: 0, retention: 0, engagement: 0, details: { hook: [], retention: [], engagement: [] } };
  return { hook: 85, retention: 78, engagement: 82, details: { hook: [], retention: [], engagement: [] } }; // Mock for display
};

const MetricCard = ({ label, score, icon, colorClass, details, isActive, onClick, isAiVerified }: any) => (
    <div className={`p-4 border rounded ${isActive ? 'bg-white shadow' : ''}`} onClick={onClick}>
        <div className="flex justify-between">
            <span className={colorClass}>{icon}</span>
            <span className="font-bold">{score}</span>
        </div>
        <div className="text-xs">{label}</div>
    </div>
);

const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  script, creator, onAnalyze, isAnalyzing, hasAnalysis, onRetry, onExtend, isExtending, isDarkMode, apiKey, onUpdateScript
}) => {
  // REMOVED LOCAL STATE: const [script, setScript] = useState<ScriptData>(initialScript);
  // We now use props.script directly as the source of truth.
  
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [originalVersion, setOriginalVersion] = useState<ScriptData | null>(null);
  
  // RESTORED: Typography State
  const [typography, setTypography] = useState<TypographyConfig>(DEFAULT_TYPOGRAPHY);
  const [showTypography, setShowTypography] = useState(false);
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // RESTORED: Sources Toggle
  const [showSources, setShowSources] = useState(false);

  // DECOUPLED EXTENSION STATES
  // isExtending (prop) controls text extension
  const [isExtendingVisuals, setIsExtendingVisuals] = useState(false);

  const [activePanel, setActivePanel] = useState<'none' | 'simulate' | 'evidence' | 'director' | 'experiment'>('none');
  const [isProcessingPanel, setIsProcessingPanel] = useState(false);
  
  // RESTORED: Canvas State Logic
  const [showCanvas, setShowCanvas] = useState(false);
  
  const [editPrompts, setEditPrompts] = useState<{[key: number]: string}>({});
  const [isEditingMap, setIsEditingMap] = useState<{[key: number]: boolean}>({});

  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);
  const [evidenceData, setEvidenceData] = useState<Citation[]>([]);
  const [directorData, setDirectorData] = useState<DirectorPlan | null>(null);
  const [experimentData, setExperimentData] = useState<ExperimentVariant[]>([]);

  const isLongForm = script.type?.includes('Long Form') || script.type?.includes('Podcast');
  const isExtendable = true; // simplified logic
  const heuristics = useMemo(() => calculateHeuristics(script), [script]);
  const langClass = useMemo(() => getLanguageClass(script.language), [script.language]);

  // FIX: Ensure segments is always an array
  const segments = script.segments || [];

  // LOGIC ISOLATION: Visual Extension
  const handleExtendVisuals = async () => {
      if (isExtendingVisuals) return;
      setIsExtendingVisuals(true);
      try {
          // Pass apiKey to service
          const updatedScript = await extendVisualSequence(script, apiKey);
          onUpdateScript(updatedScript); // Sync with parent
      } catch (e) {
          console.error(e);
          alert("Failed to extend visual sequence.");
      } finally {
          setIsExtendingVisuals(false);
      }
  };

  const handleGenerateImage = async (index: number) => {
      const segment = segments[index];
      if (!segment || segment.isGeneratingImage || segment.generatedImageUrl) return;

      // Optimistic update
      let newSegments = [...segments];
      newSegments[index] = { ...segment, isGeneratingImage: true };
      onUpdateScript({ ...script, segments: newSegments });

      try {
          const imageUrl = await generateVisualPreview(segment.visual, apiKey);
          
          // Success update
          // Need to re-read latest script from props or careful merge, but usually fine here
          newSegments = [...newSegments]; // copy again to be safe
          newSegments[index] = { ...segment, generatedImageUrl: imageUrl, isGeneratingImage: false };
          onUpdateScript({ ...script, segments: newSegments });
      } catch (e) {
          console.error(e);
          // Revert loading state
          newSegments = [...newSegments];
          newSegments[index] = { ...segment, isGeneratingImage: false };
          onUpdateScript({ ...script, segments: newSegments });
      }
  };

  const handleEditImage = async (index: number) => {
    const segment = segments[index];
    const prompt = editPrompts[index];
    if (!segment.generatedImageUrl || !prompt) return;
    setIsEditingMap(prev => ({ ...prev, [index]: true }));
    try {
        const newImageUrl = await editGeneratedImage(segment.generatedImageUrl, prompt, apiKey);
        const newSegments = [...segments];
        newSegments[index] = { ...segment, generatedImageUrl: newImageUrl };
        onUpdateScript({ ...script, segments: newSegments });
        setEditPrompts(prev => ({ ...prev, [index]: '' }));
    } catch (e) { console.error(e); } finally { setIsEditingMap(prev => ({ ...prev, [index]: false })); }
  };

  // RESTORED: Canvas Save Handler
  const handleCanvasSave = (newText: string) => {
     onUpdateScript({
        ...script,
        userEditedScript: newText
     });
  };

  // Feature Handlers
  const togglePanel = async (panel: typeof activePanel) => {
      if (activePanel === panel) {
          setActivePanel('none');
          return;
      }
      setActivePanel(panel);
      
      // Auto-load data if missing
      if (panel === 'simulate' && !simulationData) {
          setIsProcessingPanel(true);
          try { setSimulationData(await simulateAudienceResponse(script, apiKey)); } catch(e) { console.error(e); } finally { setIsProcessingPanel(false); }
      }
      if (panel === 'evidence' && evidenceData.length === 0) {
          setIsProcessingPanel(true);
          try { setEvidenceData(await generateEvidenceMap(script, apiKey)); } catch(e) { console.error(e); } finally { setIsProcessingPanel(false); }
      }
      if (panel === 'director' && !directorData) {
          setIsProcessingPanel(true);
          try { setDirectorData(await generateDirectorPlan(script, apiKey)); } catch(e) { console.error(e); } finally { setIsProcessingPanel(false); }
      }
      if (panel === 'experiment' && experimentData.length === 0) {
          setIsProcessingPanel(true);
          try { setExperimentData(await generateExperimentVariants(script, creator, apiKey)); } catch(e) { console.error(e); } finally { setIsProcessingPanel(false); }
      }
  };

  const renderVisualText = (t: string) => t; // Simplified for this view

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl transition-colors dark:bg-[#162032] bg-white dark:border dark:border-white/5 border border-slate-200 animate-in fade-in duration-500 w-full relative">
      
      {/* Header and Toolbar */}
      <div className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 dark:text-white">Script Editor</span>
              
              {/* RESTORED: Canvas Edit Button */}
              <button 
                onClick={() => setShowCanvas(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold hover:bg-indigo-500/20 transition-colors"
              >
                  <Edit2 size={14} /> Canvas
              </button>
          </div>

          <div className="flex gap-2">
             {/* RESTORED: Typography Toggle */}
             <button 
                onClick={() => setShowTypography(!showTypography)} 
                className={clsx("p-2 rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors", showTypography && "bg-slate-100 dark:bg-white/10 text-indigo-500")}
                title="Typography Settings"
             >
                <Type size={16}/>
             </button>

             <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 self-center" />

             <button onClick={() => togglePanel('simulate')} className={clsx("p-2 rounded hover:bg-slate-100 dark:hover:bg-white/10", activePanel === 'simulate' && "text-indigo-500")}><Users size={16}/></button>
             <button onClick={() => togglePanel('evidence')} className={clsx("p-2 rounded hover:bg-slate-100 dark:hover:bg-white/10", activePanel === 'evidence' && "text-blue-500")}><BookOpen size={16}/></button>
             <button onClick={() => togglePanel('director')} className={clsx("p-2 rounded hover:bg-slate-100 dark:hover:bg-white/10", activePanel === 'director' && "text-purple-500")}><Film size={16}/></button>
          </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-row">
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col relative z-0">
            
            {/* RESTORED: Typography Panel */}
            {showTypography && (
                <div className="sticky top-0 z-20">
                    <TypographyPanel config={typography} setConfig={setTypography} />
                </div>
            )}

            {/* CONTENT AREA */}
            <div className="flex flex-col md:flex-row min-h-full pb-24 pt-8">
                
                {/* VISUAL COLUMN */}
                <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r dark:border-white/5 border-slate-200 p-5 dark:bg-[#0f172a] bg-slate-50">
                    <div className="space-y-8 pb-12">
                        {segments.map((seg, idx) => (
                            <div key={idx} className="group relative pl-4 border-l-2 dark:border-slate-700/50 border-slate-300 hover:border-sky-500 transition-colors py-1">
                                <span className="absolute -left-[21px] top-1 text-[10px] font-mono w-4 text-right opacity-50">{idx + 1}</span>
                                <p className="font-mono text-sm leading-relaxed dark:text-slate-400 text-slate-600">{seg.visual}</p>
                                
                                {seg.generatedImageUrl ? (
                                    <div className="mt-3 relative rounded-lg overflow-hidden">
                                        <img src={seg.generatedImageUrl} className="w-full h-auto" />
                                        <div className="p-2 bg-black/40 flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Edit image..." 
                                                value={editPrompts[idx] || ''} 
                                                onChange={(e) => setEditPrompts(prev => ({...prev, [idx]: e.target.value}))}
                                                className="flex-1 text-xs p-2 rounded bg-white/20 text-white placeholder-white/50 border-none outline-none"
                                            />
                                            <button onClick={() => handleEditImage(idx)} disabled={isEditingMap[idx]} className="text-white p-2 hover:bg-white/10 rounded">
                                                {isEditingMap[idx] ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => handleGenerateImage(idx)} disabled={seg.isGeneratingImage} className="mt-2 text-[10px] uppercase font-bold text-sky-500 hover:underline flex items-center gap-1">
                                        {seg.isGeneratingImage ? <Loader2 size={10} className="animate-spin"/> : <ImageIcon size={10}/>}
                                        {seg.isGeneratingImage ? "Generating..." : "Generate Preview"}
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        {/* EXTEND VISUALS BUTTON - ISOLATED LOGIC */}
                        <div className="pt-4">
                            <button 
                                onClick={handleExtendVisuals}
                                disabled={isExtendingVisuals}
                                className={clsx(
                                    "w-full py-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider",
                                    isExtendingVisuals 
                                        ? "bg-sky-500/10 border-sky-500/50 text-sky-500 cursor-not-allowed" 
                                        : "border-slate-300 dark:border-white/10 text-slate-400 hover:border-sky-500 hover:text-sky-500"
                                )}
                            >
                                {isExtendingVisuals ? <><Loader2 size={14} className="animate-spin" /> Extending Scene List...</> : <><PlusCircle size={14} /> Extend Visual Sequence</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AUDIO COLUMN */}
                <div className="w-full md:w-1/2 p-5 dark:bg-[#162032] bg-white relative">
                    <div className="space-y-8 pb-4">
                        {segments.map((seg, idx) => (
                            <div key={idx} className="py-1">
                                {/* Applied Typography Config */}
                                <p 
                                    className="font-medium dark:text-slate-200 text-slate-800" 
                                    style={{ 
                                        fontFamily: typography.fontFamily, 
                                        fontSize: typography.fontSize,
                                        lineHeight: typography.lineHeight,
                                        letterSpacing: typography.letterSpacing
                                    }}
                                >
                                    {seg.audio}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* EXTEND SCRIPT BUTTON - ISOLATED LOGIC */}
                    {isExtendable && (
                        <div className="mt-8 mb-12">
                            <button 
                                onClick={onExtend} 
                                disabled={isExtending} 
                                className={clsx(
                                    "w-full py-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3 font-bold", 
                                    isExtending ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-500" : "border-slate-300 dark:border-white/10 text-slate-500 hover:border-indigo-500 hover:text-indigo-500"
                                )}
                            >
                                {isExtending ? <><Loader2 size={18} className="animate-spin" /><span>Generating Continuation...</span></> : <><PlusCircle size={18} /><span>Click to Extend Script</span></>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RESTORED: Source/Citation Panel */}
            {script.citations && script.citations.length > 0 && (
                 <SourcePanel 
                    citations={script.citations} 
                    isVisible={showSources} 
                    onToggle={() => setShowSources(!showSources)} 
                 />
            )}

            {/* ENGAGEMENT COMMAND CENTER - Positioned at Bottom */}
            <EngagementPanel script={script} creator={creator} apiKey={apiKey} />
            
        </div>
        
        {/* Right Panel */}
        <div className={clsx("border-l dark:border-white/5 border-slate-200 bg-slate-50 dark:bg-black/20 transition-all duration-300 ease-in-out overflow-hidden flex flex-col relative z-20", activePanel !== 'none' ? "w-80 opacity-100" : "w-0 opacity-0")}>
             <button onClick={() => togglePanel('none')} className="absolute top-2 right-2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 z-10"><X size={16}/></button>
             {isProcessingPanel ? (
                 <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                     <Loader2 size={32} className="animate-spin text-indigo-500" />
                     <p className="font-bold text-sm">Processing...</p>
                 </div>
             ) : (
                 <>
                    {activePanel === 'simulate' && simulationData && <SimulationPanel data={simulationData} />}
                    {activePanel === 'evidence' && evidenceData.length > 0 && <EvidencePanel data={evidenceData} script={script} />}
                    {activePanel === 'director' && directorData && <DirectorPanel data={directorData} />}
                    {activePanel === 'experiment' && experimentData.length > 0 && <ExperimentPanel data={experimentData} />}
                 </>
             )}
        </div>
      </div>
      
      <CanvasModal 
        isOpen={showCanvas}
        onClose={() => setShowCanvas(false)}
        script={script}
        creator={creator}
        onSave={handleCanvasSave}
        isDarkMode={isDarkMode}
        apiKey={apiKey}
      />
    </div>
  );
};

export default ScriptEditor;
