// src/components/SolarSystem/SolarSystem.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import { Vector3, Group, Color } from 'three';
import styles from './SolarSystem.module.css';
import celestialBodies from '@/lib/celestialData';
import { calculatePosition, getScaledRadius, calculateOrbitPoints } from '@/lib/calculations';
import Planet from './Planet';
import Controls from '@/components/Controls/Controls';
import { SolarSystemProvider } from './SolarSystemContext';

// 천체 궤도 시각화 컴포넌트
function Orbit({ celestialData }: { celestialData: any }) {
  // 궤도를 위한 포인트 계산
  const points = calculateOrbitPoints(celestialData);
  
  // 태양 또는 달은 궤도 표시 안 함
  if (celestialData.type === 'star' || celestialData.type === 'moon' || points.length === 0) {
    return null;
  }
  
  return (
    <Line
      points={points}
      color={new Color(0.5, 0.5, 0.5).lerp(new Color(celestialData.color), 0.3)}
      opacity={0.3}
      transparent
      lineWidth={1}
    />
  );
}

function ResetCamera({ onReset }: { onReset: () => void }) {
  const { camera, set } = useThree();
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r') onReset();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onReset]);
  
  return null;
}

// 행성 위치를 업데이트하는 컴포넌트
function CelestialSystem({ speedFactor = 1, showLabels = true }) {
  const [time, setTime] = useState(0);
  const groupRef = useRef<Group>(null);
  
  // 시간에 따라 위치 업데이트
  useFrame((_, delta) => {
    // 시간 흐름 속도 조절 (값이 클수록 빠름)
    setTime(prev => prev + delta * speedFactor);
  });
  
  return (
    <group ref={groupRef}>
      {/* 궤도 표시 */}
      {celestialBodies.map(body => (
        <Orbit 
          key={`orbit-${body.name}`} 
          celestialData={body} 
        />
      ))}
      
      {/* 천체 렌더링 */}
      {celestialBodies.map(body => {
        // 실제 시간 기반으로 위치 계산
        const position = calculatePosition(body, time);
        const scaledRadius = getScaledRadius(body.radius);
        
        return (
          <Planet
            key={body.name}
            position={position}
            radius={scaledRadius}
            celestialData={body}
            rotation={time}
            showLabel={showLabels}
          />
        );
      })}
    </group>
  );
}

// 현재 날짜 정보를 표시하는 컴포넌트
function DateDisplay({ simulationTime }: { simulationTime: number }) {
  // 시뮬레이션 시간을 실제 날짜에 매핑
  const simulatedDays = simulationTime * 10; // 1초당 10일이 지나가도록 조정
  const currentDate = new Date();
  // src/components/SolarSystem/SolarSystem.tsx (이어서)
  const simulatedDate = new Date(currentDate.getTime() + simulatedDays * 24 * 60 * 60 * 1000);
  
  return (
    <div className={styles.dateDisplay}>
      <span>현재 시뮬레이션 날짜: {simulatedDate.toLocaleDateString()}</span>
    </div>
  );
}

export default function SolarSystem() {
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [simulationTime, setSimulationTime] = useState(0);
  const controlsRef = useRef(null);
  
  // 시뮬레이션 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationTime(prev => prev + 0.016 * simulationSpeed); // 약 60fps
    }, 16);
    
    return () => clearInterval(timer);
  }, [simulationSpeed]);
  
  const handleResetView = () => {
    if (controlsRef.current) {
      // @ts-ignore - OrbitControls의 reset 메소드에 접근
      controlsRef.current.reset();
    }
  };
  
  return (
    <SolarSystemProvider>
      <div className={styles.container}>
        <div className={styles.canvas}>
          <Canvas camera={{ position: [0, 30, 50], fov: 45 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
            
            <CelestialSystem 
              speedFactor={simulationSpeed} 
              showLabels={showLabels} 
            />
            
            {/* 배경 별 */}
            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} />
            
            {/* 카메라 컨트롤 */}
            <OrbitControls 
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={150}
            />
            
            <ResetCamera onReset={handleResetView} />
          </Canvas>
        </div>
        
        <DateDisplay simulationTime={simulationTime} />
        
        <Controls 
          onSpeedChange={setSimulationSpeed}
          currentSpeed={simulationSpeed}
          onResetView={handleResetView}
          onToggleLabels={() => setShowLabels(!showLabels)}
          showLabels={showLabels}
        />
      </div>
    </SolarSystemProvider>
  );
}
