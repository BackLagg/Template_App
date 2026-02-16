import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { RedisCacheAdapter } from './adapters/redis-cache.adapter';
import { MemoryCacheAdapter } from './adapters/memory-cache.adapter';
import { AppConstants } from '../../constants/app.constants';

/**
 * Cache Module
 * Пытается использовать Redis, fallback на Memory Cache
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CACHE_ADAPTER',
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisCacheAdapter | MemoryCacheAdapter> => {
        const logger = new Logger('CacheModule');
        const isDev = configService.get<boolean>('app.isDevelopment');

        try {
          const redisHost =
            configService.get<string>('REDIS_HOST') ||
            (isDev ? 'localhost' : 'backend-redis');
          const redisPort =
            configService.get<number>('REDIS_PORT') || (isDev ? 6381 : 6379);

          if (isDev) {
            logger.log(
              `🔧 Attempting to connect to REDIS Cache (DEV mode - ${redisHost}:${redisPort})`,
            );
          } else {
            logger.log(
              `🔧 Attempting to connect to REDIS Cache (PROD mode - ${redisHost}:${redisPort})`,
            );
          }

          const redisAdapter = new RedisCacheAdapter(configService);

          // Ждем реального подключения с таймаутом
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Redis connection timeout (5s)'));
            }, 5000);

            const client = redisAdapter.client;

            if (!client) {
              clearTimeout(timeout);
              reject(new Error('Redis client not initialized'));
              return;
            }

            // Если уже подключен
            if (client.status === 'ready') {
              clearTimeout(timeout);
              resolve();
              return;
            }

            // Обработка ошибок
            const errorHandler = (err: Error): void => {
              clearTimeout(timeout);
              client.removeListener('ready', readyHandler);
              reject(err);
            };

            // Обработка успешного подключения
            const readyHandler = (): void => {
              clearTimeout(timeout);
              client.removeListener('error', errorHandler);
              resolve();
            };

            client.once('error', errorHandler);
            client.once('ready', readyHandler);
          });

          // Проверяем подключение реальной операцией
          await redisAdapter.setToCache(
            '__health_check__',
            true,
            AppConstants.CACHE.TTL.HEALTH_CHECK_SECONDS,
          );
          await redisAdapter.invalidateUserCache('__health_check__');

          logger.log('✅ Redis Cache connection successful');
          return redisAdapter;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          logger.warn(`⚠️ Redis Cache connection failed: ${errorMessage}`);
          logger.warn('⚠️  FALLBACK: Using IN-MEMORY cache');
          logger.warn('⚠️  Data will be lost on restart!');
          logger.warn('⚠️  Cache cleanup runs every 5 minutes');

          if (!isDev) {
            logger.error('⚠️  CRITICAL: Memory cache in PRODUCTION mode!');
            logger.error(
              '⚠️  Consider fixing Redis connection for production use!',
            );
          }

          const memoryAdapter = new MemoryCacheAdapter();
          logger.log('✅ In-memory cache adapter initialized');
          return memoryAdapter;
        }
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
