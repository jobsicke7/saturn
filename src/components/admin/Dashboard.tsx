'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';
import { Card } from '@/components/ui/Card';

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  // 추가 통계 필요시 여기에 추가
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('An error occurred while fetching dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>대시보드 데이터 로딩중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.pageTitle}>어드민 대시보드</h1>
      
      <div className={styles.welcomeCard}>
        <h2>관리자 패널에 오신것을 환영합니다!</h2>
        <p>
          해당 페이지는 유저 및 사이트를 관리하기 위한 공간입니다.
        </p>
      </div>
      
      {stats && (
        <div className={styles.statsGrid}>
          <Card className={styles.statsCard}>
            <div className={styles.statsTitle}>전체 유저수</div>
            <div className={styles.statsValue}>{stats.totalUsers}</div>
            <Link href="/admin/users" className={styles.statsLink}>
              모든 유저 확인하러가기 →
            </Link>
          </Card>
          
          <Card className={styles.statsCard}>
            <div className={styles.statsTitle}>오늘 새로운 유저수</div>
            <div className={styles.statsValue}>{stats.newUsersToday}</div>
            <div className={styles.statsSubtext}>
              {stats.newUsersToday > 0 
                ? '사이트가 성장하고 있어요!' 
                : '오늘은 신규 유저가 없어요.'}
            </div>
          </Card>
          
          <Card className={styles.statsCard}>
            <div className={styles.statsTitle}>활동중인 유저수</div>
            <div className={styles.statsValue}>{stats.activeUsers}</div>
            <div className={styles.statsSubtext}>
              전체 유저수 중 {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
