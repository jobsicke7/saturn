import { ReactNode } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import styles from '@/styles/Admin.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={styles.adminLayout}>
      <AdminNavbar />
      <div className={styles.adminContainer}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
