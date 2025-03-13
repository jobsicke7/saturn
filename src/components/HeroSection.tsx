// components/HeroSection.tsx
'use client'

import { useEffect, useRef } from 'react'
import styles from '@/styles/ServiceSection.module.css'

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // 초기 로드 시 애니메이션
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.classList.add(styles.visible)
      }
    }, 300)

    setTimeout(() => {
      if (subtitleRef.current) {
        subtitleRef.current.classList.add(styles.visible)
      }
    }, 600)
  }, [])

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 ref={titleRef} className={styles.htitle}>
          새턴
        </h1>
        <p ref={subtitleRef} className={styles.htitle}>
          손안에 있는 나만의 작은 우주
        </p>
      </div>
    </section>
  )
}