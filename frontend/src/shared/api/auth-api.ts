import { apiClient } from './base-api';
import type { User } from '@shared/types';

// Утилита для получения startParam из Telegram WebApp
const getStartParam = (): string | null => {
  return (window?.Telegram?.WebApp?.initDataUnsafe as any)?.start_param || null;
};

// Интерфейсы для API
interface CompleteOnboardingData {
  [key: string]: any;
}

// API методы для авторизации
export const authAPI = {
  // Авторизация через Telegram
  authenticate: async (initData: string): Promise<{ success: boolean; user: User }> => {
    const startParam = getStartParam();
    const response = await apiClient.post<{ success: boolean; user: User }>('/auth', { 
      initData,
      tgWebAppStartParam: startParam 
    });
    return response.data;
  },

  // Завершение онбординга с данными
  completeOnboarding: async (initData: string, data: CompleteOnboardingData): Promise<{ success: boolean; user: User }> => {
    const startParam = getStartParam();
    const response = await apiClient.post<{ success: boolean; user: User }>('/auth/complete-onboarding', {
      initData,
      tgWebAppStartParam: startParam,
      ...data,
    });
    return response.data;
  },

  // Обновление профиля пользователя
  updateProfile: async (initData: string, data: { name?: string }): Promise<{ success: boolean; user: User }> => {
    const startParam = getStartParam();
    const response = await apiClient.put<{ success: boolean; user: User }>('/auth/update-profile', {
      initData,
      tgWebAppStartParam: startParam,
      ...data,
    });
    return response.data;
  },
};

