// src/lib/calculations.ts
import { Vector3 } from 'three';
import { CelestialBodyData } from './celestialData';

// 천문 단위(AU)를 Scene 단위로 변환
const AU_TO_SCENE_SCALE = 10; // 시각화를 위한 스케일 조정

// 행성 반지름 스케일링
export function getScaledRadius(actualRadius: number): number {
  // 태양을 더 작게, 작은 행성들을 더 크게 표현하기 위한 로그 스케일링
  if (actualRadius > 100000) { // 태양
    return Math.log10(actualRadius) * 0.5;
  } else if (actualRadius > 20000) { // 가스 행성
    return Math.log10(actualRadius) * 0.6;
  } else if (actualRadius > 5000) { // 지구형 행성
    return Math.log10(actualRadius) * 0.7;
  } else { // 작은 행성들(수성, 명왕성, 달 등)
    return Math.max(0.3, Math.log10(actualRadius) * 0.8); // 최소 크기 보장
  }
}

// 케플러 방정식 해결 (뉴턴 반복법)
function solveKeplerEquation(meanAnomaly: number, eccentricity: number): number {
  // 평균근점이각을 라디안으로 변환
  meanAnomaly = meanAnomaly * Math.PI / 180;
  
  // 평균근점이각을 -π에서 π 사이로 정규화
  meanAnomaly = meanAnomaly % (2 * Math.PI);
  if (meanAnomaly < 0) meanAnomaly += 2 * Math.PI;
  
  // 초기값은 평균근점이각 또는 이심률이 높은 경우 더 좋은 추정값
  let eccentricAnomaly = 
    eccentricity < 0.8 ? meanAnomaly : Math.PI;
  
  let delta = 1.0;
  // 뉴턴-랩슨 방법으로 이심근점이각 계산
  for (let i = 0; i < 30 && Math.abs(delta) > 1e-12; i++) {
    delta = (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) /
            (1.0 - eccentricity * Math.cos(eccentricAnomaly));
    eccentricAnomaly -= delta;
  }
  
  return eccentricAnomaly;
}

// 도를 라디안으로 변환
function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

// 현재 날짜에 대한 천체의 실제 위치 계산
export function calculateRealPosition(celestialData: CelestialBodyData, currentDate = new Date()): Vector3 {
  if (celestialData.type === 'star') {
    return new Vector3(0, 0, 0); // 태양은 중심
  }
  
  // src/lib/calculations.ts (이어서)
  if (celestialData.type === 'moon') {
    // 달은 지구 주변을 공전하는 특별한 경우로 처리
    // 부모 행성(지구)의 위치를 먼저 계산
    const parentPlanet = celestialBodies.find(body => body.name === celestialData.parent);
    if (!parentPlanet) return new Vector3(0, 0, 0);
    
    const parentPosition = calculateRealPosition(parentPlanet, currentDate);
    
    // 달의 공전 계산
    const epochDiffDays = (currentDate.getTime() - celestialData.epochDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // 평균근점이각 계산 (초기값 + 하루당 움직이는 각도 * 경과일)
    const orbitalPeriodDays = celestialData.orbitalPeriod;
    const dailyMotion = 360 / orbitalPeriodDays; // 하루당 움직이는 각도
    let meanAnomaly = (celestialData.meanAnomalyAtEpoch + dailyMotion * epochDiffDays) % 360;
    
    // 케플러 방정식 해결
    const eccentricAnomaly = solveKeplerEquation(meanAnomaly, celestialData.eccentricity);
    
    // 이심근점이각에서 실제 위치 계산
    const semiMajorAxisScaled = celestialData.semiMajorAxis * AU_TO_SCENE_SCALE;
    const xPrime = semiMajorAxisScaled * (Math.cos(eccentricAnomaly) - celestialData.eccentricity);
    const yPrime = semiMajorAxisScaled * Math.sqrt(1 - celestialData.eccentricity * celestialData.eccentricity) * Math.sin(eccentricAnomaly);
    
    // 달은 궤도 기울기를 고려하지만 단순화된 모델을 사용
    const inclRad = degToRad(celestialData.inclination);
    const nodeRad = degToRad(celestialData.longitudeOfAscendingNode);
    const periRad = degToRad(celestialData.argumentOfPerihelion);
    
    // 궤도면 회전 적용
    const xNode = xPrime * (Math.cos(periRad) * Math.cos(nodeRad) - Math.sin(periRad) * Math.cos(inclRad) * Math.sin(nodeRad))
                - yPrime * (Math.sin(periRad) * Math.cos(nodeRad) + Math.cos(periRad) * Math.cos(inclRad) * Math.sin(nodeRad));
    
    const yNode = xPrime * (Math.cos(periRad) * Math.sin(nodeRad) + Math.sin(periRad) * Math.cos(inclRad) * Math.cos(nodeRad))
                + yPrime * (Math.cos(periRad) * Math.cos(inclRad) * Math.cos(nodeRad) - Math.sin(periRad) * Math.sin(nodeRad));
    
    const zNode = xPrime * Math.sin(periRad) * Math.sin(inclRad) + yPrime * Math.cos(periRad) * Math.sin(inclRad);
    
    // 지구 주변의 상대 위치를 계산
    const moonPosition = new Vector3(xNode, zNode, yNode);
    
    // 지구의 위치에 달의 상대 위치를 더함
    return new Vector3(
      parentPosition.x + moonPosition.x * 0.3, // 시각화를 위해 달-지구 거리 조정
      parentPosition.y + moonPosition.y * 0.3, 
      parentPosition.z + moonPosition.z * 0.3
    );
  }
  
  // 행성의 공전 계산
  const epochDiffDays = (currentDate.getTime() - celestialData.epochDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // 평균근점이각 계산 (초기값 + 하루당 움직이는 각도 * 경과일)
  const orbitalPeriodDays = celestialData.orbitalPeriod;
  const dailyMotion = 360 / orbitalPeriodDays; // 하루당 움직이는 각도
  let meanAnomaly = (celestialData.meanAnomalyAtEpoch + dailyMotion * epochDiffDays) % 360;
  
  // 케플러 방정식 해결
  const eccentricAnomaly = solveKeplerEquation(meanAnomaly, celestialData.eccentricity);
  
  // 이심근점이각에서 실제 위치 계산
  const semiMajorAxisScaled = celestialData.semiMajorAxis * AU_TO_SCENE_SCALE;
  const xPrime = semiMajorAxisScaled * (Math.cos(eccentricAnomaly) - celestialData.eccentricity);
  const yPrime = semiMajorAxisScaled * Math.sqrt(1 - celestialData.eccentricity * celestialData.eccentricity) * Math.sin(eccentricAnomaly);
  
  // 궤도면 회전 적용 (공전궤도 기울기, 승교점 경도, 근일점 편각)
  const inclRad = degToRad(celestialData.inclination);
  const nodeRad = degToRad(celestialData.longitudeOfAscendingNode);
  const periRad = degToRad(celestialData.argumentOfPerihelion);
  
  // 궤도면 회전 적용
  const xNode = xPrime * (Math.cos(periRad) * Math.cos(nodeRad) - Math.sin(periRad) * Math.cos(inclRad) * Math.sin(nodeRad))
              - yPrime * (Math.sin(periRad) * Math.cos(nodeRad) + Math.cos(periRad) * Math.cos(inclRad) * Math.sin(nodeRad));
  
  const yNode = xPrime * (Math.cos(periRad) * Math.sin(nodeRad) + Math.sin(periRad) * Math.cos(inclRad) * Math.cos(nodeRad))
              + yPrime * (Math.cos(periRad) * Math.cos(inclRad) * Math.cos(nodeRad) - Math.sin(periRad) * Math.sin(nodeRad));
  
  const zNode = xPrime * Math.sin(periRad) * Math.sin(inclRad) + yPrime * Math.cos(periRad) * Math.sin(inclRad);
  
  // Three.js 좌표계에 맞게 조정 (y-up)
  return new Vector3(xNode, zNode, yNode);
}

// 시뮬레이션용 간소화된 위치 계산 (시뮬레이션 시간 기준)
export function calculatePosition(celestialData: CelestialBodyData, simulationTime: number): Vector3 {
  // 실제 날짜를 계산
  const currentDate = new Date();
  
  // 시뮬레이션 시간을 실제 날짜에 매핑
  // simulationTime은 초 단위이지만 실제로는 일 단위로 빠르게 진행
  const simulatedDays = simulationTime * 10; // 1초당 10일이 지나가도록 조정
  
  // 시뮬레이션 날짜 계산 (현재 날짜 + 시뮬레이션 시간만큼 진행)
  const simulatedDate = new Date(currentDate.getTime() + simulatedDays * 24 * 60 * 60 * 1000);
  
  // 실제 행성 위치 계산
  return calculateRealPosition(celestialData, simulatedDate);
}

// 타원 궤도 포인트 계산 (궤도 라인 렌더링용)
export function calculateOrbitPoints(celestialData: CelestialBodyData, segments = 128): Vector3[] {
  const points: Vector3[] = [];
  
  // 달은 부모 행성 주변 궤도
  if (celestialData.type === 'moon') return points; // 달 궤도는 복잡해서 생략
  
  // 태양은 궤도 없음
  if (celestialData.type === 'star') return points;
  
  // 반장축과 이심률로부터 궤도 계산
  const a = celestialData.semiMajorAxis * AU_TO_SCENE_SCALE;
  const e = celestialData.eccentricity;
  const inclRad = degToRad(celestialData.inclination);
  const nodeRad = degToRad(celestialData.longitudeOfAscendingNode);
  const periRad = degToRad(celestialData.argumentOfPerihelion);
  
  // 타원 궤도의 각 점 계산
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const eccentricAnomaly = angle;
    
    // 타원 궤도 상의 좌표 계산
    const xPrime = a * (Math.cos(eccentricAnomaly) - e);
    const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(eccentricAnomaly);
    
    // 궤도면 회전 적용
    const xNode = xPrime * (Math.cos(periRad) * Math.cos(nodeRad) - Math.sin(periRad) * Math.cos(inclRad) * Math.sin(nodeRad))
                - yPrime * (Math.sin(periRad) * Math.cos(nodeRad) + Math.cos(periRad) * Math.cos(inclRad) * Math.sin(nodeRad));
    
    const yNode = xPrime * (Math.cos(periRad) * Math.sin(nodeRad) + Math.sin(periRad) * Math.cos(inclRad) * Math.cos(nodeRad))
                + yPrime * (Math.cos(periRad) * Math.cos(inclRad) * Math.cos(nodeRad) - Math.sin(periRad) * Math.sin(nodeRad));
    
    const zNode = xPrime * Math.sin(periRad) * Math.sin(inclRad) + yPrime * Math.cos(periRad) * Math.sin(inclRad);
    
    points.push(new Vector3(xNode, zNode, yNode));
  }
  
  return points;
}

// celestialData 가져오기 위한 임포트 추가
import celestialBodies from './celestialData';
