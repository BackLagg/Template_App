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
  donationLevel?: number; // 0, 2, 3 (0 = нет донатов, 2 = 1-3 TON, 3 = 3+ TON)
  totalDonated?: number; // Суммарная сумма донатов в TON
}

export interface UserProfile {
  userId: string;
  profession?: string;
  description?: string;
  avatarPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

