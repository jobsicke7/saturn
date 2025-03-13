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
    imageUrl: '/poster_landscape.png',
    direction: 'left',
    link: '/services/astro', // 링크 확인
  },
  {
    id: 2,
    title: '항공우주/천문 사전',
    description: '항공우주/천문과 관련된 용어를 검색해보세요',
    imageUrl: '/poster_landscape.png',
    direction: 'right',
    link: '/services/mobile-app', // 링크 확인
  },
  {
    id: 3,
    title: 'ISS 위치',
    description: 'ISS(국제우주정거장)의 실시간 위치 및 관련 정보를 확인해보세요',
    imageUrl: '/poster_landscape.png',
    direction: 'left',
    link: '/services/cloud-solution', // 링크 확인
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