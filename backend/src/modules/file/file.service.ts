import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageAdapterService } from '../../services/file-storage-adapter.service';
import { TelegramUserData } from '../../middleware/telegram-auth.middleware';
import * as https from 'https';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly filePublicUrl: string | null;

  constructor(
    private readonly fileStorageAdapter: FileStorageAdapterService,
    private readonly configService: ConfigService,
  ) {
    // Публичный URL для файлов (через домен/nginx)
    // Если не указан, используется относительный путь
    // fileServiceUrl используется только в fileStorageAdapter для API запросов
    this.filePublicUrl =
      this.configService.get<string>('app.filePublicUrl') || null;
  }

  /**
   * Загружает файл через файловый сервис
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
    mimetype: string,
    prefix: string = 'file',
  ): Promise<{ url: string; filename: string }> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const filename = `${prefix}-${uniqueSuffix}${ext}`;

    const result = await this.fileStorageAdapter.uploadFile({
      buffer,
      filename,
      folder,
      mimetype,
      prefix,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload file');
    }

    // Если файловый сервис вернул относительный путь, формируем публичный URL
    // Для S3 уже будет полный URL, для локального хранилища - относительный путь
    let fullUrl = result.url;
    if (result.url.startsWith('/files/')) {
      // Если указан публичный URL (через домен), используем его
      // Иначе возвращаем относительный путь (frontend будет использовать через nginx)
      if (this.filePublicUrl) {
        fullUrl = `${this.filePublicUrl}${result.url}`;
      } else {
        // Относительный путь - frontend будет обращаться через nginx
        fullUrl = result.url;
      }
    }

    return {
      url: fullUrl,
      filename: result.filename,
    };
  }

  /**
   * Удаляет файл по URL или пути
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const result = await this.fileStorageAdapter.deleteFile(filePath);
      return result.success;
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Проверяет существование файла
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const result = await this.fileStorageAdapter.fileExists(filePath);
      return result.exists;
    } catch {
      return false;
    }
  }

  /**
   * Скачивает аватарку пользователя из Telegram CDN
   */
  async downloadTelegramAvatar(
    telegramUser: TelegramUserData & { photo_url?: string },
  ): Promise<string | null> {
    try {
      if (!telegramUser.photo_url) {
        return null;
      }

      const avatarUrl = telegramUser.photo_url;

      // Скачиваем файл во временный буфер
      const buffer = await this.downloadFileToBuffer(avatarUrl);
      if (!buffer) {
        return null;
      }

      // Определяем расширение
      const fileExtension = this.getFileExtensionFromUrl(avatarUrl) || '.jpg';
      const mimetype = this.getMimeTypeFromExtension(fileExtension);

      // Загружаем через файловый сервис
      const result = await this.uploadFile(
        buffer,
        `avatar${fileExtension}`,
        'avatars',
        mimetype,
        'avatar',
      );

      return result.url;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        'Error downloading avatar from Telegram:',
        errorMessage,
      );
      return null;
    }
  }

  /**
   * Скачивает файл по URL в буфер
   */
  private async downloadFileToBuffer(url: string): Promise<Buffer | null> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(
              new Error(
                `HTTP ${response.statusCode}: ${response.statusMessage}`,
              ),
            );
            return;
          }

          const chunks: Buffer[] = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        })
        .on('error', reject);
    });
  }

  /**
   * Определяет расширение файла из URL
   */
  private getFileExtensionFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const extension = pathname.split('.').pop();

      if (
        extension &&
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
          extension.toLowerCase(),
        )
      ) {
        return '.' + extension.toLowerCase();
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Получает MIME тип по расширению
   */
  private getMimeTypeFromExtension(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext.toLowerCase()] || 'image/jpeg';
  }
}
