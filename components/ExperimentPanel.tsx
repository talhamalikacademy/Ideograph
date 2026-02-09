
import React from 'react';
import { ExperimentVariant } from '../types';
import { FlaskConical, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface ExperimentPanelProps {
  data: ExperimentVariant[];
}

const ExperimentPanel: React.FC<ExperimentPanelProps> = ({ data }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white text-slate-900">
            <FlaskConical size={18} className="text-emerald-500" /> Experiment Lab
        </h3>
        <p className="text-xs opacity-60 mt-1">
            A/B test variants to maximize virality.
        </p>
      </div>

      <div className="space-y-4">
          {data.map((variant, i) => (
              <div key={i} className={clsx(
                  "p-4 rounded-xl border transition-all relative overflow-hidden",
                  variant.predictedWinner 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/5"
              )}>
                  {variant.predictedWinner && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">
                          PREDICTED WINNER
                      </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 bg-white/10 px-1.5 py-0.5 rounded">
                          {variant.type}
                      </span>
                  </div>

                  <p className="text-sm font-medium mb-3 dark:text-slate-200 text-slate-800">
                      {variant.reason}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-bold mb-4">
                      <TrendingUp size={14} className={variant.predictedWinner ? "text-emerald-500" : "opacity-50"} />
                      <span>{variant.confidence}% Confidence</span>
                  </div>

                  <button className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center justify-center gap-2">
                      <Sparkles size={12} /> Generate Full Variant
                  </button>
              </div>
          ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-dashed dark:border-white/10 text-center">
          <p className="text-[10px] opacity-60 mb-2">
              Connect YouTube Analytics to run live A/B tests on thumbnails and titles.
          </p>
          <button className="text-xs font-bold text-indigo-500 hover:underline">
              Connect Account
          </button>
      </div>
    </div>
  );
};

export default ExperimentPanel;
