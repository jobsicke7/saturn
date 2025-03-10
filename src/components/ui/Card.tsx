import { ReactNode } from 'react';
import styles from '@/styles/Admin.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  const cardClasses = [
    styles.card,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
}
