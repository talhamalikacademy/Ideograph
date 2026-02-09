
import React from 'react';
import { DirectorPlan } from '../types';
import { Film, Music, Image, Scissors, Clock } from 'lucide-react';
import clsx from 'clsx';

interface DirectorPanelProps {
  data: DirectorPlan;
}

const DirectorPanel: React.FC<DirectorPanelProps> = ({ data }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white text-slate-900">
            <Film size={18} className="text-purple-500" /> Director Mode
        </h3>
        <p className="text-xs opacity-60 mt-1">
            Production-ready shot list and creative direction.
        </p>
      </div>

      {/* Mood & Music */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold text-xs uppercase tracking-widest">
              <Music size={12} /> Audio Direction
          </div>
          <p className="text-sm font-medium mb-2">{data.musicMood}</p>
          <p className="text-xs opacity-70 italic">{data.editingNotes}</p>
      </div>

      {/* Shot List */}
      <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Scissors size={14} /> Shot List
          </h4>
          <div className="space-y-4">
              {data.scenes.map((scene, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-purple-500/30">
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold uppercase text-purple-400">{scene.cameraDirection}</span>
                          <span className="text-[10px] opacity-50 flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                              <Clock size={10} /> {scene.timeStart} ({scene.duration})
                          </span>
                      </div>
                      <div className="text-xs mb-2 dark:text-slate-300 text-slate-700">
                          <span className="opacity-50 font-bold">Visual:</span> {scene.visualPrompt}
                      </div>
                      {scene.onScreenText && (
                          <div className="text-[10px] bg-white/5 p-2 rounded border border-white/5 text-center font-mono text-purple-300">
                              OVERLAY: "{scene.onScreenText}"
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Thumbnails */}
      <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Image size={14} /> Thumbnail Concepts
          </h4>
          <div className="space-y-3">
              {data.thumbnails.map((thumb, i) => (
                  <div key={i} className="p-3 rounded-xl border dark:border-white/5 bg-white dark:bg-white/5">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold opacity-50">Option {i + 1}</span>
                          <span className="text-[10px] font-bold text-green-500">Score: {thumb.score}</span>
                      </div>
                      <p className="text-xs mb-2">{thumb.description}</p>
                      <div className="text-xs font-black uppercase text-center bg-black/20 p-2 rounded">
                          {thumb.textOverlay}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default DirectorPanel;
