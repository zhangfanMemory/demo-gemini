
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, Canvas } from '@react-three/fiber';
import { ParticleModel, HandData } from '../types';

// Alias Three.js intrinsic elements
const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const PointsMaterial = 'pointsMaterial' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;

const PARTICLE_COUNT = 15000;

// Helper: 从文字生成像素点位
const getTextPoints = (text: string, fontSize: number = 120) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1200; // 稍微加宽以适应长句子
  canvas.height = 400; // 增加高度缓冲区
  ctx.fillStyle = 'white';
  ctx.font = `bold ${fontSize}px "Microsoft YaHei", "SimHei", "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const sampledPoints: { x: number, y: number }[] = [];
  
  // 增加采样步长（step=2），减少点位总数，确保粒子能覆盖到底部
  const step = 2; 
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = imageData[(y * canvas.width + x) * 4 + 3];
      if (alpha > 128) {
        sampledPoints.push({
          x: (x - canvas.width / 2) * 0.08,
          y: (canvas.height / 2 - y) * 0.08
        });
      }
    }
  }

  // 洗牌算法：打乱点位顺序
  // 这样即使粒子数少于点位数，粒子也会均匀分布在文字各处，而不是只堆积在顶部
  for (let i = sampledPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sampledPoints[i], sampledPoints[j]] = [sampledPoints[j], sampledPoints[i]];
  }

  return sampledPoints;
};

const getHeartPoint = (t: number) => {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return new THREE.Vector3(x, y, 0).multiplyScalar(0.5);
};

const getFlowerPoint = (t: number) => {
  const r = 8 * Math.cos(5 * t);
  const x = r * Math.cos(t);
  const y = r * Math.sin(t);
  const z = 2 * Math.sin(10 * t);
  return new THREE.Vector3(x, y, z);
};

const getSaturnPoint = (t: number, i: number) => {
  if (i < PARTICLE_COUNT * 0.6) {
    const phi = Math.acos(-1 + (2 * i) / (PARTICLE_COUNT * 0.6));
    const theta = Math.sqrt(PARTICLE_COUNT * 0.6 * Math.PI) * phi;
    return new THREE.Vector3(7 * Math.sin(phi) * Math.cos(theta), 7 * Math.sin(phi) * Math.sin(theta), 7 * Math.cos(phi));
  } else {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 5;
    return new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle) * 0.2, radius * Math.sin(angle));
  }
};

const getZenPoint = (t: number, i: number) => {
    const y = (Math.random() - 0.5) * 15;
    const width = Math.max(0.2, (1 - Math.abs(y / 7.5)) * 5);
    const angle = Math.random() * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * width * Math.random(), y, Math.sin(angle) * width * Math.random());
};

const getFireworkPoint = (t: number) => {
  const radius = Math.random() * 12;
  const phi = Math.random() * Math.PI * 2;
  const theta = Math.random() * Math.PI;
  return new THREE.Vector3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));
};

const getCakePoint = (t: number, i: number) => {
  const cakeParticles = PARTICLE_COUNT * 0.94;
  if (i < cakeParticles) {
    const tier = i % 3;
    let radius, height, yOffset;
    if (tier === 0) { radius = 9; height = 4.5; yOffset = -7; }
    else if (tier === 1) { radius = 6.5; height = 4.5; yOffset = -2.5; }
    else { radius = 4.5; height = 4; yOffset = 2; }
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    const h = Math.random() * height;
    return new THREE.Vector3(r * Math.cos(angle), h + yOffset, r * Math.sin(angle));
  } else if (i < PARTICLE_COUNT * 0.99) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.3;
    const h = Math.random() * 3.5;
    return new THREE.Vector3(r * Math.cos(angle), h + 6, r * Math.sin(angle));
  } else {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.8;
    const h = Math.random() * 1.5;
    return new THREE.Vector3(r * Math.cos(angle) * 0.5, h + 9.5, r * Math.sin(angle) * 0.5);
  }
};

const getCelebrationPoint = (t: number, i: number) => {
    if (i < PARTICLE_COUNT * 0.5) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10 - 5;
        const z = (Math.random() - 0.5) * 10;
        return new THREE.Vector3(x, y, z);
    } else if (i < PARTICLE_COUNT * 0.6) {
        const isHorizontal = Math.random() > 0.5;
        if (isHorizontal) {
            return new THREE.Vector3((Math.random() - 0.5) * 11, -5 + (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 11);
        } else {
            return new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 11 - 5, (Math.random() - 0.5) * 11);
        }
    } else {
        const balloonIndex = i % 3;
        const offsets = [
            new THREE.Vector3(-4, 8, 0),
            new THREE.Vector3(4, 10, 2),
            new THREE.Vector3(0, 12, -3)
        ];
        const offset = offsets[balloonIndex];
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const r = Math.random() * 3.5;
        return new THREE.Vector3(r * Math.sin(theta) * Math.cos(phi) + offset.x, r * Math.sin(theta) * Math.sin(phi) + offset.y, r * Math.cos(theta) + offset.z);
    }
};

const Particles: React.FC<{ model: ParticleModel; color: string; handData: HandData | null }> = ({ model, color, handData }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const targetPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  
  // 提前计算各个文字模式的点位
  const bdayTextPoints = useMemo(() => getTextPoints("生日快乐"), []);
  const bdayEnTextPoints = useMemo(() => getTextPoints("Happy Birthday", 100), []);
  const duMengjiePoints = useMemo(() => getTextPoints("杜梦洁，生日快乐", 80), []); // 稍微减小字号确保完整性
  
  useEffect(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
  }, [positions]);

  useEffect(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = (i / PARTICLE_COUNT) * Math.PI * 2;
      let p = new THREE.Vector3();
      
      switch (model) {
        case ParticleModel.HEART: p = getHeartPoint(t * 10); break;
        case ParticleModel.FLOWER: p = getFlowerPoint(t * 5); break;
        case ParticleModel.SATURN: p = getSaturnPoint(t, i); break;
        case ParticleModel.BUDDHA: p = getZenPoint(t, i); break;
        case ParticleModel.FIREWORKS: p = getFireworkPoint(t); break;
        case ParticleModel.CAKE: p = getCakePoint(t, i); break;
        case ParticleModel.CELEBRATION: p = getCelebrationPoint(t, i); break;
        case ParticleModel.TEXT_BDAY: {
            const textPt = bdayTextPoints[i % bdayTextPoints.length];
            p.set(textPt.x, textPt.y, (Math.random() - 0.5) * 2);
            break;
        }
        case ParticleModel.TEXT_BDAY_EN: {
            const textPt = bdayEnTextPoints[i % bdayEnTextPoints.length];
            p.set(textPt.x, textPt.y, (Math.random() - 0.5) * 2);
            break;
        }
        case ParticleModel.TEXT_DUMENGJIE: {
            const textPt = duMengjiePoints[i % duMengjiePoints.length];
            p.set(textPt.x, textPt.y, (Math.random() - 0.5) * 2);
            break;
        }
      }
      
      targetPositions[i * 3] = p.x;
      targetPositions[i * 3 + 1] = p.y;
      targetPositions[i * 3 + 2] = p.z;
    }
  }, [model, targetPositions, bdayTextPoints, bdayEnTextPoints, duMengjiePoints]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    const expansion = handData ? handData.span * 2.5 : 1.0;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posAttr.array[i3] += (targetPositions[i3] * expansion - (posAttr.array[i3] as number)) * 0.08;
      posAttr.array[i3+1] += (targetPositions[i3+1] * expansion - (posAttr.array[i3+1] as number)) * 0.08;
      posAttr.array[i3+2] += (targetPositions[i3+2] * expansion - (posAttr.array[i3+2] as number)) * 0.08;
      
      posAttr.array[i3] = (posAttr.array[i3] as number) + Math.sin(time + i) * 0.01;
      posAttr.array[i3+1] = (posAttr.array[i3+1] as number) + Math.cos(time + i) * 0.01;
    }
    
    posAttr.needsUpdate = true;
    
    // 在显示文字模式时，减缓旋转速度以保证可读性
    const isTextModel = model === ParticleModel.TEXT_BDAY || 
                       model === ParticleModel.TEXT_BDAY_EN ||
                       model === ParticleModel.TEXT_DUMENGJIE;
    const rotationSpeed = isTextModel ? 0.0005 : 0.002;
    pointsRef.current.rotation.y += rotationSpeed;
  });

  return (
    <Points ref={pointsRef}>
      <BufferGeometry>
        <BufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </BufferGeometry>
      <PointsMaterial size={0.08} color={color} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </Points>
  );
};

const ParticleCanvas: React.FC<{ model: ParticleModel; color: string; handData: HandData | null }> = (props) => {
  return (
    <div className="w-full h-full bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <AmbientLight intensity={0.5} />
        <PointLight position={[10, 10, 10]} />
        <Particles {...props} />
      </Canvas>
    </div>
  );
};

export default ParticleCanvas;
