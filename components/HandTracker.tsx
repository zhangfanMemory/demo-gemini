
import React, { useEffect, useRef, useState } from 'react';
import { HandData } from '../types';

const HANDS_JS_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
const DRAW_UTILS_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';

interface HandTrackerProps {
  onHandUpdate: (data: HandData | null) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handsRef = useRef<any>(null);
  // Fix: Provide initial value for useRef to satisfy environment requirements expecting at least 1 argument
  const requestRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    const loadScript = (url: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      try {
        // 1. 加载 MediaPipe 脚本
        await Promise.all([
          loadScript(HANDS_JS_URL),
          loadScript(DRAW_UTILS_URL)
        ]);

        if (!isMounted) return;

        // 2. 初始化 Hands
        // @ts-ignore
        const { Hands } = window;
        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        hands.onResults((results: any) => {
          if (!isMounted) return;
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // 绘制关键点（可选，有助于调试）
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    // @ts-ignore
                    const { drawConnectors, drawLandmarks } = window;
                    // @ts-ignore
                    const { HAND_CONNECTIONS } = window;
                    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                    drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 2 });
                }
            }

            // 计算张合度：计算指尖到掌心（关键点9）的平均距离
            const palmCenter = landmarks[9];
            const fingerTips = [4, 8, 12, 16, 20];
            let avgDist = 0;
            fingerTips.forEach(idx => {
              const tip = landmarks[idx];
              avgDist += Math.sqrt(
                Math.pow(tip.x - palmCenter.x, 2) + 
                Math.pow(tip.y - palmCenter.y, 2)
              );
            });
            avgDist /= 5;

            // 归一化：握拳约为 0.1，张开约为 0.4
            const normalizedSpan = Math.min(Math.max((avgDist - 0.1) / 0.3, 0.3), 3.0);

            onHandUpdate({
              isOpen: normalizedSpan > 0.8,
              span: normalizedSpan,
              centerX: palmCenter.x,
              centerY: palmCenter.y
            });
          } else {
            onHandUpdate(null);
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        });

        handsRef.current = hands;

        // 3. 获取摄像头权限并开始播放
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setLoading(false);

        // 4. 循环检测
        const detect = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await hands.send({ image: videoRef.current });
          }
          requestRef.current = requestAnimationFrame(detect);
        };
        detect();

      } catch (err: any) {
        console.error("Camera Init Error:", err);
        setError(err.message || "无法访问摄像头");
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handsRef.current) handsRef.current.close();
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onHandUpdate]);

  return (
    <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-[10px] text-white/50 uppercase tracking-tighter">Initializing Camera</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-red-950/50 p-4 text-center">
          <span className="text-[10px] text-red-300 uppercase leading-tight">{error}</span>
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        muted
        playsInline
      />
      
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none opacity-50"
      />
      
      <div className="absolute top-2 right-2 flex gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
      </div>
    </div>
  );
};

export default HandTracker;
