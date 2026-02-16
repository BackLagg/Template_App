import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { handleError } from '../lib/error-handler';

// Конфигурация API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fabricbot.tech/api';

//export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Утилита для получения initData из Telegram WebApp
export const getInitData = (): string => {
  return window?.Telegram?.WebApp?.initData || '';
};

// Создание экземпляра axios с базовой конфигурацией
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 секунд для больших сообщений
});

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Централизованная обработка ошибок
    // Не показываем toast здесь, так как это будет делаться в компонентах/hooks
    // Просто логируем в development
    if (import.meta.env.DEV) {
      handleError(error, false);
    }
    return Promise.reject(error);
  }
);

// Экспорт экземпляра для прямого использования
export default apiClient;

