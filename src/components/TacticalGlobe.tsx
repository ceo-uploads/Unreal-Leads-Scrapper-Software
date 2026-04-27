import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

function Earth({ onPointClick }: { onPointClick: (lat: number, lng: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  
  // Use public high-res textures
  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  ]);

  useFrame((_state, delta) => {
    meshRef.current.rotation.y += delta * 0.05;
    cloudsRef.current.rotation.y += delta * 0.08;
  });

  const handleClick = (e: any) => {
    const point = e.point.clone().normalize();
    
    // Convert 3D point to Lat/Lng
    const lat = Math.asin(point.y) * (180 / Math.PI);
    const lng = Math.atan2(point.z, point.x) * (180 / Math.PI);
    
    // Adjust longitude (Three.js Z is forward, X is right)
    onPointClick(lat, -lng + 90); 
  };

  return (
    <>
      <mesh ref={meshRef} onClick={handleClick} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={10}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default function TacticalGlobe({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  return (
    <div className="w-full h-full bg-black relative">
      <Canvas shadows={{ type: THREE.PCFShadowMap }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2.5} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
        
        <Stars radius={300} depth={60} count={15000} factor={7} saturation={0} fade speed={1} />
        
        <Earth onPointClick={onLocationSelect} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={3} 
          maxDistance={12} 
          rotateSpeed={1.0}
          autoRotate={false}
          makeDefault
        />

        <Html position={[0, 2.5, 0]} center>
          <div className="glass-dark px-4 py-2 rounded-xl border border-brand-primary/30 text-white/80 text-[10px] uppercase font-black tracking-[0.2em] pointer-events-none whitespace-nowrap">
            Orbital Overview Active
          </div>
        </Html>
      </Canvas>
      
      <div className="absolute bottom-10 left-10 pointer-events-none">
        <div className="flex flex-col gap-2">
            <div className="text-[10px] font-black tracking-widest text-[#00f2ff] uppercase drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">Neural Earth Engine v4.0</div>
            <div className="text-white/80 text-[11px] font-mono font-bold tracking-tight">
              LEFT MOUSE: <span className="text-white">ROTATE ORBIT</span> <br/>
              SCROLL: <span className="text-white">ZOOM ALTITUDE</span> <br/>
              CLICK SECTOR: <span className="text-white">DEPLOY SURFACE PROBE</span>
            </div>
        </div>
      </div>
    </div>
  );
}
