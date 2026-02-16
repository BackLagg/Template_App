import React from 'react';
import styles from './ErrorScreen.module.scss';

interface ErrorScreenProps {
  errorType: 'noData' | 'serverError' | 'validationError' | 'networkError' | 'unknown';
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorType, onRetry }) => {
  const getErrorContent = () => {
    switch (errorType) {
      case 'noData':
        return {
          title: 'WELCOME',
          message: 'Visit our application',
          actionText: 'Go to Bot',
          actionLink: 'https://t.me/fabricbotbot'
        };
      case 'serverError':
        return {
          title: 'SERVER ERROR',
          message: 'Server is temporarily unavailable. Please try again later.',
          actionText: 'Try Again',
          actionLink: null
        };
      case 'validationError':
        return {
          title: 'INVALID DATA',
          message: 'Your data is not valid. Please check the entered information.',
          actionText: 'Try Again',
          actionLink: null
        };
      case 'networkError':
        return {
          title: 'NETWORK ERROR',
          message: 'Check your internet connection and try again.',
          actionText: 'Try Again',
          actionLink: null
        };
      default:
        return {
          title: 'SOMETHING WENT WRONG',
          message: 'An unexpected error occurred. Try refreshing the page or contact support.',
          actionText: 'Refresh Page',
          actionLink: null
        };
    }
  };

  const content = getErrorContent();

  const handleAction = () => {
    if (content.actionLink) {
      window.open(content.actionLink, '_blank');
    } else if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={styles.errorScreen}>
      <div className={styles.errorScreenContent}>
        <div className={styles.errorScreenMainSection}>
          <h1 className={styles.errorScreenTitle}>
            {content.title}
          </h1>
          <p className={styles.errorScreenMessage}>
            {content.message}
          </p>
        </div>
        
        <div className={styles.errorScreenActionSection}>
          <button className={styles.errorScreenActionBtn} onClick={handleAction}>
            {content.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;

