// src/components/UI/InfoPanel.tsx
'use client';

import { useState } from 'react';
import styles from './InfoPanel.module.css';
import celestialBodies from '@/lib/celestialData';

export default function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
      <button 
        className={styles.toggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '정보 패널 닫기 ▼' : '정보 패널 열기 ▲'}
      </button>
      
      {isOpen && (
        <div className={styles.content}>
          <h2>태양계 정보</h2>
          <p>
            우리가 살고 있는 태양계는 태양을 중심으로 8개의 행성, 위성들, 왜소행성, 소행성, 혜성 등으로 
            구성되어 있습니다. 이 3D 모델은 태양계의 주요 천체들을 실시간으로 시각화합니다.
          </p>
          
          <h3>사용 방법</h3>
          <ul>
            <li>마우스 드래그: 시점 회전</li>
            <li>마우스 휠: 확대/축소</li>
            <li>천체에 마우스 오버: 천체 이름 표시</li>
            <li>천체 클릭: 상세 정보 표시</li>
          </ul>
          
          <h3>천체 목록</h3>
          <div className={styles.bodyList}>
            {celestialBodies.map(body => (
              <div key={body.name} className={styles.bodyItem}>
                <div 
                  className={styles.bodyColor} 
                  style={{ backgroundColor: body.color }}
                />
                <span>{body.name}</span>
                <span className={styles.bodyType}>
                  {body.type === 'star' && '항성'}
                  {body.type === 'planet' && '행성'}
                  {body.type === 'dwarf-planet' && '왜소행성'}
                  {body.type === 'moon' && '위성'}
                </span>
              </div>
            ))}
          </div>
          
          <p className={styles.disclaimer}>
            * 주의: 이 모델은 교육 목적으로 만들어졌으며, 실제 크기와 거리는 
            시각화를 위해 비율이 조정되었습니다.
          </p>
        </div>
      )}
    </div>
  );
}
