// app/page.tsx
'use client'

import { useEffect, useRef } from 'react'
import ServiceSection from '@/components/ServiceSection'
import HeroSection from '@/components/HeroSection'
import styles from './page.module.css'

type Direction = 'left' | 'right';

interface ServiceData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  direction: Direction;
  link?: string; // 옵셔널로 변경
}

// 서비스 데이터 (커스터마이징 가능)
const servicesData: ServiceData[] = [
  {
    id: 1,
    title: '천문소식',
    description: '최신 천문소식을 쉽고 편리하게 확인해보세요',
    imageUrl: '/images/web-development.jpg',
    direction: 'left',
    link: '/services/astroinfo', // 링크 확인
  },
  {
    id: 2,
    title: '항공우주/천문 사전',
    description: '항공우주/천문과 관련된 용어를 검색해보세요',
    imageUrl: '/images/mobile-app.jpg',
    direction: 'right',
    link: '/services/mobile-app', // 링크 확인
  },
  {
    id: 3,
    title: '클라우드 솔루션',
    description: '확장 가능한 클라우드 인프라 구축 및 관리. 비즈니스 성장에 맞춘 최적의 솔루션을 제공합니다.',
    imageUrl: '/images/cloud-solution.jpg',
    direction: 'left',
    link: '/services/cloud-solution', // 링크 확인
  },
  {
    id: 4,
    title: 'AI 통합 서비스',
    description: '인공지능과 머신러닝을 활용한 비즈니스 프로세스 최적화. 데이터 기반 의사결정을 지원합니다.',
    imageUrl: '/images/ai-service.jpg',
    direction: 'right',
    link: '/services/ai-service', // 링크 확인
  },
]

export default function Home() {
  return (
    <main className={styles.main}>
      <HeroSection />
      <div className={styles.servicesContainer}>
        {servicesData.map((service) => (
          <ServiceSection key={service.id} service={service} />
        ))}
      </div>
    </main>
  )
}