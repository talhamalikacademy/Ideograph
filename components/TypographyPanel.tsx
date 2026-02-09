import React, { useRef } from 'react';
import { Type, Upload, Plus, Minus, MoveHorizontal, MoveVertical } from 'lucide-react';
import { TypographyConfig } from '../types';
import { FONT_OPTIONS } from '../constants';
import clsx from 'clsx';

interface TypographyPanelProps {
  config: TypographyConfig;
  setConfig: React.Dispatch<React.SetStateAction<TypographyConfig>>;
}

const TypographyPanel: React.FC<TypographyPanelProps> = ({ config, setConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // Create a dynamic font face
      const fontName = `CustomFont_${Date.now()}`;
      const fontFace = new FontFace(fontName, `url(${result})`);
      
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        setConfig(prev => ({
          ...prev,
          fontFamily: fontName,
          isCustomFont: true
        }));
      });
    };
    reader.readAsDataURL(file);
  };

  const updateConfig = (key: keyof TypographyConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 border-b dark:border-white/5 border-slate-200 bg-slate-50/50 dark:bg-black/20 flex flex-wrap gap-6 items-center animate-in slide-in-from-top-2">
      
      {/* Font Family */}
      <div className="flex flex-col gap-1 min-w-[200px]">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1">
          <Type size={10} /> Font Family
        </label>
        <div className="flex gap-2">
          <select 
            value={config.fontFamily} 
            onChange={(e) => updateConfig('fontFamily', e.target.value)}
            className="flex-1 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {config.isCustomFont && <option value={config.fontFamily}>Custom Font</option>}
            {FONT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 transition-colors"
            title="Upload Custom Font (.ttf, .otf)"
          >
            <Upload size={14} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".ttf,.otf,.woff,.woff2" onChange={handleFileUpload} />
        </div>
      </div>

      {/* Font Size */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Size</label>
        <div className="flex items-center gap-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg p-1">
          <button onClick={() => updateConfig('fontSize', Math.max(12, config.fontSize - 1))} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"><Minus size={12} /></button>
          <span className="text-xs font-mono w-6 text-center">{config.fontSize}</span>
          <button onClick={() => updateConfig('fontSize', Math.min(32, config.fontSize + 1))} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"><Plus size={12} /></button>
        </div>
      </div>

      {/* Line Height */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1"><MoveVertical size={10} /> Height</label>
        <input 
          type="range" 
          min="1" 
          max="2.5" 
          step="0.1" 
          value={config.lineHeight}
          onChange={(e) => updateConfig('lineHeight', parseFloat(e.target.value))}
          className="w-24 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
        />
      </div>

      {/* Spacing */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1"><MoveHorizontal size={10} /> Spacing</label>
        <input 
          type="range" 
          min="-1" 
          max="2" 
          step="0.1" 
          value={config.letterSpacing}
          onChange={(e) => updateConfig('letterSpacing', parseFloat(e.target.value))}
          className="w-24 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
        />
      </div>

    </div>
  );
};

export default TypographyPanel;