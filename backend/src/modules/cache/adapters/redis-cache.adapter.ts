import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisConnectionFactory } from './redis-connection.factory';

interface CachedUserData<T = unknown> {
  data: T;
  expires: number;
  lastAccess: number;
  version: number;
  tags: string[];
}

@Injectable()
export class RedisCacheAdapter implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheAdapter.name);
  public client!: Redis;
  private tagIndex = new Map<string, Set<string>>();

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private isExpectedError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message || '';
      return (
        message.includes("Stream isn't writeable") ||
        message.includes('ECONNREFUSED') ||
        message.includes('ENOTFOUND') ||
        message.includes('connect ECONNREFUSED') ||
        message.includes('Connection is closed')
      );
    }
    return false;
  }

  public isConnected(): boolean {
    return this.client && this.client.status === 'ready';
  }

  private initializeRedis(): void {
    this.client = RedisConnectionFactory.createClient(
      this.configService,
      0, // db: 0 для кэша
      this.logger,
    );

    this.client.on('connect', () => {
      this.logger.log('✅ Connected to Redis Cache');
    });

    this.client.on('error', (error: unknown) => {
      if (!this.isExpectedError(error)) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('❌ Redis Cache unexpected error:', errorMessage);
      }
    });
  }

  async getFromCache<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected()) {
        return null;
      }
      const value = await this.client.get(key);
      if (!value) return null;

      const cached: CachedUserData<T> = JSON.parse(value) as CachedUserData<T>;
      const now = Date.now();

      if (cached.expires <= now) {
        await this.client.del(key);
        this.removeFromTagIndex(key, cached.tags);
        return null;
      }

      // Обновляем lastAccess
      cached.lastAccess = now;
      await this.client.set(key, JSON.stringify(cached));

      return cached.data as T;
    } catch (error) {
      if (!this.isExpectedError(error)) {
        this.logger.error(`Failed to get cache key ${key}:`, error);
      }
      return null;
    }
  }

  async setToCache<T>(
    key: string,
    data: T,
    ttl: number,
    tags: string[] = [],
  ): Promise<void> {
    try {
      if (!this.isConnected()) {
        return;
      }
      const now = Date.now();
      const cached: CachedUserData = {
        data,
        expires: now + ttl,
        lastAccess: now,
        version: 1,
        tags: [...tags, `user:${key}`],
      };

      const ttlSeconds = Math.ceil(ttl / 1000);
      await this.client.setex(key, ttlSeconds, JSON.stringify(cached));

      this.addToTagIndex(key, cached.tags);
    } catch (error) {
      if (!this.isExpectedError(error)) {
        this.logger.error(`Failed to set cache key ${key}:`, error);
      }
    }
  }

  async invalidateUserCache(telegramID: string): Promise<void> {
    try {
      if (!this.isConnected()) {
        return;
      }
      const cached = await this.getFromCache<CachedUserData>(telegramID);
      if (cached) {
        const cachedData: CachedUserData | null = await this.client
          .get(telegramID)
          .then((v) => (v ? (JSON.parse(v) as CachedUserData) : null));
        if (cachedData) {
          await this.removeFromTagIndex(telegramID, cachedData.tags);
        }
      }
      await this.client.del(telegramID);
    } catch (error) {
      if (!this.isExpectedError(error)) {
        this.logger.error(
          `Failed to invalidate cache for ${telegramID}:`,
          error,
        );
      }
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      if (!this.isConnected()) {
        return;
      }
      const keysToInvalidate = new Set<string>();

      for (const tag of tags) {
        const tagSet = this.tagIndex.get(tag);
        if (tagSet) {
          for (const key of tagSet) {
            keysToInvalidate.add(key);
          }
        }
      }

      if (keysToInvalidate.size > 0) {
        await this.client.del(...Array.from(keysToInvalidate));
        for (const key of keysToInvalidate) {
          const cachedData: CachedUserData | null = await this.client
            .get(key)
            .then((v) => (v ? (JSON.parse(v) as CachedUserData) : null))
            .catch(() => null);
          if (cachedData) {
            await this.removeFromTagIndex(key, cachedData.tags);
          }
        }
      }
    } catch (error) {
      if (!this.isExpectedError(error)) {
        this.logger.error(`Failed to invalidate cache by tags:`, error);
      }
    }
  }

  async invalidateAllCache(): Promise<void> {
    try {
      if (!this.isConnected()) {
        return;
      }
      await this.client.flushdb();
      this.tagIndex.clear();
    } catch (error) {
      if (!this.isExpectedError(error)) {
        this.logger.error('Failed to clear cache:', error);
      }
    }
  }

  private async addToTagIndex(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  private async removeFromTagIndex(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagSet = this.tagIndex.get(tag);
      if (tagSet) {
        tagSet.delete(key);
        if (tagSet.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis Cache connection closed');
  }
}
