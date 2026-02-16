import { Transform } from 'class-transformer';

/**
 * Утилиты для санитизации пользовательского ввода
 */
export class SanitizerUtil {
  /**
   * Удаляет HTML теги и потенциально опасные символы
   */
  static sanitizeHtml(input: string): string {
    if (!input) return '';

    return input
      .replace(/<[^>]*>/g, '') // Удаляем HTML теги
      .replace(/[<>]/g, '') // Удаляем оставшиеся < >
      .replace(/javascript:/gi, '') // Удаляем javascript: протоколы
      .replace(/on\w+\s*=/gi, '') // Удаляем event handlers
      .trim();
  }

  /**
   * Санитизирует строку для безопасного отображения
   */
  static sanitizeString(input: string): string {
    if (!input) return '';

    return input
      .replace(/[<>'"&]/g, (match) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;',
        };
        return entities[match] || match;
      })
      .trim();
  }

  /**
   * Валидирует и санитизирует URL файла
   */
  static sanitizeUrl(input: string): string | null {
    if (!input) return null;

    // Проверяем, что это относительный путь к файлам или полный URL файлового сервиса
    if (input.startsWith('/files/') || input.startsWith('http')) {
      const sanitized = input.replace(/[^a-zA-Z0-9\-_\.\/\:]/g, '');
      return sanitized.startsWith('/files/') || sanitized.startsWith('http')
        ? sanitized
        : null;
    }

    return null;
  }

  /**
   * Валидирует Telegram ID
   */
  static validateTelegramId(input: string): boolean {
    return /^\d{5,15}$/.test(input);
  }
}

/**
 * Декоратор для автоматической санитизации строк
 */
export function SanitizeString(): ReturnType<typeof Transform> {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return SanitizerUtil.sanitizeString(value);
    }
    return value;
  });
}

/**
 * Декоратор для санитизации HTML
 */
export function SanitizeHtml(): ReturnType<typeof Transform> {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return SanitizerUtil.sanitizeHtml(value);
    }
    return value;
  });
}
