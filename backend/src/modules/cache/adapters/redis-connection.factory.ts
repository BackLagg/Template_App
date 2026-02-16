import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis Connection Factory
 * Централизованная логика создания Redis подключений для кэша
 */
export class RedisConnectionFactory {
  private static connections = new Map<number, Redis>();
  private static retryAttempts = new Map<number, number>();

  /**
   * Создать или получить существующий Redis клиент
   */
  static createClient(
    configService: ConfigService,
    db: number = 0,
    logger?: Logger,
    reuseConnection: boolean = false,
  ): Redis {
    if (reuseConnection && this.connections.has(db)) {
      const existingClient = this.connections.get(db)!;
      if (
        existingClient.status === 'ready' ||
        existingClient.status === 'connecting'
      ) {
        if (logger) {
          logger.log(`Reusing existing Redis connection (db: ${db})`);
        }
        return existingClient;
      }
    }

    const isDev = configService.get<boolean>('app.isDevelopment');
    // Используем REDIS_HOST из переменных окружения, если установлен, иначе fallback
    const host =
      configService.get<string>('REDIS_HOST') ||
      (isDev ? 'localhost' : 'backend-redis');
    const port =
      configService.get<number>('REDIS_PORT') || (isDev ? 6381 : 6379);
    const password = configService.get<string>('REDIS_PASSWORD');

    if (logger) {
      logger.log(
        `Connecting to Redis at ${host}:${port} (db: ${db}, ${isDev ? 'DEV' : 'PROD'} mode)`,
      );
    }

    this.retryAttempts.set(db, 0);

    const client = new Redis({
      host,
      port,
      password,
      db,
      retryStrategy: (): null => null,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      lazyConnect: false,
      connectTimeout: 5000,
    });

    let errorLogged = false;
    client.on('error', (error: unknown) => {
      if (!errorLogged && logger) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const isExpectedError =
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes("Stream isn't writeable") ||
          errorMessage.includes('ENOTFOUND');

        if (isExpectedError) {
          logger.warn(
            `⚠️ Redis (db: ${db}) unavailable: ${errorMessage} - using fallback`,
          );
        } else {
          logger.error(
            `❌ Redis (db: ${db}) unexpected error: ${errorMessage}`,
          );
        }
        errorLogged = true;
      }
    });

    client.on('ready', () => {
      if (logger) {
        logger.log(`✅ Redis (db: ${db}) connected successfully`);
      }
      errorLogged = false;
      this.retryAttempts.set(db, 0);
    });

    client.on('end', () => {
      if (reuseConnection) {
        this.connections.delete(db);
      }
    });

    if (reuseConnection) {
      this.connections.set(db, client);
    }

    return client;
  }

  static async closeAll(): Promise<void> {
    const closePromises = Array.from(this.connections.values()).map((client) =>
      client.quit().catch(() => {}),
    );
    await Promise.all(closePromises);
    this.connections.clear();
  }

  static getConnection(db: number): Redis | undefined {
    return this.connections.get(db);
  }
}
