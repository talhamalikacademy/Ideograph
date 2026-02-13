import React, { useState } from 'react';
import { ScriptData, CreatorProfile, YoutubeTitle } from '../types';
import { generateViralTitles } from '../services/geminiService';
import { Sparkles, Copy, Loader2, Globe, Type, Check, MonitorPlay } from 'lucide-react';
import clsx from 'clsx';

interface EngagementPanelProps {
  script: ScriptData;
  creator: CreatorProfile;
  apiKey?: string;
}

type LangOption = 'English' | 'Urdu/Hindi' | 'Hinglish';

const EngagementPanel: React.FC<EngagementPanelProps> = ({ script, creator, apiKey }) => {
  const [activeMode, setActiveMode] = useState<'none' | 'titles'>('none');
  const hasApiKey = Boolean(apiKey || process.env.API_KEY);

  const [titles, setTitles] = useState<YoutubeTitle[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [showTitleLangModal, setShowTitleLangModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleTitleClick = () => {
    const isForeign = script.language && !script.language.toLowerCase().includes('english');
    if (isForeign || titles.length === 0) {
      setShowTitleLangModal(true);
    } else {
      setActiveMode('titles');
    }
  };

  const generateTitles = async (lang: LangOption) => {
    if (!hasApiKey) {
      alert("API key is required. Open Settings and add your Gemini API key.");
      return;
    }
    setShowTitleLangModal(false);
    setActiveMode('titles');
    setIsGeneratingTitles(true);
    try {
      const results = await generateViralTitles(script, creator, lang, apiKey);
      setTitles(results);
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

  return (
    <div className="w-[90%] mx-auto mt-16 mb-24 relative z-30 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div
        className="relative rounded-[2.5rem] p-[2px] overflow-hidden group transition-all duration-500"
        style={{
          boxShadow: `0 0 30px -5px ${creator.hex}60`,
        }}
      >
        <div
          className="absolute inset-0 animate-glow opacity-80"
          style={{
            background: `linear-gradient(45deg, ${creator.hex}, transparent, ${creator.hex})`,
            animationDuration: '3s'
          }}
        />

        <div className="bg-[#020617] relative rounded-[2.4rem] p-8 md:p-10 border border-white/5 overflow-hidden">
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

          <div className="grid grid-cols-1 gap-8 h-full">
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
                  Use YouTube Data API Logic | Curiosity Gap | Negativity Bias
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 group-hover/btn:bg-white/10 transition-colors shadow-inner">
                <MonitorPlay size={32} className="text-slate-200" />
              </div>
            </button>
          </div>

          {!hasApiKey && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Add your API key in Settings to generate titles.
            </div>
          )}

          {(activeMode !== 'none' || isGeneratingTitles) && (
            <div className="mt-10 pt-10 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
              {isGeneratingTitles && (
                <div className="flex flex-col items-center justify-center py-12 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                    <Loader2 size={48} className="animate-spin text-white relative z-10" />
                  </div>
                  <p className="text-lg font-bold text-slate-300 animate-pulse tracking-wide">
                    Simulating YouTube Algorithm...
                  </p>
                </div>
              )}

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
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default EngagementPanel;
