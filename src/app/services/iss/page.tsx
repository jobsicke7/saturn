"use client";
import style from '../../../styles/main.module.css'
import dynamic from "next/dynamic";

// Leaflet 컴포넌트를 동적으로 임포트
const ISSTracker = dynamic(() => import("./ISSTracker"), {
    ssr: false, // 서버 사이드 렌더링 비활성화
    loading: () => <div></div>,
});

export default function ISSPage() {
    return (
        <div className={style.container}>
            <ISSTracker />
        </div>
    );
}