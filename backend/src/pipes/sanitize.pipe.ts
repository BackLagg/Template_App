import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { AppConstants } from '../constants/app.constants';
import { SanitizerUtil } from '../utils/sanitizer.util';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    void metadata;
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(str: string): string {
    let sanitized = str.replace(AppConstants.REGEX.HTML_TAGS, '');
    sanitized = sanitized.replace(AppConstants.REGEX.SQL_INJECTION, '');
    sanitized = sanitized.replace(AppConstants.REGEX.NOSQL_INJECTION, '');
    sanitized = sanitized.replace(AppConstants.REGEX.CONTROL_CHARS, '');
    return SanitizerUtil.sanitizeString(sanitized);
  }

  /**
   * Список полей, которые содержат JSON строки и не должны быть санитизированы как строки
   * Эти поля будут парситься в объекты, и содержимое будет санитизировано отдельно
   */
  private readonly jsonStringFields = new Set(['metadata']);

  /**
   * Рекурсивно очищает объект
   * @param obj - Объект для санитизации
   * @param parentKey - Ключ родительского объекта (для определения специальных полей)
   */
  private sanitizeObject(obj: unknown, parentKey?: string): unknown {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, parentKey));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, unknown> = {};
      const objRecord = obj as Record<string, unknown>;
      for (const key in objRecord) {
        if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
          const sanitizedKey = this.sanitizeString(key);
          sanitized[sanitizedKey] = this.sanitizeObject(objRecord[key], key);
        }
      }
      return sanitized;
    }

    if (typeof obj === 'string') {
      const isJsonStringField = this.jsonStringFields.has(parentKey ?? '');
      if (isJsonStringField) {
        return obj;
      }
      return this.sanitizeString(obj);
    }

    return obj;
  }
}
