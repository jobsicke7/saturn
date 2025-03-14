// src/components/SolarSystem/Planet.tsx
'use client';

import { useRef, useState, useContext } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader, Mesh, Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { CelestialBodyData } from '@/lib/celestialData';
import styles from './SolarSystem.module.css';
import { SolarSystemContext } from './SolarSystemContext';

interface PlanetProps {
  position: Vector3;
  radius: number;
  celestialData: CelestialBodyData;
  rotation: number;
  showLabel?: boolean;
}

export default function Planet({ 
  position, 
  radius, 
  celestialData, 
  rotation,
  showLabel = true 
}: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { camera } = useThree();
  const { setTrackedPlanet, trackedPlanet } = useContext(SolarSystemContext);
  
  const isTracked = trackedPlanet === celestialData.name;

  // 행성의 텍스처 로드 (있을 경우)
  let texture;
  try {
    if (celestialData.textureMap) {
      texture = useLoader(TextureLoader, celestialData.textureMap);
    }
  } catch (error) {
    console.error(`Failed to load texture for ${celestialData.name}:`, error);
  }

  // 행성 자전 애니메이션과 카메라 트래킹
  useFrame(() => {
    if (meshRef.current && celestialData.rotationPeriod !== 0) {
      // 자전 속도 조정 (음수면 역회전)
      const rotationSpeed = (celestialData.rotationPeriod > 0 ? 1 : -1) * 0.001;
      meshRef.current.rotation.y += rotationSpeed;
    }
    
    // 행성이 트래킹 중이면 카메라가 따라감
    if (isTracked && position) {
      const offset = new Vector3(position.x, position.y + radius * 5, position.z + radius * 10);
      camera.position.lerp(offset, 0.02);
      camera.lookAt(position);
    }
  });
  
  // 행성 더블클릭 핸들러
  const handleDoubleClick = () => {
    if (isTracked) {
      // 이미 추적 중이면 추적 해제
      setTrackedPlanet(null);
    } else {
      // 다른 행성 추적 시작
      setTrackedPlanet(celestialData.name);
    }
  };

  // 태양 발광 효과 조정
  const getSunEmissiveIntensity = () => {
    if (celestialData.type === 'star') {
      return 1.0; // 발광 강도 약하게 조정
    } else if (isTracked) {
      return 0.2; // 추적 중인 행성 강조
    }
    return 0;
  };

  // 토성 고리 컴포넌트
  const SaturnRings = () => {
    return (
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.4, radius * 2, 64]} />
        <meshBasicMaterial 
          color="#E8E6D2" 
          opacity={0.7} 
          transparent={true} 
          side={2}
        />
      </mesh>
    );
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setShowInfo(!showInfo)}
        onDoubleClick={handleDoubleClick}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        {texture ? (
          <meshStandardMaterial 
            map={texture}
            emissive={isTracked ? "white" : (celestialData.type === 'star' ? celestialData.color : undefined)}
            emissiveIntensity={getSunEmissiveIntensity()}
          />
        ) : (
          <meshStandardMaterial 
            color={celestialData.color} 
            emissive={isTracked ? "white" : (celestialData.type === 'star' ? celestialData.color : undefined)}
            emissiveIntensity={getSunEmissiveIntensity()}
          />
        )}
        
        {/* 태양 발광 효과 (조정됨) */}
        {celestialData.type === 'star' && (
          <pointLight color="#FDB813" intensity={1.5} distance={100} />
        )}
        
        {/* 토성 고리 추가 */}
        {celestialData.name === '토성' && <SaturnRings />}
        
        {/* 호버 시 라벨 표시 또는 트래킹 중일 때 표시 */}
        {(hovered || isTracked || celestialData.type === 'star') && showLabel && (
          <Html distanceFactor={10}>
            <div className={`${styles.planetLabel} ${isTracked ? styles.tracked : ''} ${celestialData.type === 'star' ? styles.starLabel : ''}`}>
              {celestialData.name}
              {isTracked && ' (트래킹 중)'}
            </div>
          </Html>
        )}
        
        {/* 클릭했을 때 정보 패널 */}
        {showInfo && (
          <Html distanceFactor={15}>
            <div className={styles.infoCard}>
              <h3>{celestialData.name}</h3>
              <p>반지름: {celestialData.radius.toLocaleString()} km</p>
              <p>태양과의 거리: {celestialData.distanceFromSun.toLocaleString()} 백만 km</p>
              <p>공전 주기: {celestialData.orbitalPeriod.toLocaleString()} 일</p>
              <p>자전 주기: {Math.abs(celestialData.rotationPeriod / 24).toFixed(2)} 일</p>
              {celestialData.rotationPeriod < 0 && <p>역행 자전</p>}
              <p className={styles.hint}>더블클릭: 행성 추적 시작/종료</p>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}
