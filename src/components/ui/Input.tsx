import { InputHTMLAttributes } from 'react';
import styles from '@/styles/Admin.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  const inputClasses = [
    styles.input,
    error ? styles.inputError : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputWrapper}>
      <input className={inputClasses} {...props} />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
