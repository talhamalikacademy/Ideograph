
import React, { useState } from 'react';
import { ScriptData, CreatorProfile, YoutubeTitle } from '../types';
import { generateViralTitles, generateThumbnail } from '../services/geminiService';
import { Sparkles, Image as ImageIcon, Copy, RefreshCw, X, Loader2, Globe, Type, Download, Check, MonitorPlay, Ratio } from 'lucide-react';
import clsx from 'clsx';

interface EngagementPanelProps {
  script: ScriptData;
  creator: CreatorProfile;
}

type LangOption = 'English' | 'Urdu/Hindi' | 'Hinglish';
type AspectOption = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

const EngagementPanel: React.FC<EngagementPanelProps> = ({ script, creator }) => {
  const [activeMode, setActiveMode] = useState<'none' | 'titles' | 'thumbnail'>('none');
  
  // Title State
  const [titles, setTitles] = useState<YoutubeTitle[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [showTitleLangModal, setShowTitleLangModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Thumbnail State
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [thumbText, setThumbText] = useState('');
  const [showThumbConfigModal, setShowThumbConfigModal] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectOption>('16:9');

  // --- Title Logic ---
  const handleTitleClick = () => {
    // Check script language logic
    const isForeign = script.language && !script.language.toLowerCase().includes('english');
    if (isForeign || titles.length === 0) {
        setShowTitleLangModal(true);
    } else {
        setActiveMode('titles');
    }
  };

  const generateTitles = async (lang: LangOption) => {
    setShowTitleLangModal(false);
    setActiveMode('titles');
    setIsGeneratingTitles(true);
    try {
        const results = await generateViralTitles(script, creator, lang);
        setTitles(results);
        // Pre-fill thumbnail text
        if (results.length > 0) setThumbText(results[0].thumbnailText);
    } catch (e) {
        console.error(e);
        alert("Failed to generate titles.");
    } finally {
        setIsGeneratingTitles(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
  };

  // --- Thumbnail Logic ---
  const handleThumbnailClick = () => {
    // Always open config for language/text/ratio
    setShowThumbConfigModal(true);
  };

  const generateThumb = async (lang: LangOption) => {
    setShowThumbConfigModal(false);
    setActiveMode('thumbnail');
    setIsGeneratingThumb(true);
    
    const overlay = thumbText || script.topic.substring(0, 25);

    try {
        const url = await generateThumbnail(script, creator, overlay, lang, selectedAspectRatio);
        setThumbnailUrl(url);
    } catch (e) {
        console.error(e);
        alert("Failed to generate thumbnail.");
    } finally {
        setIsGeneratingThumb(false);
    }
  };

  return (
    <div className="w-[90%] mx-auto mt-16 mb-24 relative z-30 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* GLOWING NEON CONTAINER */}
      <div 
        className="relative rounded-[2.5rem] p-[2px] overflow-hidden group transition-all duration-500"
        style={{
            boxShadow: `0 0 30px -5px ${creator.hex}60`, // Breathing glow
        }}
      >
          {/* Animated Neon Border */}
          <div 
            className="absolute inset-0 animate-glow opacity-80"
            style={{ 
                background: `linear-gradient(45deg, ${creator.hex}, transparent, ${creator.hex})`,
                animationDuration: '3s' 
            }} 
          />
          
          {/* Main Dark Content Box */}
          <div className="bg-[#020617] relative rounded-[2.4rem] p-8 md:p-10 border border-white/5 overflow-hidden">
              
              {/* Pro Badge */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl z-20 flex items-center gap-2"
                style={{ 
                    backgroundColor: '#020617', 
                    borderColor: creator.hex, 
                    color: creator.hex,
                    boxShadow: `0 0 20px ${creator.hex}40`
                }}
              >
                  <Sparkles size={10} className="animate-pulse" /> Engagement Command Center
              </div>

              {/* TWO MASSIVE BUTTONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  
                  {/* BUTTON 1: TITLES */}
                  <button 
                      onClick={handleTitleClick}
                      className={clsx(
                          "relative h-32 rounded-3xl flex items-center justify-between px-10 transition-all duration-300 overflow-hidden group/btn text-left",
                          activeMode === 'titles' ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 hover:bg-white/10 hover:scale-[1.02]"
                      )}
                  >
                      <div className="relative z-10">
                          <div className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                              Generate Viral SEO Titles
                              <Type className="text-yellow-400 opacity-80" size={24} />
                          </div>
                          <div className="text-sm font-medium text-slate-400">
                              Use YouTube Data API Logic • Curiosity Gap • Negativity Bias
                          </div>
                      </div>
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 group-hover/btn:bg-white/10 transition-colors shadow-inner"
                      >
                          <MonitorPlay size={32} className="text-slate-200" />
                      </div>
                  </button>

                  {/* BUTTON 2: THUMBNAIL */}
                  <button 
                      onClick={handleThumbnailClick}
                      className={clsx(
                          "relative h-32 rounded-3xl flex items-center justify-between px-10 transition-all duration-300 overflow-hidden group/btn text-left",
                          activeMode === 'thumbnail' ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 hover:bg-white/10 hover:scale-[1.02]"
                      )}
                  >
                      <div className="relative z-10">
                          <div className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                              Generate AI Thumbnail
                              <ImageIcon className="text-pink-400 opacity-80" size={24} />
                          </div>
                          <div className="text-sm font-medium text-slate-400">
                              {creator.name} Style DNA • 8K Resolution • Face Matching
                          </div>
                      </div>
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 group-hover/btn:bg-white/10 transition-colors shadow-inner"
                      >
                          <Sparkles size={32} className="text-slate-200" />
                      </div>
                  </button>
              </div>

              {/* DYNAMIC RESULTS AREA */}
              {(activeMode !== 'none' || isGeneratingTitles || isGeneratingThumb) && (
                  <div className="mt-10 pt-10 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                      
                      {/* LOADING STATE */}
                      {(isGeneratingTitles || isGeneratingThumb) && (
                          <div className="flex flex-col items-center justify-center py-12 gap-6">
                              <div className="relative">
                                  <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                  <Loader2 size={48} className="animate-spin text-white relative z-10" />
                              </div>
                              <p className="text-lg font-bold text-slate-300 animate-pulse tracking-wide">
                                  {isGeneratingTitles ? "Simulating YouTube Algorithm..." : "Rendering 8K Visuals..."}
                              </p>
                          </div>
                      )}

                      {/* TITLES RESULTS */}
                      {!isGeneratingTitles && activeMode === 'titles' && titles.length > 0 && (
                          <div className="grid grid-cols-1 gap-3">
                              {titles.map((t, i) => (
                                  <div key={i} className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all">
                                      <div className="flex-1 pr-6">
                                          <div className="flex items-center gap-3 mb-1.5">
                                              <span 
                                                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-black"
                                                style={{ backgroundColor: t.ctrScore > 90 ? '#4ade80' : '#facc15' }}
                                              >
                                                  {t.ctrScore}% CTR Pred
                                              </span>
                                              <span className="text-[10px] text-slate-500 font-mono uppercase">{t.pattern}</span>
                                          </div>
                                          <div className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{t.text}</div>
                                      </div>
                                      <button 
                                        onClick={() => handleCopy(t.text, i)}
                                        className="p-3 rounded-xl bg-black/20 hover:bg-indigo-500 text-slate-400 hover:text-white transition-all active:scale-95"
                                      >
                                          {copiedIndex === i ? <Check size={20} /> : <Copy size={20} />}
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* THUMBNAIL RESULTS */}
                      {!isGeneratingThumb && activeMode === 'thumbnail' && thumbnailUrl && (
                          <div className="flex flex-col md:flex-row gap-10 items-start">
                              <div className="w-full md:w-3/4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                  <img src={thumbnailUrl} alt="AI Thumbnail" className="w-full h-auto object-cover" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 backdrop-blur-sm">
                                      <a href={thumbnailUrl} download="thumbnail.png" className="px-8 py-4 rounded-xl bg-white text-black font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-xl">
                                          <Download size={20} /> Download High-Res
                                      </a>
                                  </div>
                              </div>
                              <div className="w-full md:w-1/4 space-y-6">
                                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Style Parameters</h4>
                                      <div className="flex flex-wrap gap-2">
                                          <span className="text-xs bg-black/40 px-3 py-1.5 rounded-lg text-slate-300 border border-white/5">{creator.name}</span>
                                          <span className="text-xs bg-black/40 px-3 py-1.5 rounded-lg text-slate-300 border border-white/5">{selectedAspectRatio}</span>
                                      </div>
                                  </div>
                                  <button onClick={() => setShowThumbConfigModal(true)} className="w-full py-4 rounded-2xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                      <RefreshCw size={16} /> Generate Another
                                  </button>
                              </div>
                          </div>
                      )}

                  </div>
              )}
          </div>
      </div>

      {/* --- TITLE LANGUAGE MODAL --- */}
      {showTitleLangModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl rounded-[2.5rem] animate-in fade-in zoom-in-95">
              <div className="text-center space-y-8 p-8 max-w-md w-full">
                  <Globe size={48} className="mx-auto text-indigo-500 mb-4" />
                  <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Select Target Audience</h3>
                      <p className="text-slate-400">Optimize keywords and grammar for:</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                      {(['English', 'Urdu/Hindi', 'Hinglish'] as LangOption[]).map(lang => (
                          <button 
                            key={lang} 
                            onClick={() => generateTitles(lang)}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-indigo-600 border border-white/5 text-white font-bold transition-all text-lg"
                          >
                              {lang}
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setShowTitleLangModal(false)} className="text-slate-500 hover:text-white">Cancel</button>
              </div>
          </div>
      )}

      {/* --- THUMBNAIL CONFIG MODAL --- */}
      {showThumbConfigModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl rounded-[2.5rem] animate-in fade-in zoom-in-95">
              <div className="w-full max-w-lg p-8 space-y-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                      <ImageIcon size={32} className="text-pink-500" />
                      <h3 className="text-2xl font-bold text-white">Visual Settings</h3>
                  </div>

                  {/* Text Overlay Input */}
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Thumbnail Text Overlay</label>
                      <input 
                        type="text" 
                        value={thumbText} 
                        onChange={(e) => setThumbText(e.target.value)}
                        placeholder="e.g. THE TRUTH EXPOSED"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                      />
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Ratio size={12} /> Aspect Ratio
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                          {(['16:9', '9:16', '1:1', '4:3', '3:4'] as AspectOption[]).map(ratio => (
                              <button 
                                key={ratio} 
                                onClick={() => setSelectedAspectRatio(ratio)}
                                className={clsx(
                                    "py-3 rounded-lg border text-xs font-bold transition-all",
                                    selectedAspectRatio === ratio 
                                        ? "bg-pink-600 border-pink-500 text-white" 
                                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                )}
                              >
                                  {ratio}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Text Language Style</label>
                      <div className="grid grid-cols-3 gap-2">
                          {(['English', 'Urdu/Hindi', 'Hinglish'] as LangOption[]).map(lang => (
                              <button 
                                key={lang} 
                                onClick={() => generateThumb(lang)}
                                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 font-bold hover:border-pink-500/50 transition-colors"
                              >
                                  {lang}
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  <button onClick={() => setShowThumbConfigModal(false)} className="w-full text-slate-500 hover:text-white mt-4 text-sm">Cancel</button>
              </div>
          </div>
      )}

    </div>
  );
};

export default EngagementPanel;
