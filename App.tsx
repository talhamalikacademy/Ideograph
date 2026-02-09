
import React, { useState, useEffect } from 'react';
import ScriptEditor from './components/ScriptEditor';
import BoostPanel from './components/BoostPanel';
import CreationForm from './components/CreationForm';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import SubscriptionModal from './components/SubscriptionModal';
import TemplateGrid from './components/TemplateGrid';
import { CREATORS, DUMMY_SCRIPT, DUMMY_ANALYSIS, TEMPLATES } from './constants';
import { CreatorProfile, ScriptData, AnalysisData, AppState, SavedScript, UserPlan, GeneratorConfig, SidebarView, Template } from './types';
import { Zap, ChevronLeft, Menu, History, Settings, Crown, Loader2, PenTool } from 'lucide-react';
import { generateScriptWithGemini, analyzeScriptWithGemini, extendScriptWithGemini } from './services/geminiService';
import { saveScriptToHistory, getHistory, deleteScriptFromHistory, incrementDailyUsage, checkLimit } from './services/storageService';
import clsx from 'clsx';

const App: React.FC = () => {
  const [script, setScript] = useState<ScriptData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isExtending, setIsExtending] = useState(false);
  
  // View State (Replaces Sidebar)
  const [view, setView] = useState<'create' | 'history' | 'templates'>('create');
  const [searchQuery, setSearchQuery] = useState(''); 

  // Pro Subscription State (Simulation)
  const [isPro, setIsPro] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>(isPro ? 'pro' : 'free');

  useEffect(() => {
    setUserPlan(isPro ? 'pro' : 'free');
  }, [isPro]);

  // Settings & Theme
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [history, setHistory] = useState<SavedScript[]>([]);

  // Unified Config State
  const [generatorConfig, setGeneratorConfig] = useState<GeneratorConfig>({
    topicOrScript: '',
    duration: '60 Seconds (Shorts)',
    language: 'English',
    expertise: 'Beginner',
    platform: 'YouTube Shorts',
    rewriteAggressiveness: 'Medium',
    transformationType: 'Full Rewrite',
    writingMode: 'manual', // Default
    selectedStyleId: CREATORS[0].id,
    blendConfig: {
        primaryCreatorId: CREATORS[0].id,
        secondaryCreatorIds: []
    }
  });

  const [showBoost, setShowBoost] = useState(false);

  // Derived Selected Creator (For Manual Mode, or Primary Blend, or Placeholder for Auto)
  const selectedCreator = CREATORS.find(c => c.id === generatorConfig.selectedStyleId) || CREATORS[0];

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load History
  useEffect(() => {
    setHistory(getHistory());
  }, [showHistoryModal]); 

  // Script Sync Handler
  const handleScriptUpdate = (updatedScript: ScriptData) => {
      setScript(updatedScript);
      // Persist updates (e.g. image generation, visual extension) to history immediately
      saveScriptToHistory(updatedScript, selectedCreator, analysis || undefined);
      setHistory(getHistory());
  };

  // Direct Script Generation Handler
  const handleGenerateScript = async () => {
    // Basic validations
    if (!checkLimit(userPlan)) {
      setShowSubscription(true);
      return;
    }

    setAppState(AppState.GENERATING_SCRIPT);
    setScript(null);
    setAnalysis(null);
    setShowBoost(false);

    try {
      let generatedScript: ScriptData;
      const hasKey = !!apiKey || !!process.env.API_KEY;

      if (hasKey) {
          generatedScript = await generateScriptWithGemini(
            generatorConfig, 
            selectedCreator, 
            apiKey,
            customPrompt
          );
      } else {
          // Dummy Script Fallback
          await new Promise(r => setTimeout(r, 2000)); 
          generatedScript = JSON.parse(JSON.stringify(DUMMY_SCRIPT)); 
          generatedScript.topic = generatorConfig.topicOrScript || "Why Electric Cars are the Future";
          generatedScript.type = generatorConfig.platform as any;
      }
      
      incrementDailyUsage();
      const saved = saveScriptToHistory(generatedScript, selectedCreator);
      
      setScript(saved); 
      setHistory(getHistory());
      setAppState(AppState.READY);
      
    } catch (e: any) {
      console.error(e);
      setAppState(AppState.IDLE);
      alert(e.message || "Error generating final script.");
    }
  };

  const handleAnalyze = async () => {
     if (!script) return;
     setAppState(AppState.ANALYZING);
     setShowBoost(true);
     
     try {
        let generatedAnalysis: AnalysisData | null = null;
        const hasKey = !!apiKey || !!process.env.API_KEY;
        if (hasKey) {
             generatedAnalysis = await analyzeScriptWithGemini(script, apiKey);
        } else {
            await new Promise(r => setTimeout(r, 1000));
            generatedAnalysis = DUMMY_ANALYSIS;
        }
        const analysisData = generatedAnalysis || DUMMY_ANALYSIS;
        if (script.id) {
           const updated = saveScriptToHistory(script, selectedCreator, analysisData);
           setScript(updated);
        }
        setAnalysis(analysisData);
        setAppState(AppState.READY);
     } catch(e) { console.error(e); setAppState(AppState.READY); }
  };

  const handleExtend = async () => {
    if (!script) return;
    setIsExtending(true);
    try {
      let extendedScript: ScriptData;
      const hasKey = !!apiKey || !!process.env.API_KEY;
      if (hasKey) {
        extendedScript = await extendScriptWithGemini(script, selectedCreator, apiKey);
      } else {
        await new Promise(r => setTimeout(r, 2000));
        extendedScript = JSON.parse(JSON.stringify(script));
        extendedScript.segments.push({
            visual: "[Continued Scene] A deeper look into the mechanism.",
            audio: "And that's just the surface level. If we dig deeper, we find something terrifying."
        });
      }
      
      // Update local state immediately for seamless effect
      setScript(extendedScript); 

      // Save to history
      saveScriptToHistory(extendedScript, selectedCreator, analysis || undefined);
      setHistory(getHistory());

      // If boost was active, re-analyze automatically
      if (showBoost) {
          handleAnalyze();
      }

    } catch (error) { console.error(error); alert("Failed to extend script."); } 
    finally { setIsExtending(false); }
  };

  const handleSelectFromHistory = (saved: SavedScript) => {
    setScript(saved);
    setAnalysis(saved.analysis || null);
    setGeneratorConfig(prev => ({ 
        ...prev, 
        topicOrScript: saved.topic, 
        platform: saved.type,
        selectedStyleId: saved.creatorId,
        writingMode: 'manual' // Default back to manual when loading history for simplicity
    }));
    setShowHistoryModal(false);
    setAppState(AppState.READY);
    setView('create'); 
  };

  const handleLoadTemplate = (template: Template) => {
    setView('create');
    setGeneratorConfig(prev => ({ 
        ...prev, 
        topicOrScript: template.content,
        selectedStyleId: template.creatorId,
        writingMode: 'manual'
    }));
    setScript(null);
    setAppState(AppState.IDLE);
  };

  const handleDeleteFromHistory = (id: string) => {
    deleteScriptFromHistory(id);
    setHistory(getHistory());
    if (script?.id === id) { setScript(null); setAnalysis(null); setAppState(AppState.IDLE); }
  };

  const handleBack = () => { setAppState(AppState.IDLE); setScript(null); };

  return (
    <div className={clsx(
      "flex flex-col min-h-screen font-sans transition-colors selection:bg-purple-500/30",
      isDarkMode ? "bg-[#020617] text-slate-200" : "bg-slate-50 text-slate-900"
    )}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md border-b dark:border-white/5 border-slate-200 bg-opacity-80 dark:bg-[#020617]/80 bg-white/80">
            <div className={clsx("mx-auto px-4 h-16 flex items-center justify-between transition-all duration-500 ease-in-out w-full max-w-[95vw]")}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <PenTool size={18} className="fill-white/20" />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">Ideograph</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowHistoryModal(true)}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title="History"
                    >
                        <History size={20} />
                    </button>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button 
                        onClick={() => setShowSubscription(true)}
                        className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs hover:bg-indigo-500/20 transition-colors"
                    >
                        <Crown size={14} /> {userPlan === 'pro' ? 'PRO' : 'Upgrade'}
                    </button>
                </div>
            </div>
        </header>

        {/* Main Content Area */}
        <main className={clsx(
            "flex-1 w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col transition-all duration-500 ease-in-out",
            script ? "max-w-[96vw]" : "max-w-[95vw]" // Allow wider layout for Creation Form
        )}>
            
            {/* View Switching (Tabs) - Only if Idle and no Script */}
            {appState === AppState.IDLE && !script && (
                <div className="flex justify-center mb-12">
                    <div className="flex bg-slate-200 dark:bg-white/5 p-1.5 rounded-2xl shadow-inner">
                        <button 
                            onClick={() => setView('create')}
                            className={clsx(
                                "px-8 py-3 rounded-xl text-base font-bold transition-all",
                                view === 'create' ? "bg-white dark:bg-white/10 shadow-lg scale-105 text-slate-900 dark:text-white" : "opacity-60 hover:opacity-100"
                            )}
                        >
                            Create
                        </button>
                        <button 
                            onClick={() => setView('templates')}
                            className={clsx(
                                "px-8 py-3 rounded-xl text-base font-bold transition-all",
                                view === 'templates' ? "bg-white dark:bg-white/10 shadow-lg scale-105 text-slate-900 dark:text-white" : "opacity-60 hover:opacity-100"
                            )}
                        >
                            Templates
                        </button>
                    </div>
                </div>
            )}

            {/* RENDER LOGIC SWITCH */}
            {script ? (
                // EDITOR VIEW
                <div className="flex-1 flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-4">
                        <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">
                            <ChevronLeft size={16} /> Back to Studio
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-auto min-h-0">
                        <div className="flex-1 h-full min-h-[500px]">
                            <ScriptEditor 
                                script={script} 
                                creator={selectedCreator} 
                                onAnalyze={handleAnalyze}
                                isAnalyzing={appState === AppState.ANALYZING}
                                hasAnalysis={!!analysis}
                                onRetry={handleBack}
                                onExtend={handleExtend}
                                isExtending={isExtending}
                                isDarkMode={isDarkMode}
                                apiKey={apiKey}
                                onUpdateScript={handleScriptUpdate}
                            />
                        </div>
                        
                        <div className={`transition-all duration-500 ease-in-out flex-shrink-0 ${showBoost ? 'w-full lg:w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden hidden lg:block'}`}>
                            {analysis && <BoostPanel analysis={analysis} creator={selectedCreator} isVisible={showBoost} />}
                        </div>
                    </div>

                    {/* Mobile Boost Toggle */}
                    {script && !showBoost && analysis && (
                        <button onClick={() => setShowBoost(true)} className="fixed right-6 bottom-6 p-4 rounded-full shadow-2xl text-[#020617] font-bold z-20 hover:scale-110 transition-transform animate-bounce" style={{ backgroundColor: selectedCreator.hex }}>
                            <Zap size={24} className="fill-current" />
                        </button>
                    )}
                    {script && showBoost && (
                         <button onClick={() => setShowBoost(false)} className={clsx("fixed right-6 bottom-24 p-2 bg-black/50 backdrop-blur rounded-lg text-white text-xs z-50 lg:hidden")}>Close Panel</button>
                    )}
                </div>
            ) : view === 'templates' ? (
                // TEMPLATES VIEW
                <TemplateGrid 
                    templates={TEMPLATES} 
                    creators={CREATORS} 
                    onSelect={handleLoadTemplate} 
                    isDarkMode={isDarkMode} 
                    searchQuery={searchQuery}
                />
            ) : (
                // CREATION FORM VIEW
                (appState as AppState) === AppState.GENERATING_SCRIPT ? (
                     <div className="flex-1 flex items-center justify-center flex-col gap-6">
                         <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                            <Loader2 size={80} className="animate-spin text-indigo-500 relative z-10" />
                         </div>
                         <p className="font-bold text-2xl animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                             Crafting Your Viral Script...
                         </p>
                     </div>
                ) : (
                    <CreationForm 
                        config={generatorConfig}
                        setConfig={setGeneratorConfig}
                        onGenerate={handleGenerateScript} 
                        isGenerating={appState === AppState.GENERATING_SCRIPT}
                        creator={selectedCreator}
                        isDarkMode={isDarkMode}
                        userPlan={userPlan}
                    />
                )
            )}
        </main>

        {/* Modals */}
        <SettingsModal 
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
            isPro={isPro}
            onTogglePro={() => setIsPro(!isPro)}
        />
        <HistoryModal 
            isOpen={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            history={history}
            onSelectScript={handleSelectFromHistory}
            onDeleteScript={handleDeleteFromHistory}
            isDarkMode={isDarkMode}
        />
        <SubscriptionModal 
            isOpen={showSubscription}
            onClose={() => setShowSubscription(false)}
            currentPlan={userPlan}
            onUpgrade={() => { setIsPro(true); setShowSubscription(false); }}
            isDarkMode={isDarkMode}
        />

    </div>
  );
};

export default App;
