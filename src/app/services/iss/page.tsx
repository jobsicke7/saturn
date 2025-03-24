"use client";
import style from '../../../styles/main.module.css'
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// 개선된 로딩 컴포넌트
const LoadingMap = () => (
  <div style={{
    width: '100%',
    height: '400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    margin: '0 auto'
  }}>
    <p>지도를 불러오는 중...</p>
  </div>
);

// Leaflet 컴포넌트를 동적으로 임포트
const ISSTracker = dynamic(() => import("./ISSTracker"), {
    ssr: false, // 서버 사이드 렌더링 비활성화
    loading: () => <LoadingMap />,
});

export default function ISSPage() {
    const [mounted, setMounted] = useState(false);
    
    // 컴포넌트가 마운트된 후에만 ISS 트래커 렌더링
    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return <LoadingMap />;
    }
    
    return (
        <div className={style.container}>
            <ISSTracker />
        </div>
    );
}
