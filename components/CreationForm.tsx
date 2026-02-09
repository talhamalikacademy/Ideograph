
import React, { useRef, useState, useEffect } from 'react';
import { CreatorProfile, GeneratorConfig, UserPlan, TopicSuggestion, ReferenceImage, WritingMode } from '../types';
import { LANGUAGES, DURATIONS, PLATFORMS, CREATORS, getLanguageClass, ARABIC_DIALECTS, WRITING_CATEGORIES } from '../constants';
import { Loader2, Upload, FileText, Wand2, User, ChevronDown, Check, Languages, DollarSign, Sparkles, BrainCircuit, Lightbulb, Image as ImageIcon, X, Zap, Target, LayoutTemplate, Clock, Layers, Compass, Combine } from 'lucide-react';
import clsx from 'clsx';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { analyzeTopicWithGemini } from '../services/geminiService';

// Initialize PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface CreationFormProps {
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
  creator: CreatorProfile; 
  isDarkMode: boolean;
  userPlan: UserPlan;
}

const CreationForm: React.FC<CreationFormProps> = ({
  config,
  setConfig,
  onGenerate,
  isGenerating,
  creator, 
  isDarkMode,
  userPlan
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  
  // Smart Input State
  const [isAnalyzingTopic, setIsAnalyzingTopic] = useState(false);
  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestion[]>([]);
  const [hasShownSuggestions, setHasShownSuggestions] = useState(false);
  
  const isScriptMode = config.topicOrScript.length > 200;

  // Sync internal config with CREATORS lookup
  const currentCreator = CREATORS.find(c => c.id === config.selectedStyleId) || CREATORS[0];

  const updateConfig = (key: keyof GeneratorConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    // Reset suggestions if topic changes significantly
    if (key === 'topicOrScript' && hasShownSuggestions) {
       setTopicSuggestions([]);
       setHasShownSuggestions(false);
    }
  };

  const handleSmartAnalyze = async () => {
    if (!config.topicOrScript || config.topicOrScript.length < 5) return;
    setIsAnalyzingTopic(true);
    try {
        const suggestions = await analyzeTopicWithGemini(config.topicOrScript, config.platform);
        setTopicSuggestions(suggestions);
        setHasShownSuggestions(true);
    } catch (e) {
        console.error("Smart Analysis Failed", e);
    } finally {
        setIsAnalyzingTopic(false);
    }
  };

  const applySuggestion = (suggestion: TopicSuggestion) => {
      updateConfig('topicOrScript', suggestion.refinedTopic);
      setTopicSuggestions([]); // Clear after selection
  };

  const handleSponsorChange = (key: string, value: string | boolean) => {
    setConfig(prev => ({
        ...prev,
        sponsorInfo: {
            ...prev.sponsorInfo,
            enabled: prev.sponsorInfo?.enabled ?? false,
            name: prev.sponsorInfo?.name ?? '',
            product: prev.sponsorInfo?.product ?? '',
            message: prev.sponsorInfo?.message ?? '',
            [key]: value
        }
    }));
  };

  const toggleSecondaryCreator = (creatorId: string) => {
      const current = config.blendConfig.secondaryCreatorIds;
      const isSelected = current.includes(creatorId);
      let newSelection = [];
      
      if (isSelected) {
          newSelection = current.filter(id => id !== creatorId);
      } else {
          if (current.length >= 3) return; // Max 3
          newSelection = [...current, creatorId];
      }
      
      setConfig(prev => ({
          ...prev,
          blendConfig: {
              ...prev.blendConfig,
              secondaryCreatorIds: newSelection
          }
      }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    let extractedText = "";

    try {
        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                extractedText += pageText + "\n\n";
            }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
        } else if (file.type === 'text/plain') {
            extractedText = await file.text();
        } else {
            alert("Unsupported format. Please upload PDF, DOCX, or TXT.");
            return;
        }

        if (extractedText.trim()) {
            updateConfig('topicOrScript', extractedText);
            updateConfig('duration', 'Match Original Length');
            updateConfig('transformationType', 'Full Rewrite');
        } else {
            alert("Could not extract readable text.");
        }
    } catch (error) {
        console.error(error);
        alert("Error reading file.");
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Image Handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      
      const newImages: ReferenceImage[] = [];
      const MAX_IMAGES = 4;
      const currentCount = config.referenceImages?.length || 0;
      const remainingSlots = MAX_IMAGES - currentCount;

      if (remainingSlots <= 0) {
          alert("Maximum 4 reference images allowed.");
          return;
      }

      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
          const file = files[i];
          if (!file.type.startsWith('image/')) continue;
          
          try {
              const base64String = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
              });

              const rawBase64 = base64String.split(',')[1];

              newImages.push({
                  id: crypto.randomUUID(),
                  data: rawBase64,
                  mimeType: file.type,
                  previewUrl: URL.createObjectURL(file)
              });
          } catch (e) {
              console.error("Failed to process image", e);
          }
      }

      updateConfig('referenceImages', [...(config.referenceImages || []), ...newImages]);
      if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
      updateConfig('referenceImages', (config.referenceImages || []).filter(img => img.id !== id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* 1. Header Section - Massive & Animated */}
      <div className="text-center mb-12 relative z-10">
        <h2 className={clsx(
            "text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r animate-gradient",
            isDarkMode ? "from-white via-indigo-300 to-white" : "from-slate-900 via-indigo-600 to-slate-900"
        )} style={{ backgroundSize: '200% auto' }}>
          What Do You Want to Create?
        </h2>
        <p className={clsx(
            "text-xl md:text-2xl font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 delay-200 duration-1000",
            isDarkMode ? "text-slate-400" : "text-slate-600"
        )}>
           {config.writingMode === 'auto' ? (
               <span className="inline-flex items-center gap-2 text-indigo-500 font-bold">
                   <Sparkles className="animate-pulse" size={24} /> 
                   Auto-Matching Intelligence Active
               </span>
           ) : config.writingMode === 'blend' ? (
               <span className="inline-flex items-center gap-2 text-purple-500 font-bold">
                   <Combine className="animate-pulse" size={24} /> 
                   Creator Blend Studio Active
               </span>
           ) : (
               "Define your vision. We'll handle the virality."
           )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 2. Main Input Canvas (Left - Wide) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className={clsx(
                "relative rounded-[2.5rem] p-1 shadow-2xl transition-all duration-500 group hover:shadow-indigo-500/10",
                config.writingMode === 'auto' ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600" : 
                config.writingMode === 'blend' ? "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500" :
                (isDarkMode ? "bg-gradient-to-br from-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-200 to-slate-300")
            )}>
                <div className={clsx(
                    "rounded-[2.2rem] overflow-hidden flex flex-col h-[650px] transition-colors relative",
                    isDarkMode ? "bg-[#0f172a]" : "bg-white"
                )}>
                    
                    {/* Floating Toolbar */}
                    <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                         {config.topicOrScript.length > 10 && !isScriptMode && (
                             <button
                                 onClick={handleSmartAnalyze}
                                 disabled={isAnalyzingTopic}
                                 className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 hover:scale-105 transition-all shadow-sm backdrop-blur-sm"
                             >
                                 {isAnalyzingTopic ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
                                 AI Refine
                             </button>
                         )}
                         <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20 hover:scale-105 transition-all shadow-sm backdrop-blur-sm"
                         >
                             {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                             Import
                         </button>
                         <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                    </div>

                    {/* Main Text Area */}
                    <textarea
                        value={config.topicOrScript}
                        onChange={(e) => updateConfig('topicOrScript', e.target.value)}
                        placeholder="Type a topic, paste a rough draft, or dump your raw ideas here..."
                        className={clsx(
                            "w-full h-full p-8 md:p-10 bg-transparent border-none resize-none focus:ring-0 placeholder-opacity-40 leading-relaxed outline-none",
                            isDarkMode ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400",
                            "text-xl md:text-2xl font-medium", // Massive text size
                            getLanguageClass(config.language)
                        )}
                        dir="auto"
                    />

                    {/* Bottom Floating Bar */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                        <div className="flex gap-4 pointer-events-auto">
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                className={clsx(
                                    "px-5 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 backdrop-blur-md border",
                                    (config.referenceImages?.length || 0) > 0 
                                        ? "bg-indigo-600 text-white border-indigo-500" 
                                        : (isDarkMode ? "bg-slate-800/80 border-white/10 text-slate-300 hover:bg-slate-700" : "bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50")
                                )}
                            >
                                <ImageIcon size={20} />
                                <span className="font-bold text-sm">Add Visual Context</span>
                                {(config.referenceImages?.length || 0) > 0 && (
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">{config.referenceImages?.length}</span>
                                )}
                            </button>
                            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                        </div>
                        
                        <div className="pointer-events-auto">
                            <span className={clsx(
                                "text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border backdrop-blur-md",
                                isDarkMode ? "bg-black/40 border-white/10 text-slate-400" : "bg-white/60 border-slate-200 text-slate-500"
                            )}>
                                {config.topicOrScript.length} chars
                            </span>
                        </div>
                    </div>

                    {/* Suggestions Overlay */}
                    {topicSuggestions.length > 0 && (
                        <div className="absolute bottom-24 left-6 right-6 flex flex-wrap gap-3 z-30 animate-in slide-in-from-bottom-4">
                            {topicSuggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => applySuggestion(s)}
                                    className="flex-1 min-w-[240px] p-4 text-left rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-indigo-500/30 hover:border-indigo-500 hover:scale-[1.02] transition-all group"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lightbulb size={14} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-bold uppercase text-indigo-500">{s.type}</span>
                                    </div>
                                    <div className="font-bold text-sm dark:text-white text-slate-900 group-hover:text-indigo-500 transition-colors">{s.refinedTopic}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Image Preview Strip (Outside the box for cleaner look) */}
            {config.referenceImages && config.referenceImages.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2 px-2 animate-in slide-in-from-left-4">
                    {config.referenceImages.map((img) => (
                        <div key={img.id} className="relative group w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 dark:border-white/10 border-slate-200 shadow-lg hover:scale-105 transition-transform">
                            <img src={img.previewUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={() => removeImage(img.id)}
                                    className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* 3. Controls Dashboard (Right - Stacked) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
              
              {/* WRITING MODE CONTROL GROUP */}
              <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1 block">Writing Intelligence</label>
                  <div className="grid grid-cols-3 gap-2">
                        {/* Manual Mode */}
                        <button
                            onClick={() => updateConfig('writingMode', 'manual')}
                            className={clsx(
                                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300",
                                config.writingMode === 'manual'
                                    ? "bg-white dark:bg-white/10 border-indigo-500 shadow-lg ring-1 ring-indigo-500"
                                    : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
                            )}
                        >
                            <User size={20} className={config.writingMode === 'manual' ? "text-indigo-500" : "text-slate-400"} />
                            <span className="text-[10px] font-bold uppercase">Manual</span>
                        </button>

                        {/* Auto Match Mode */}
                        <button
                            onClick={() => updateConfig('writingMode', 'auto')}
                            className={clsx(
                                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                                config.writingMode === 'auto'
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-xl"
                                    : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
                            )}
                        >
                             {config.writingMode === 'auto' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 animate-pulse"></div>}
                            <Compass size={20} className={config.writingMode === 'auto' ? "text-white fill-current" : "text-slate-400"} />
                            <span className="text-[10px] font-bold uppercase relative z-10">Auto Match</span>
                        </button>

                        {/* Blend Studio Mode */}
                        <button
                            onClick={() => updateConfig('writingMode', 'blend')}
                            className={clsx(
                                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                                config.writingMode === 'blend'
                                    ? "bg-purple-600 border-purple-500 text-white shadow-xl"
                                    : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
                            )}
                        >
                             {config.writingMode === 'blend' && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-20 animate-pulse"></div>}
                            <Combine size={20} className={config.writingMode === 'blend' ? "text-white" : "text-slate-400"} />
                            <span className="text-[10px] font-bold uppercase relative z-10">Blend Studio</span>
                        </button>
                  </div>
                  <div className="text-[10px] opacity-50 px-1 italic">
                      {config.writingMode === 'manual' && "Choose your preferred creator style directly."}
                      {config.writingMode === 'auto' && "AI analyzes your topic to find the perfect creator match."}
                      {config.writingMode === 'blend' && "Combine multiple creator voices into a unique synthesis."}
                  </div>
              </div>

              {/* Creator Selector Area - Conditional Logic */}
              <div className={clsx(
                    "rounded-3xl border transition-all duration-300 group",
                    config.writingMode === 'auto' ? "p-0 h-0 opacity-0 border-none overflow-hidden" : "p-6",
                    isDarkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-slate-200"
                )}>
                    {config.writingMode !== 'auto' && (
                        <>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2 mb-4">
                                <User size={14} className={config.writingMode === 'blend' ? "text-purple-500" : "text-indigo-500"} /> 
                                {config.writingMode === 'blend' ? "Primary Voice (Base Style)" : "Target Persona"}
                            </label>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowStyleSelector(!showStyleSelector)}
                                    className="w-full flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 dark:border-white/10 border-slate-100 shadow-md">
                                            <img src={currentCreator.avatarUrl} alt={currentCreator.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="text-left">
                                            <div className={clsx("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{currentCreator.name}</div>
                                            <div className="text-xs opacity-60 font-medium">{currentCreator.style}</div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <ChevronDown size={16} />
                                    </div>
                                </button>

                                {/* Dropdown */}
                                {showStyleSelector && (
                                    <div className={clsx(
                                        "absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl max-h-80 overflow-y-auto z-50 p-2 space-y-1 scrollbar-hide animate-in fade-in slide-in-from-top-2",
                                        isDarkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-slate-200"
                                    )}>
                                        {CREATORS.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    updateConfig('selectedStyleId', c.id);
                                                    // Also update blend config primary if in blend mode
                                                    if (config.writingMode === 'blend') {
                                                        updateConfig('blendConfig', { ...config.blendConfig, primaryCreatorId: c.id });
                                                    }
                                                    setShowStyleSelector(false);
                                                }}
                                                className={clsx(
                                                    "w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left group/item",
                                                    config.selectedStyleId === c.id 
                                                        ? (isDarkMode ? "bg-indigo-500/20" : "bg-indigo-50") 
                                                        : "hover:bg-black/5 dark:hover:bg-white/5"
                                                )}
                                            >
                                                <img src={c.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <div className={clsx("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{c.name}</div>
                                                    <div className="text-xs opacity-50">{c.style}</div>
                                                </div>
                                                {config.selectedStyleId === c.id && <Check size={16} className="text-indigo-500" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* BLEND STUDIO SECONDARY SELECTOR */}
                            {config.writingMode === 'blend' && (
                                <div className="mt-6 pt-6 border-t dark:border-white/10 border-slate-100 animate-in fade-in slide-in-from-top-2">
                                     <label className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2 mb-3">
                                        <Layers size={14} className="text-purple-500" /> Secondary Influences (Max 3)
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {CREATORS.filter(c => c.id !== config.selectedStyleId).map(c => {
                                            const isSelected = config.blendConfig.secondaryCreatorIds.includes(c.id);
                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() => toggleSecondaryCreator(c.id)}
                                                    className={clsx(
                                                        "relative rounded-lg overflow-hidden aspect-square border-2 transition-all",
                                                        isSelected ? "border-purple-500 shadow-md scale-105" : "border-transparent opacity-50 hover:opacity-100"
                                                    )}
                                                    title={c.name}
                                                >
                                                    <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                                    {isSelected && <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"><Check size={12} className="text-white drop-shadow-md" /></div>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <p className="text-[9px] opacity-40 mt-2 italic">Selected creators will add flavor, vocabulary, and structural nuances to the primary voice.</p>
                                </div>
                            )}
                        </>
                    )}
              </div>

              {/* Auto Match Visual Placeholder */}
              {config.writingMode === 'auto' && (
                  <div className={clsx(
                      "p-6 rounded-3xl border flex items-center gap-4 transition-all animate-in fade-in zoom-in-95",
                      isDarkMode ? "bg-indigo-900/10 border-indigo-500/30" : "bg-indigo-50 border-indigo-100"
                  )}>
                      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                          <BrainCircuit size={24} />
                      </div>
                      <div>
                          <div className="font-bold text-sm text-indigo-500 mb-1">AI Creator Match</div>
                          <p className="text-xs opacity-60 leading-tight max-w-[200px]">System will analyze your topic's factual intensity and emotional weight to auto-select the best creator.</p>
                      </div>
                  </div>
              )}

              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-5">
                   <div className={clsx("p-5 rounded-3xl border transition-all hover:scale-[1.02]", isDarkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-slate-200 hover:shadow-md")}>
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3 block"><Clock size={12} className="inline mr-1"/> Duration</label>
                        <select 
                            value={config.duration}
                            onChange={(e) => updateConfig('duration', e.target.value)}
                            className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer dark:text-white"
                        >
                            {DURATIONS.map(d => <option key={d} value={d} className="dark:bg-slate-800">{d}</option>)}
                        </select>
                   </div>
                   <div className={clsx("p-5 rounded-3xl border transition-all hover:scale-[1.02]", isDarkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-slate-200 hover:shadow-md")}>
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3 block"><LayoutTemplate size={12} className="inline mr-1"/> Format</label>
                        <select 
                            value={config.platform}
                            onChange={(e) => updateConfig('platform', e.target.value)}
                            className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer dark:text-white"
                        >
                             {PLATFORMS.map(p => <option key={p} value={p} className="dark:bg-slate-800">{p}</option>)}
                        </select>
                   </div>
              </div>

               {/* Language Selector */}
               <div className={clsx("p-5 rounded-3xl border transition-all hover:scale-[1.01]", isDarkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-slate-200 hover:shadow-md")}>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-2"><Languages size={12}/> Output Language</label>
                    </div>
                    <select 
                        value={config.language}
                        onChange={(e) => updateConfig('language', e.target.value)}
                        className="w-full bg-transparent font-bold text-lg outline-none cursor-pointer dark:text-white"
                    >
                         {LANGUAGES.map(l => <option key={l} value={l} className="dark:bg-slate-800">{l}</option>)}
                    </select>
                    {config.language === "Arabic" && (
                         <div className="mt-3 pt-3 border-t dark:border-white/5 border-slate-100">
                             <select 
                                value={config.arabicDialect || ARABIC_DIALECTS[0]}
                                onChange={(e) => updateConfig('arabicDialect', e.target.value)}
                                className="w-full bg-transparent text-xs font-bold text-emerald-500 outline-none cursor-pointer"
                            >
                                {ARABIC_DIALECTS.map(d => <option key={d} value={d} className="dark:bg-slate-800">{d} Dialect</option>)}
                            </select>
                         </div>
                    )}
               </div>
               
               {/* Sponsor Toggle */}
               <div className={clsx(
                  "px-5 py-4 rounded-3xl border transition-all",
                  config.sponsorInfo?.enabled 
                    ? (isDarkMode ? "bg-blue-900/10 border-blue-500/30" : "bg-blue-50 border-blue-200")
                    : (isDarkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-slate-200")
              )}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => handleSponsorChange('enabled', !config.sponsorInfo?.enabled)}>
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-2 cursor-pointer">
                        <DollarSign size={12} /> Sponsor
                    </label>
                    <div className={clsx("w-8 h-4 rounded-full relative transition-colors", config.sponsorInfo?.enabled ? "bg-blue-500" : "bg-slate-300 dark:bg-white/10")}>
                        <div className={clsx("absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm", config.sponsorInfo?.enabled ? "translate-x-4" : "")}></div>
                    </div>
                  </div>
                  {config.sponsorInfo?.enabled && (
                      <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                           <input type="text" placeholder="Brand Name" value={config.sponsorInfo?.name} onChange={(e) => handleSponsorChange('name', e.target.value)} className="w-full p-2 bg-transparent border-b text-sm outline-none dark:border-white/10 border-slate-300 focus:border-blue-500" />
                           <input type="text" placeholder="Key Message" value={config.sponsorInfo?.message} onChange={(e) => handleSponsorChange('message', e.target.value)} className="w-full p-2 bg-transparent border-b text-sm outline-none dark:border-white/10 border-slate-300 focus:border-blue-500" />
                      </div>
                  )}
               </div>

              {/* GENERATE BUTTON */}
              <button
                onClick={onGenerate}
                disabled={isGenerating || !config.topicOrScript}
                className={clsx(
                    "w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group mt-2",
                    isGenerating ? "opacity-70 cursor-wait" : "hover:shadow-indigo-500/40",
                    config.writingMode === 'auto' 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : config.writingMode === 'blend'
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : (isDarkMode ? "bg-white text-black" : "bg-slate-900 text-white")
                )}
              >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                  {isGenerating ? (
                      <Loader2 className="animate-spin" size={28} />
                  ) : (
                      <Wand2 size={28} className={config.writingMode !== 'manual' ? "fill-white/50" : ""} />
                  )}
                  <span className="relative z-10">
                      {isGenerating ? "Generating Magic..." : (
                          config.writingMode === 'auto' ? "Auto-Generate Script" :
                          config.writingMode === 'blend' ? "Blend & Generate" :
                          "Create Script"
                      )}
                  </span>
              </button>

          </div>
      </div>
    </div>
  );
};

export default CreationForm;
