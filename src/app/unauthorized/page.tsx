import styles from '@/styles/main.module.css';

export default function UnauthorizedPage() {
    return (
        <div className={styles.container} style={{ color: "white" }}>
            <h1>외계인이 접근을 막았어요</h1>
            <p>이 페이지에 접근하려면 권한이 필요해요</p>
        </div>
    );

}
