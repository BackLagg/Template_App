import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

export interface FileUploadRequest {
  buffer: Buffer;
  filename: string;
  folder: string;
  mimetype: string;
  prefix?: string;
}

export interface FileUploadResponse {
  success: boolean;
  filename: string;
  url: string;
  path: string;
  size: number;
  error?: string;
}

export interface FileDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FileExistsResponse {
  exists: boolean;
  error?: string;
}

export interface StorageStatus {
  available: boolean;
  storageType: 's3' | 'local' | 'unknown';
  timestamp: string;
}

@Injectable()
export class FileStorageAdapterService implements OnModuleInit {
  private readonly logger = new Logger(FileStorageAdapterService.name);
  private readonly fileServiceUrl: string;
  private readonly fileServiceApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.fileServiceUrl =
      this.configService.get<string>('app.fileServiceUrl') ||
      'http://localhost:3002';
    this.fileServiceApiKey =
      this.configService.get<string>('app.fileServiceApiKey') || '';

    if (!this.fileServiceApiKey) {
      this.logger.warn(
        '⚠️ FILE_API_KEY not configured! Requests to file service will fail!',
      );
    }
  }

  async onModuleInit(): Promise<void> {
    await this.checkFileServiceAvailability();
  }

  /**
   * Проверяет доступность файлового сервиса при старте
   */
  private async checkFileServiceAvailability(): Promise<void> {
    try {
      const status = await this.getFileServiceStatus();
      if (status.available) {
        this.logger.log(
          `✅ File service is available (storage: ${status.storageType})`,
        );
      } else {
        this.logger.error('❌ File service is not available');
      }
    } catch (error) {
      this.logger.error(
        '❌ Failed to connect to file service:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Получает заголовки для запросов к файловому сервису
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    let cleanApiKey = (this.fileServiceApiKey || '').trim();

    if (cleanApiKey) {
      cleanApiKey = cleanApiKey.replace(
        /[\r\n\u0000-\u001F\u007F-\u009F]/g,
        '',
      );
      if (cleanApiKey) {
        headers['X-API-Key'] = cleanApiKey;
      }
    }

    return headers;
  }

  /**
   * Загружает файл через файловый сервис
   */
  async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', request.buffer, {
        filename: request.filename,
        contentType: request.mimetype,
      });
      formData.append('folder', request.folder);
      if (request.prefix) {
        formData.append('prefix', request.prefix);
      }

      const headers = {
        ...this.getHeaders(),
        ...formData.getHeaders(),
      };

      const response = await firstValueFrom(
        this.httpService.post<FileUploadResponse>(
          `${this.fileServiceUrl}/api/upload`,
          formData,
          {
            headers,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      this.logger.error('Error uploading file to file service:', error);
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      return {
        success: false,
        filename: request.filename,
        url: '',
        path: '',
        size: 0,
        error:
          err.response?.data?.error || err.message || 'Failed to upload file',
      };
    }
  }

  /**
   * Удаляет файл
   */
  async deleteFile(filePath: string): Promise<FileDeleteResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<FileDeleteResponse>(
          `${this.fileServiceUrl}/api/delete`,
          {
            data: { path: filePath },
            headers: this.getHeaders(),
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      this.logger.error('Error deleting file:', error);
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      return {
        success: false,
        message:
          err.response?.data?.error || err.message || 'Failed to delete file',
      };
    }
  }

  /**
   * Проверяет существование файла
   */
  async fileExists(filePath: string): Promise<FileExistsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<FileExistsResponse>(
          `${this.fileServiceUrl}/api/exists`,
          {
            params: { path: filePath },
            headers: this.getHeaders(),
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      this.logger.error('Error checking file existence:', error);
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      return {
        exists: false,
        error:
          err.response?.data?.error || err.message || 'Failed to check file',
      };
    }
  }

  /**
   * Получает статус файлового сервиса
   */
  async getFileServiceStatus(): Promise<StorageStatus> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<StorageStatus>(
          `${this.fileServiceUrl}/api/status`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      this.logger.error('Error getting file service status:', error);
      return {
        available: false,
        storageType: 'unknown',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Получает информацию о типе хранилища из файлового сервиса
   */
  async getStorageType(): Promise<'s3' | 'local' | 'unknown'> {
    try {
      const status = await this.getFileServiceStatus();
      return status.storageType;
    } catch {
      return 'unknown';
    }
  }
}
