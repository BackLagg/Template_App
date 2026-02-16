import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export type ErrorType = 'noData' | 'serverError' | 'validationError' | 'networkError' | 'unknown';

export interface ApiErrorResponse {
  success: false;
  error?: string;
  errorCode?: string;
  message?: string;
  timestamp?: string;
  path?: string;
  status?: number;
}

/**
 * Определяет тип ошибки на основе сообщения или статуса
 */
export const getErrorType = (error: unknown): ErrorType => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  if (
    lowerMessage.includes('сервер') ||
    lowerMessage.includes('server') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('504') ||
    lowerMessage.includes('internal server error') ||
    lowerMessage.includes('service unavailable') ||
    lowerMessage.includes('bad gateway') ||
    lowerMessage.includes('gateway timeout')
  ) {
    return 'serverError';
  }

  if (
    lowerMessage.includes('валид') ||
    lowerMessage.includes('validation') ||
    lowerMessage.includes('400') ||
    lowerMessage.includes('422') ||
    lowerMessage.includes('bad request') ||
    lowerMessage.includes('unprocessable entity')
  ) {
    return 'validationError';
  }

  if (
    lowerMessage.includes('сеть') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('enotfound')
  ) {
    return 'networkError';
  }

  return 'unknown';
};

/**
 * Извлекает сообщение об ошибке из различных источников
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    // Новый формат: error содержит сообщение, errorCode - код ошибки
    return (
      response?.error ||
      response?.message ||
      error.message ||
      'An error occurred while processing the request'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error) || 'An unknown error occurred';
};

/**
 * Извлекает код ошибки из ответа API
 */
export const getErrorCode = (error: unknown): string | undefined => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    return response?.errorCode;
  }
  return undefined;
};

/**
 * Обрабатывает ошибку и показывает уведомление
 */
export const handleError = (error: unknown, showToast = true): string => {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const errorType = getErrorType(error);

  if (showToast) {
    const toastMessage = getToastMessage(errorType, errorMessage);
    toast.error(toastMessage, {
      position: 'top-right',
      autoClose: 5000,
    });
  }

  // В development режиме логируем ошибку
  if (import.meta.env.DEV) {
    console.error('Error handled:', {
      error,
      errorMessage,
      errorCode,
      errorType,
    });
  }

  return errorMessage;
};

/**
 * Получает пользовательское сообщение для toast
 * Использует сообщение из API или дефолтное сообщение по типу ошибки
 */
const getToastMessage = (errorType: ErrorType, defaultMessage: string): string => {
  // Если есть сообщение от API, используем его (оно уже на английском)
  if (defaultMessage && defaultMessage !== 'An error occurred while processing the request') {
    return defaultMessage;
  }

  // Иначе используем дефолтные сообщения по типу ошибки
  const messages: Record<ErrorType, string> = {
    serverError: 'Server error. Please try again later.',
    validationError: 'Validation error. Please check your input.',
    networkError: 'Network error. Please check your internet connection.',
    noData: 'Data not found.',
    unknown: defaultMessage || 'An error occurred. Please try again.',
  };

  return messages[errorType] || messages.unknown;
};

/**
 * Создает обработчик ошибок для React Query
 */
export const createQueryErrorHandler = (showToast = true) => {
  return (error: unknown) => {
    return handleError(error, showToast);
  };
};

