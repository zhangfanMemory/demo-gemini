
import React, { useState, useCallback, useEffect } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import HandTracker from './components/HandTracker';
import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';
import { ParticleModel, HandData } from './types';

const App: React.FC = () => {
  const [currentModel, setCurrentModel] = useState<ParticleModel>(ParticleModel.HEART);
  const [particleColor, setParticleColor] = useState<string>('#4ade80');
  const [handData, setHandData] = useState<HandData | null>(null);
  const [showImageGen, setShowImageGen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {/* 3D Background */}
      <ParticleCanvas 
        model={currentModel} 
        color={particleColor} 
        handData={handData} 
      />

      {/* Camera Feed Container */}
      <div className="absolute top-6 left-6 w-56 h-40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900/50 backdrop-blur-sm z-30 group transition-all duration-500 hover:border-green-500/50">
        <HandTracker onHandUpdate={setHandData} />
        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-white/70 uppercase tracking-widest text-center">Hand Motion Sensor</p>
        </div>
      </div>

      {/* UI Controls - Right Panel */}
      <div className="absolute right-0 top-0 h-full z-40 pointer-events-none">
        <Sidebar 
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          color={particleColor}
          onColorChange={setParticleColor}
          onOpenImageGen={() => setShowImageGen(true)}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </div>

      {/* Gemini Image Generator Modal */}
      {showImageGen && (
        <ImageGenerator onClose={() => setShowImageGen(false)} />
      )}

      {/* Overlay info */}
      <div className="absolute bottom-6 left-6 pointer-events-none text-white/30 text-[10px] z-20">
        <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${handData ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-white/20'}`} />
            <p className="font-light tracking-[0.2em] uppercase">
                {handData ? 'Tracking Active' : 'Waiting for Gesture'}
            </p>
        </div>
        <p className="tracking-widest opacity-50">ZENPARTICLE V1.0 • ENGINE: THREE.JS + MEDIAPIPE</p>
      </div>
    </div>
  );
};

export default App;
