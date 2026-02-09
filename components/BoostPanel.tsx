import React from 'react';
import { AnalysisData, CreatorProfile } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, AlertCircle, Wand2, ArrowDownCircle, ShieldCheck, DollarSign, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface BoostPanelProps {
  analysis: AnalysisData;
  creator: CreatorProfile;
  isVisible: boolean;
}

const BoostPanel: React.FC<BoostPanelProps> = ({ analysis, creator, isVisible }) => {
  if (!isVisible) return null;

  const getHookColor = (score: number) => {
    if (score >= 80) return '#4ade80'; // green
    if (score >= 50) return '#facc15'; // yellow
    return '#f87171'; // red
  };

  const hookColor = getHookColor(analysis.hookScore);
  const truthScore = analysis.truthScore || 0;

  return (
    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 animate-in slide-in-from-right duration-500 p-2 overflow-y-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border dark:border-white/10 border-indigo-100 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold flex items-center gap-2 dark:text-white text-indigo-900">
                <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                BOOST MODE
            </h3>
            <span className="text-[10px] px-2 py-1 rounded font-mono dark:bg-white/10 dark:text-white bg-indigo-100 text-indigo-700">
                LIVE
            </span>
        </div>
        <p className="text-xs dark:text-slate-300 text-slate-600">
            Real-time viral auditing active.
        </p>
      </div>

      {/* Hook Meter */}
      <div className="p-6 rounded-2xl border backdrop-blur-sm flex flex-col items-center justify-center relative dark:bg-[#1e293b]/80 dark:border-white/5 bg-white/80 border-slate-200">
        <h4 className="text-xs uppercase tracking-widest font-bold mb-4 dark:text-slate-500 text-slate-400">Hook Strength</h4>
        
        {/* SVG Gauge */}
        <div className="relative w-32 h-16 overflow-hidden">
            <div className="absolute w-32 h-32 rounded-full border-[12px] box-border dark:border-slate-700/50 border-slate-200"></div>
            <div 
                className="absolute w-32 h-32 rounded-full border-[12px] border-transparent border-t-current box-border transition-all duration-1000 ease-out"
                style={{ 
                    color: hookColor, 
                    transform: `rotate(${(analysis.hookScore / 100) * 180 - 180 + 45}deg)`,
                    transformOrigin: '50% 50%' 
                }}
            ></div>
        </div>
        <div className="absolute bottom-6 flex flex-col items-center">
            <span className={clsx("text-3xl font-bold", "dark:text-white text-slate-800")}>{analysis.hookScore}</span>
        </div>
        
        <div className="mt-2 text-xs font-medium px-3 py-1 rounded-full dark:bg-white/5 bg-slate-100" style={{ color: hookColor }}>
            {analysis.viralityLabel.toUpperCase()}
        </div>
      </div>

      {/* Epistemic Truth Score */}
      <div className="p-4 rounded-2xl border backdrop-blur-sm dark:bg-[#1e293b]/80 dark:border-white/5 bg-white/80 border-slate-200">
        <h4 className="text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2 dark:text-slate-500 text-slate-400">
             <ShieldCheck size={14} /> Truth Integrity
        </h4>
        <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold dark:text-white text-slate-900">{truthScore}%</span>
            <span className="text-[10px] opacity-60 mb-1">Factual Grounding</span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
                className="h-full rounded-full transition-all duration-1000 bg-emerald-500" 
                style={{ width: `${truthScore}%` }}
            />
        </div>
        <p className="text-[10px] mt-2 opacity-50 leading-tight">
            Based on verifiable claims vs opinion/speculation.
        </p>
      </div>

      {/* Safety & Monetization Flags */}
      {(analysis.monetizationRisks?.length || 0) > 0 || (analysis.safetyFlags?.length || 0) > 0 ? (
          <div className="p-4 rounded-2xl border backdrop-blur-sm bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30">
             <h4 className="text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={14} /> Risk Detected
             </h4>
             
             {analysis.monetizationRisks?.map((risk, i) => (
                 <div key={`mon-${i}`} className="flex gap-2 text-xs mb-2 text-red-700 dark:text-red-300">
                     <DollarSign size={14} className="shrink-0" />
                     <span>{risk}</span>
                 </div>
             ))}

             {analysis.safetyFlags?.map((flag, i) => (
                 <div key={`safe-${i}`} className="flex gap-2 text-xs mb-2 text-red-700 dark:text-red-300">
                     <AlertCircle size={14} className="shrink-0" />
                     <span>[{flag.severity.toUpperCase()}] {flag.reason}</span>
                 </div>
             ))}
          </div>
      ) : (
          <div className="p-4 rounded-2xl border border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-900/10 flex items-center gap-3">
              <ShieldCheck size={18} className="text-green-600 dark:text-green-400" />
              <div className="text-xs font-bold text-green-700 dark:text-green-300">Monetization Safe</div>
          </div>
      )}

      {/* Retention Graph */}
      <div className="p-4 rounded-2xl border backdrop-blur-sm flex-1 min-h-[150px] dark:bg-[#1e293b]/80 dark:border-white/5 bg-white/80 border-slate-200">
        <h4 className="text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2 dark:text-slate-500 text-slate-400">
            <TrendingUp size={14} /> Predicted Retention
        </h4>
        <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.retentionData}>
                    <defs>
                        <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={creator.hex} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={creator.hex} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[60, 100]} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: creator.hex }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="retention" 
                        stroke={creator.hex} 
                        fillOpacity={1} 
                        fill="url(#colorRetention)" 
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Auto Fix Actions */}
      <div className="p-4 rounded-2xl border backdrop-blur-sm dark:bg-[#1e293b]/80 dark:border-white/5 bg-white/80 border-slate-200">
        <h4 className="text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2 dark:text-slate-500 text-slate-400">
            <Wand2 size={14} /> Optimizations
        </h4>
        <ul className="space-y-2 mb-4">
            {analysis.suggestions.map((sugg, i) => (
                <li key={i} className="text-xs leading-tight dark:text-slate-400 text-slate-600">• {sugg}</li>
            ))}
        </ul>
        <button 
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-500/20"
        >
             <Wand2 size={16} /> Auto-Apply Fixes
        </button>
      </div>
    </div>
  );
};

export default BoostPanel;