import { apiClient } from './base-api';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  totalRequests: number;
  totalPayments: number;
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  pin: string; // PIN код из 4 цифр
}

export interface CreateApiKeyResponse {
  success: boolean;
  data?: {
    id: string;
    key: string; // Показывается только при создании
    name: string;
    description?: string;
    createdAt: string;
    expiresAt?: string;
  };
  message?: string;
  error?: string;
}

export interface ApiKeyListResponse {
  success: boolean;
  data?: ApiKey[];
  message?: string;
  error?: string;
}

export const apiKeyAPI = {
  /**
   * Создает новый API ключ
   */
  async createApiKey(
    initData: string,
    data: CreateApiKeyRequest,
  ): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post('/api-key/create', {
      ...data,
      initData,
    });
    return response.data;
  },

  /**
   * Получает список API ключей разработчика
   */
  async getApiKeys(initData: string): Promise<ApiKeyListResponse> {
    const response = await apiClient.put('/api-key/list', { initData });
    return response.data;
  },

  /**
   * Отзывает (деактивирует) API ключ
   */
  async revokeApiKey(
    initData: string,
    keyId: string,
    pin: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiClient.put('/api-key/revoke', {
      initData,
      keyId,
      pin,
    });
    return response.data;
  },

  /**
   * Пересоздает API ключ (генерирует новый ключ)
   */
  async recreateApiKey(
    initData: string,
    keyId: string,
    pin: string,
  ): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post('/api-key/recreate', {
      initData,
      keyId,
      pin,
    });
    return response.data;
  },
};

