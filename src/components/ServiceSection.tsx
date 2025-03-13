// components/ServiceSection.tsx
'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/styles/ServiceSection.module.css'


type Direction = 'left' | 'right';

interface ServiceProps {
  service: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    direction: Direction;
    link?: string; // 옵셔널로 변경
  }
}

export default function ServiceSection({ service }: ServiceProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 요소가 화면에 보이면 애니메이션 활성화
            sectionRef.current?.classList.add(styles.visible)
            
            // 스크롤 애니메이션을 위한 함수
            const handleScroll = () => {
              if (!sectionRef.current) return
              
              const rect = sectionRef.current.getBoundingClientRect()
              const windowHeight = window.innerHeight
              
              // 요소가 화면에 얼마나 보이는지 계산 (0~1)
              const visibility = 1 - ((rect.top - windowHeight * 0.2) / (windowHeight * 0.8))
              
              // 스크롤에 따른 애니메이션 효과 적용
              if (visibility > 0 && visibility <= 1) {
                // 이미지 애니메이션
                if (imageRef.current) {
                  const translateX = service.direction === 'left' ? 
                    (visibility - 1) * 100 : (1 - visibility) * 100
                  
                  imageRef.current.style.transform = `translateX(${translateX}px)`
                  imageRef.current.style.opacity = `${visibility}`
                }
                
                // 텍스트 애니메이션
                if (contentRef.current) {
                  const translateX = service.direction === 'left' ? 
                    (1 - visibility) * 100 : (visibility - 1) * 100
                  
                  contentRef.current.style.transform = `translateX(${translateX}px)`
                  contentRef.current.style.opacity = `${visibility}`
                }
              }
            }
            
            window.addEventListener('scroll', handleScroll)
            handleScroll() // 초기 로드 시 실행
            
            return () => {
              window.removeEventListener('scroll', handleScroll)
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [service.direction])

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.section} ${service.direction === 'left' ? styles.leftSection : styles.rightSection}`}
    >
      <div 
        ref={imageRef} 
        className={styles.imageContainer}
      >
        <Image
          src={service.imageUrl}
          alt={service.title}
          width={600}
          height={400}
          className={styles.image}
        />
      </div>
      
      <div 
        ref={contentRef} 
        className={styles.content}
      >
        <h2 className={styles.title}>{service.title}</h2>
        <p className={styles.description}>{service.description}</p>
        {service.link ? (
          <Link href={service.link} className={styles.button}>
            자세히 보기
          </Link>
        ) : (
          <button className={styles.button}>자세히 보기</button>
        )}
      </div>
    </section>
  )
}