
import React from 'react';
import { ParticleModel } from '../types';

interface SidebarProps {
  currentModel: ParticleModel;
  onModelChange: (model: ParticleModel) => void;
  color: string;
  onColorChange: (color: string) => void;
  onOpenImageGen: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentModel,
  onModelChange,
  color,
  onColorChange,
  onOpenImageGen,
  onToggleFullscreen,
  isFullscreen
}) => {
  return (
    <div className="w-80 h-full p-6 flex flex-col pointer-events-auto bg-black/40 backdrop-blur-xl border-l border-white/10">
      <div className="mb-10">
        <h1 className="text-2xl font-light tracking-tighter text-white/90">ZEN<span className="font-semibold text-green-400">PARTICLE</span></h1>
        <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Aesthetic Interactive 3D</p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Model Selection */}
        <section>
          <h3 className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-widest">Morph Target</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ParticleModel).map((model) => (
              <button
                key={model}
                onClick={() => onModelChange(model)}
                className={`px-4 py-3 rounded-lg text-sm transition-all duration-300 border ${
                  currentModel === model
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </section>

        {/* Color Control */}
        <section>
          <h3 className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-widest">Particle Glow</h3>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-12 rounded-full cursor-pointer bg-transparent border-none"
            />
            <div className="flex flex-col">
              <span className="text-xs text-white/60">Selected HEX</span>
              <span className="text-sm font-mono text-white/90">{color.toUpperCase()}</span>
            </div>
          </div>
        </section>

        {/* Gemini Integration Affordance */}
        <section>
          <h3 className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-widest">AI Visualization</h3>
          <button
            onClick={onOpenImageGen}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-[1px] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="bg-black/80 w-full h-full py-4 rounded-[11px] flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors">
              <svg className="w-5 h-5 text-indigo-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-white/90">Gemini Nano Image</span>
            </div>
          </button>
        </section>
      </div>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-white/5 flex gap-4">
        <button 
          onClick={onToggleFullscreen}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/60 text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
          {isFullscreen ? 'Exit Full' : 'Fullscreen'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
