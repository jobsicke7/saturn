import { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from '@/styles/Admin.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className,
  ...props 
}: ButtonProps) {
  const buttonClasses = [
    styles.button,
    styles[`button-${variant}`],
    styles[`button-${size}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
