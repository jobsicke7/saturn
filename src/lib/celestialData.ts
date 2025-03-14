// src/lib/celestialData.ts 수정
import { Vector3 } from 'three';

export interface CelestialBodyData {
  name: string;
  type: 'star' | 'planet' | 'dwarf-planet' | 'moon';
  radius: number; // km
  distanceFromSun: number; // 백만 km
  orbitalPeriod: number; // 일
  rotationPeriod: number; // 시간 (음수는 역방향 회전)
  orbitalInclination: number; // 도
  orbitalEccentricity: number; // 이심률
  color: string;
  textureMap?: string;
  parent?: string;
  
  // 케플러 궤도 요소
  semiMajorAxis: number; // AU
  eccentricity: number;
  inclination: number; // 도
  longitudeOfAscendingNode: number; // 도
  argumentOfPerihelion: number; // 도
  meanAnomalyAtEpoch: number; // 도
  epochDate: Date; // J2000 = 2000-01-01T12:00:00Z
}

// 천체 데이터 (실제 값에 기반)
const celestialBodies: CelestialBodyData[] = [
  {
    name: '태양',
    type: 'star',
    radius: 696340, // km
    distanceFromSun: 0,
    orbitalPeriod: 0,
    rotationPeriod: 27 * 24, // 약 27일
    orbitalInclination: 0,
    orbitalEccentricity: 0,
    color: '#FDB813',
    textureMap: '/textures/sun.jpg',
    semiMajorAxis: 0,
    eccentricity: 0,
    inclination: 0,
    longitudeOfAscendingNode: 0,
    argumentOfPerihelion: 0,
    meanAnomalyAtEpoch: 0,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '수성',
    type: 'planet',
    radius: 2439.7,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    rotationPeriod: 1408, // 약 58.6일
    orbitalInclination: 7.0,
    orbitalEccentricity: 0.2056,
    color: '#A5A5A5',
    textureMap: '/textures/mercury.jpg',
    semiMajorAxis: 0.387098, // AU
    eccentricity: 0.205630,
    inclination: 7.005,
    longitudeOfAscendingNode: 48.331,
    argumentOfPerihelion: 29.124,
    meanAnomalyAtEpoch: 174.796,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '금성',
    type: 'planet',
    radius: 6051.8,
    distanceFromSun: 108.2,
    orbitalPeriod: 224.7,
    rotationPeriod: -5832, // 약 -243일 (역행 자전)
    orbitalInclination: 3.4,
    orbitalEccentricity: 0.0068,
    color: '#E5C04F',
    textureMap: '/textures/venus.jpg',
    semiMajorAxis: 0.723332, // AU
    eccentricity: 0.006772,
    inclination: 3.39458,
    longitudeOfAscendingNode: 76.680,
    argumentOfPerihelion: 54.884,
    meanAnomalyAtEpoch: 50.115,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '지구',
    type: 'planet',
    radius: 6371,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.2,
    rotationPeriod: 24, // 1일
    orbitalInclination: 0,
    orbitalEccentricity: 0.0167,
    color: '#3f7dac',
    textureMap: '/textures/earth.jpg',
    semiMajorAxis: 1.000001018, // AU
    eccentricity: 0.01671022,
    inclination: 0.00005,
    longitudeOfAscendingNode: -11.26064,
    argumentOfPerihelion: 114.20783,
    meanAnomalyAtEpoch: 358.617,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '달',
    type: 'moon',
    radius: 1737.4,
    distanceFromSun: 149.6,
    orbitalPeriod: 27.3,
    rotationPeriod: 655.2, // 약 27.3일
    orbitalInclination: 5.145,
    orbitalEccentricity: 0.0549,
    color: '#CFCFCF',
    textureMap: '/textures/moon.jpg',
    parent: '지구',
    semiMajorAxis: 0.00257, // AU (지구로부터의 거리)
    eccentricity: 0.0549,
    inclination: 5.145,
    longitudeOfAscendingNode: 125.08,
    argumentOfPerihelion: 318.15,
    meanAnomalyAtEpoch: 115.3654,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '화성',
    type: 'planet',
    radius: 3389.5,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    rotationPeriod: 24.6, // 약 1.03일
    orbitalInclination: 1.9,
    orbitalEccentricity: 0.0935,
    color: '#A02C2C',
    textureMap: '/textures/mars.jpg',
    semiMajorAxis: 1.52366231, // AU
    eccentricity: 0.09341233,
    inclination: 1.85061,
    longitudeOfAscendingNode: 49.57854,
    argumentOfPerihelion: 286.5016,
    meanAnomalyAtEpoch: 19.373,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '목성',
    type: 'planet',
    radius: 69911,
    distanceFromSun: 778.5,
    orbitalPeriod: 4331,
    rotationPeriod: 9.9, // 약 0.41일
    orbitalInclination: 1.3,
    orbitalEccentricity: 0.0489,
    color: '#C88B3A',
    textureMap: '/textures/jupiter.jpg',
    semiMajorAxis: 5.20336301, // AU
    eccentricity: 0.04839266,
    inclination: 1.30530,
    longitudeOfAscendingNode: 100.55615,
    argumentOfPerihelion: 273.8777,
    meanAnomalyAtEpoch: 20.020,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '토성',
    type: 'planet',
    radius: 58232,
    distanceFromSun: 1434,
    orbitalPeriod: 10747,
    rotationPeriod: 10.7, // 약 0.45일
    orbitalInclination: 2.5,
    orbitalEccentricity: 0.0565,
    color: '#E0BE78',
    textureMap: '/textures/saturn.jpg',
    semiMajorAxis: 9.53707032, // AU
    eccentricity: 0.05415060,
    inclination: 2.48446,
    longitudeOfAscendingNode: 113.71504,
    argumentOfPerihelion: 339.3939,
    meanAnomalyAtEpoch: 317.020,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '천왕성',
    type: 'planet',
    radius: 25362,
    distanceFromSun: 2871,
    orbitalPeriod: 30589,
    rotationPeriod: -17.2, // 약 -0.72일 (역행 자전)
    orbitalInclination: 0.8,
    orbitalEccentricity: 0.0457,
    color: '#93C1DB',
    textureMap: '/textures/uranus.jpg',
    semiMajorAxis: 19.19126393, // AU
    eccentricity: 0.04716771,
    inclination: 0.76986,
    longitudeOfAscendingNode: 74.22988,
    argumentOfPerihelion: 96.6612,
    meanAnomalyAtEpoch: 142.2386,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '해왕성',
    type: 'planet',
    radius: 24622,
    distanceFromSun: 4495,
    orbitalPeriod: 59800,
    rotationPeriod: 16.1, // 약 0.67일
    orbitalInclination: 1.8,
    orbitalEccentricity: 0.0113,
    color: '#3A5BA0',
    textureMap: '/textures/neptune.jpg',
    semiMajorAxis: 30.06896348, // AU
    eccentricity: 0.00858587,
    inclination: 1.76917,
    longitudeOfAscendingNode: 131.72169,
    argumentOfPerihelion: 273.2248,
    meanAnomalyAtEpoch: 260.2471,
    epochDate: new Date('2000-01-01T12:00:00Z')
  },
  {
    name: '명왕성',
    type: 'dwarf-planet',
    radius: 1188.3,
    distanceFromSun: 5900,
    orbitalPeriod: 90560,
    rotationPeriod: -153.36, // 약 -6.39일 (역행 자전)
    orbitalInclination: 17.2,
    orbitalEccentricity: 0.2488,
    color: '#A89984',
    textureMap: '/textures/pluto.jpg',
    semiMajorAxis: 39.48168677, // AU
    eccentricity: 0.24880766,
    inclination: 17.14175,
    longitudeOfAscendingNode: 110.30347,
    argumentOfPerihelion: 113.76329,
    meanAnomalyAtEpoch: 14.86012,
    epochDate: new Date('2000-01-01T12:00:00Z')
  }
];

export default celestialBodies;
