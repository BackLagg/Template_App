import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './EmptyPage.module.scss';

const EmptyPage: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = (pathname: string) => {
    return pathname === '/profile' ? 'Profile' : 'Страница';
  };

  return (
    <div className={styles.emptyPage}>
      <div className={styles.content}>
        <h1>{getPageTitle(location.pathname)}</h1>
        <p>Эта страница находится в разработке</p>
      </div>
    </div>
  );
};

export default EmptyPage;

