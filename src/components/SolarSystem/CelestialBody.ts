// src/components/SolarSystem/CelestialBody.ts
import { Vector3 } from 'three';
import { CelestialBodyData } from '@/lib/celestialData';
import { calculatePosition, getScaledRadius } from '@/lib/calculations';

export class CelestialBody {
  data: CelestialBodyData;
  position: Vector3;
  scaledRadius: number;
  
  constructor(data: CelestialBodyData) {
    this.data = data;
    this.position = new Vector3(0, 0, 0);
    this.scaledRadius = getScaledRadius(data.radius);
  }
  
  update(time: number): void {
    this.position = calculatePosition(this.data, time);
  }
  
  getRotationSpeed(): number {
    if (this.data.rotationPeriod === 0) return 0;
    // 회전 방향 및 속도 계산 (음수인 경우 역방향 회전)
    return (this.data.rotationPeriod > 0 ? 1 : -1) * (0.1 / Math.abs(this.data.rotationPeriod));
  }
}
