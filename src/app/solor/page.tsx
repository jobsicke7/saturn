// src/app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import styles from './page.module.css';

// 클라이언트 사이드 렌더링을 위한 동적 임포트
const SolarSystem = dynamic(
  () => import('@/components/SolarSystem/SolarSystem'),
  { ssr: false }
);

// 로딩 스피너 컴포넌트

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>태양계 실시간 시뮬레이션</h1>
      
      <Suspense>
        <SolarSystem />
      </Suspense>
      
      <footer className={styles.footer}>
        © {new Date().getFullYear()} 태양계 시뮬레이션 | 실시간 위치 계산 적용
      </footer>
    </div>
  );
}
