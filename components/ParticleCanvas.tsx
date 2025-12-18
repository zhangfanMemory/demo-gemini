
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, Canvas } from '@react-three/fiber';
import { ParticleModel, HandData } from '../types';

// Alias Three.js intrinsic elements to Uppercase variables to bypass JSX type check issues in some environments
const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const PointsMaterial = 'pointsMaterial' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;

const PARTICLE_COUNT = 15000;

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
    // Planet
    const phi = Math.acos(-1 + (2 * i) / (PARTICLE_COUNT * 0.6));
    const theta = Math.sqrt(PARTICLE_COUNT * 0.6 * Math.PI) * phi;
    return new THREE.Vector3(
      7 * Math.sin(phi) * Math.cos(theta),
      7 * Math.sin(phi) * Math.sin(theta),
      7 * Math.cos(phi)
    );
  } else {
    // Rings
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 5;
    return new THREE.Vector3(
      radius * Math.cos(angle),
      radius * Math.sin(angle) * 0.2, // Tilt
      radius * Math.sin(angle)
    );
  }
};

const getZenPoint = (t: number, i: number) => {
    // A simplified silhouette of a seated figure
    const y = (Math.random() - 0.5) * 15;
    const width = Math.max(0.2, (1 - Math.abs(y / 7.5)) * 5);
    const angle = Math.random() * Math.PI * 2;
    return new THREE.Vector3(
        Math.cos(angle) * width * Math.random(),
        y,
        Math.sin(angle) * width * Math.random()
    );
};

const getFireworkPoint = (t: number) => {
  const radius = Math.random() * 12;
  const phi = Math.random() * Math.PI * 2;
  const theta = Math.random() * Math.PI;
  return new THREE.Vector3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta)
  );
};

const Particles: React.FC<{ model: ParticleModel; color: string; handData: HandData | null }> = ({ model, color, handData }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  // Base positions
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const targetPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  
  // Random initial positions
  useEffect(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
  }, [positions]);

  // Update target positions when model changes
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
      }
      
      targetPositions[i * 3] = p.x;
      targetPositions[i * 3 + 1] = p.y;
      targetPositions[i * 3 + 2] = p.z;
    }
  }, [model, targetPositions]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    
    // Hand span influence: 0.5 is neutral, >0.5 is expansion, <0.5 is contraction
    const expansion = handData ? handData.span * 2.5 : 1.0;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Morphing interpolation
      // Add explicit casting to number for TypedArray elements to avoid arithmetic errors
      posAttr.array[i3] += (targetPositions[i3] * expansion - (posAttr.array[i3] as number)) * 0.08;
      posAttr.array[i3+1] += (targetPositions[i3+1] * expansion - (posAttr.array[i3+1] as number)) * 0.08;
      posAttr.array[i3+2] += (targetPositions[i3+2] * expansion - (posAttr.array[i3+2] as number)) * 0.08;
      
      // Subtle float animation
      posAttr.array[i3] = (posAttr.array[i3] as number) + Math.sin(time + i) * 0.01;
      posAttr.array[i3+1] = (posAttr.array[i3+1] as number) + Math.cos(time + i) * 0.01;
    }
    
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += 0.002;
  });

  return (
    <Points ref={pointsRef}>
      <BufferGeometry>
        <BufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </BufferGeometry>
      <PointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
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
