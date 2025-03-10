import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.backgroundSection}>
        <h1 className={styles.contentText}>Test</h1>
      </div>
    </div>
  );
}
