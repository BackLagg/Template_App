import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import EditIcon from '@shared/assets/navigation/edit.svg';
import styles from './Navigation.module.scss';

const navItems = [{ path: '/profile', icon: EditIcon, label: 'Profile' }];

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className={styles.bottomNavigation}>
      {navItems.map(({ path, icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <NavLink
            key={path}
            to={path}
            className={`${styles.navButton}${isActive ? ` ${styles.active}` : ''}`}
          >
            <div className={styles.navIconWrapper}>
              <img src={icon} alt={label} className={styles.navIcon} />
            </div>
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
