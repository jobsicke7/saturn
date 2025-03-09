import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: "url('/poster_landscape.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "100vh",
        position: "relative"
      }}
    >
    </div>
  );
}