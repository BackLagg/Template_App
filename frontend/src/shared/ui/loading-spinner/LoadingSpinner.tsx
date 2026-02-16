import React from 'react';
import type { BaseComponentProps } from '@shared/types';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const spinnerClasses = [
    styles.loadingSpinner,
    styles[`loadingSpinner${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`loadingSpinner${color.charAt(0).toUpperCase() + color.slice(1)}`],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={spinnerClasses}>
      <div className={styles.loadingSpinnerCircle}></div>
    </div>
  );
};

export default LoadingSpinner;

