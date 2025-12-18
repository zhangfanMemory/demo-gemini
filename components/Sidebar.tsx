
import React from 'react';
import { ParticleModel } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentModel: ParticleModel;
  onModelChange: (model: ParticleModel) => void;
  color: string;
  onColorChange: (color: string) => void;
  onOpenImageGen: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentModel,
  onModelChange,
  color,
  onColorChange,
  onOpenImageGen,
  onToggleFullscreen,
  isFullscreen
}) => {
  return (
    <div className={`relative h-full flex transition-transform duration-500 ease-in-out pointer-events-none ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Toggle Button Handle */}
      <button 
        onClick={onToggle}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-10 h-24 bg-white/10 backdrop-blur-xl border border-r-0 border-white/10 rounded-l-2xl flex items-center justify-center pointer-events-auto group hover:bg-white/20 transition-colors"
      >
        <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-5 h-5 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      {/* Main Content */}
      <div className="w-72 md:w-80 h-full p-6 flex flex-col pointer-events-auto bg-black/60 backdrop-blur-2xl border-l border-white/10 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-light tracking-tighter text-white/90">
            ZEN<span className="font-semibold text-green-400">PARTICLE</span>
          </h1>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Aesthetic Interactive 3D</p>
        </div>

        <div className="space-y-6 flex-1">
          {/* Model Selection */}
          <section>
            <h3 className="text-[10px] font-semibold text-white/50 mb-3 uppercase tracking-widest">Morph Target</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ParticleModel).map((model) => (
                <button
                  key={model}
                  onClick={() => onModelChange(model)}
                  className={`px-2 py-2.5 rounded-lg text-xs transition-all duration-300 border ${
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
            <h3 className="text-[10px] font-semibold text-white/50 mb-3 uppercase tracking-widest">Particle Glow</h3>
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer bg-transparent border-none"
              />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60">Selected HEX</span>
                <span className="text-xs font-mono text-white/90">{color.toUpperCase()}</span>
              </div>
            </div>
          </section>

          {/* Gemini Integration */}
          <section>
            <h3 className="text-[10px] font-semibold text-white/50 mb-3 uppercase tracking-widest">AI Visualization</h3>
            <button
              onClick={onOpenImageGen}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-[1px] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="bg-black/80 w-full h-full py-3 rounded-[11px] flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors">
                <svg className="w-4 h-4 text-indigo-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium text-white/90">Gemini Image</span>
              </div>
            </button>
          </section>
        </div>

        {/* Footer Controls */}
        <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
          <button 
            onClick={onToggleFullscreen}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/60 text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {isFullscreen ? 'Exit' : 'Full'}
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
