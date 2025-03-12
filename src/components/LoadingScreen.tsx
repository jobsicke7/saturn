// app/components/LoadingScreen.tsx
import React from "react";
import styles from "@/styles/Layout.module.css"; // CSS 모듈 임포트


const Loading: React.FC = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.text}>잠시만 기다려주세요</p>
      </div>
    </div>
  );
};

export default Loading;
