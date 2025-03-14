// src/components/Controls/Controls.tsx
import React from 'react';
import styles from './Controls.module.css';

interface ControlsProps {
  onSpeedChange: (speed: number) => void;
  currentSpeed: number;
  onResetView: () => void;
  onToggleLabels: () => void;
  showLabels: boolean;
}

export default function Controls({
  onSpeedChange,
  currentSpeed,
  onResetView,
  onToggleLabels,
  showLabels
}: ControlsProps) {
  // 속도 프리셋
  const speedPresets = [
    { label: '0.1x', value: 0.1 },
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '5x', value: 5 },
    { label: '10x', value: 10 },
    { label: '50x', value: 50 },
    { label: '100x', value: 100 },
  ];

  return (
    <div className={styles.controls}>
      <div className={styles.speedControls}>
        <h3>시뮬레이션 속도 조절</h3>
        <div className={styles.buttons}>
          {speedPresets.map(preset => (
            <button
              key={preset.value}
              onClick={() => onSpeedChange(preset.value)}
              className={`${styles.button} ${currentSpeed === preset.value ? styles.active : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className={styles.currentSpeed}>
          <span>현재 속도: {currentSpeed}x (1초 = {currentSpeed * 10}일)</span>
        </div>
      </div>
      
      <div className={styles.viewControls}>
        <button onClick={onResetView} className={styles.button}>
          시점 초기화
        </button>
        
        <button 
          onClick={onToggleLabels} 
          className={`${styles.button} ${showLabels ? styles.active : ''}`}
        >
          {showLabels ? '라벨 숨기기' : '라벨 표시'}
        </button>
      </div>
      
      <div className={styles.hints}>
        <p>사용 방법:</p>
        <p>- 마우스 드래그: 화면 이동</p>
        <p>- 마우스 휠: 확대/축소</p>
        <p>- 행성 클릭: 정보 보기</p>
        <p>- 행성 더블클릭: 추적 모드</p>
        <p>- R 키: 시점 초기화</p>
      </div>
    </div>
  );
}
