
import React from 'react';
import { Citation, ScriptData } from '../types';
import { BookOpen, ShieldCheck, AlertTriangle, ExternalLink, FileText } from 'lucide-react';
import clsx from 'clsx';

interface EvidencePanelProps {
  data: Citation[];
  script: ScriptData;
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({ data, script }) => {
  const highConfidenceCount = data.filter(c => c.reliabilityScore === 'High').length;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white text-slate-900">
            <BookOpen size={18} className="text-blue-500" /> Evidence Navigator
        </h3>
        <p className="text-xs opacity-60 mt-1">
            Trace factual claims to verified sources.
        </p>
      </div>

      <div className="flex gap-2">
          <div className="flex-1 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-2xl font-bold text-blue-500">{data.length}</div>
              <div className="text-[9px] uppercase font-bold opacity-60">Claims Cited</div>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-2xl font-bold text-emerald-500">{highConfidenceCount}</div>
              <div className="text-[9px] uppercase font-bold opacity-60">High Trust</div>
          </div>
      </div>

      <div className="space-y-4">
          {data.map((cite, i) => (
              <div key={i} className="p-4 rounded-xl border dark:border-white/5 bg-white dark:bg-white/5 transition-all hover:border-blue-500/30">
                  <div className="flex items-start justify-between mb-2">
                      <div className={clsx(
                          "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                          cite.reliabilityScore === 'High' ? "bg-green-500/20 text-green-500" :
                          cite.reliabilityScore === 'Medium' ? "bg-yellow-500/20 text-yellow-500" :
                          "bg-red-500/20 text-red-500"
                      )}>
                          {cite.reliabilityScore} Trust
                      </div>
                      <div className="text-[10px] opacity-50 uppercase flex items-center gap-1">
                          {cite.type}
                      </div>
                  </div>
                  
                  <div className="mb-2">
                      <p className="text-xs italic opacity-70 mb-1">"{cite.context}"</p>
                      <div className="h-px bg-white/5 w-full my-2" />
                      <div className="text-sm font-bold dark:text-slate-200 text-slate-800">{cite.sourceName}</div>
                  </div>

                  {cite.url && (
                      <a href={cite.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                          <ExternalLink size={12} /> Verify Source
                      </a>
                  )}
              </div>
          ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border dark:border-white/5 text-center">
          <ShieldCheck size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-[10px] opacity-60">
              All claims are cross-referenced with simulated knowledge graph.
              <br/>Always verify critical data before publishing.
          </p>
      </div>
    </div>
  );
};

export default EvidencePanel;
