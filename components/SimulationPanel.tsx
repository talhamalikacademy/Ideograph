
import React from 'react';
import { SimulationResult } from '../types';
import { Users, TrendingDown, Thermometer, User, Zap } from 'lucide-react';
import clsx from 'clsx';

interface SimulationPanelProps {
  data: SimulationResult;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ data }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white text-slate-900">
            <Users size={18} className="text-amber-500" /> Audience Simulator
        </h3>
        <p className="text-xs opacity-60 mt-1">
            Predicted results from 500 simulated viewer personas.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <div className="text-3xl font-bold text-amber-500 mb-1">{data.predictedRetention}%</div>
          <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Predicted Retention @ 30s</div>
      </div>

      {/* Heatmap */}
      <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Thermometer size={14} /> Attention Heatmap
          </h4>
          <div className="space-y-1">
              {data.retentionHeatmap.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-mono opacity-50 w-8">{point.second}s</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={clsx("h-full", point.score > 80 ? "bg-green-500" : point.score > 50 ? "bg-yellow-500" : "bg-red-500")}
                            style={{ width: `${point.score}%` }}
                          />
                      </div>
                      <span className="font-bold w-6">{point.score}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* Persona Reactions */}
      <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <User size={14} /> Viewer Reactions
          </h4>
          <div className="space-y-3">
              {data.personas.map((persona, i) => (
                  <div key={i} className="p-3 rounded-xl border dark:border-white/5 bg-white dark:bg-white/5 text-xs">
                      <div className="flex justify-between font-bold mb-1">
                          <span className="text-indigo-400">{persona.demographic}</span>
                          <span className="opacity-50">Drop: {persona.dropPointTime}</span>
                      </div>
                      <p className="italic opacity-70 mb-2">"{persona.reaction}"</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                          <TrendingDown size={10} /> Trigger: {persona.emotionalTrigger}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Micro Fixes */}
      <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-indigo-500">
              <Zap size={14} /> Suggested Micro-Fixes
          </h4>
          <div className="space-y-3">
              {data.microFixes.map((fix, i) => (
                  <div key={i} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs">
                      <div className="mb-2 opacity-50 line-through">{fix.original}</div>
                      <div className="font-bold text-indigo-400 mb-2">{fix.fix}</div>
                      <div className="text-[10px] bg-green-500/20 text-green-500 inline-block px-2 py-0.5 rounded font-bold">
                          Impact: {fix.impact}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
