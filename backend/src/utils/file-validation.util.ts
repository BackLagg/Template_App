import * as path from 'path';
import * as fs from 'fs';
import { AppConstants } from '../constants/app.constants';

export class FileValidationUtil {
  private static readonly allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.svg',
    '.webp',
    '.pdf',
    '.doc',
    '.docx',
  ];
  private static readonly maxFileSize = AppConstants.FILE_SIZE.LIMITS.MAX;
  private static readonly uploadsDir = path.join(process.cwd(), 'uploads');

  /**
   * Проверяет, является ли путь безопасным (защита от path traversal)
   */
  static isPathSafe(filePath: string): boolean {
    if (!filePath) return false;

    // Проверяем на path traversal атаки
    if (filePath.includes('..')) return false;
    if (path.isAbsolute(filePath)) return false;
    if (filePath.includes('\0')) return false;

    // Нормализуем путь и проверяем, что он не выходит за пределы uploads
    const normalizedPath = path.normalize(filePath);
    const fullPath = path.join(this.uploadsDir, normalizedPath);

    return fullPath.startsWith(this.uploadsDir);
  }

  /**
   * Проверяет расширение файла
   */
  static isExtensionAllowed(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.allowedExtensions.includes(ext);
  }

  /**
   * Проверяет размер файла
   */
  static isFileSizeValid(filePath: string): boolean {
    try {
      const fullPath = path.join(this.uploadsDir, filePath);
      const stat = fs.statSync(fullPath);
      return stat.isFile() && stat.size <= this.maxFileSize;
    } catch {
      return false;
    }
  }

  /**
   * Получает MIME тип для файла
   */
  static getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Полная валидация файла
   */
  static validateFile(filePath: string): { valid: boolean; error?: string } {
    if (!this.isPathSafe(filePath)) {
      return { valid: false, error: 'Invalid file path' };
    }

    if (!this.isExtensionAllowed(filePath)) {
      return { valid: false, error: 'File type not allowed' };
    }

    if (!this.isFileSizeValid(filePath)) {
      return { valid: false, error: 'File too large' };
    }

    return { valid: true };
  }

  /**
   * Генерирует безопасное имя файла
   */
  static generateSafeFileName(originalName: string): string {
    // Удаляем небезопасные символы
    const safeName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');

    // Добавляем timestamp для уникальности
    const timestamp = Date.now();
    const ext = path.extname(safeName);
    const nameWithoutExt = path.basename(safeName, ext);

    return `${nameWithoutExt}_${timestamp}${ext}`;
  }
}
