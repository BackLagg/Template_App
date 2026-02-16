import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@app/store';
import styles from './Header.module.scss';

const Header: React.FC = memo(() => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number = 20): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getProfilePhoto = () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url) {
      return window.Telegram.WebApp.initDataUnsafe.user.photo_url;
    }
    return null;
  };

  const profilePhoto = getProfilePhoto();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className={styles.header}>
      <div
        className={styles.headerLeft}
        onClick={handleProfileClick}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.headerAvatar}>
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className={styles.headerAvatarImg}
            />
          ) : (
            <div className={styles.headerAvatarPlaceholder} />
          )}
        </div>
        <div className={styles.headerUserInfo}>
          <span
            className={styles.headerName}
            title={user.name || user.username || 'User'}
          >
            {truncateText(user.name || user.username || 'User')}
          </span>
        </div>
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
