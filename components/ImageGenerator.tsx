
import React, { useState } from 'react';
import { generateGeminiImage } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';

interface ImageGeneratorProps {
  onClose: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = await generateGeminiImage(prompt, aspectRatio, imageSize);
      setResultImage(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Settings Panel */}
        <div className="p-8 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Gemini Nano 3</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
            </button>
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Prompt</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-32 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Describe your visualization..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Ratio</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              >
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="4:3">4:3</option>
                <option value="21:9">21:9</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Size</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
              >
                <option value="1K">1K</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              loading 
                ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {loading ? 'Thinking...' : 'Generate Image'}
          </button>

          <p className="text-[10px] text-white/30 text-center">
            *Requires a paid GCP project. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-white/50">Billing Docs</a>
          </p>
        </div>

        {/* Result Area */}
        <div className="flex-1 bg-black/20 p-8 flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-white/40 text-sm tracking-widest uppercase">Synthesizing Pixels</p>
            </div>
          ) : resultImage ? (
            <div className="w-full h-full flex flex-col items-center">
              <img src={resultImage} alt="AI Result" className="max-w-full max-h-[60vh] rounded-lg shadow-2xl border border-white/5 object-contain" />
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = resultImage;
                  link.download = 'gemini-gen.png';
                  link.click();
                }}
                className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2}/></svg>
                Download Masterpiece
              </button>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <p className="text-sm font-medium">Generation Error</p>
              <p className="text-xs mt-1 opacity-70">{error}</p>
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-20">
              <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm tracking-tighter">Your creation will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
