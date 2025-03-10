import { ReactNode } from 'react';
import styles from '@/styles/Table.module.css';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  const tableClasses = [
    styles.table,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.tableWrapper}>
      <table className={tableClasses}>
        {children}
      </table>
    </div>
  );
}
