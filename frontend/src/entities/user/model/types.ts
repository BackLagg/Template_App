// Типы для сущности User
export interface User {
  id: string | null;
  telegramId: number | null;
  username: string; // Отображаемое имя пользователя
  name: string; // Полное имя пользователя
  profession?: string;
  description?: string;
  avatarPath?: string;
  role: 'user' | 'superuser' | '';
  isNew: boolean;
  isAccepted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  lastLoginAt?: string | null;
}

export interface UserProfile {
  userId: string;
  profession?: string;
  description?: string;
  avatarPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

