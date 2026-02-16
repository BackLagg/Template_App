import { Injectable, Logger } from '@nestjs/common';
import { AppConstants } from '../../../constants/app.constants';
import { CacheStats } from '../../../interfaces/cache.interface';

interface CachedUserData<T = unknown> {
  data: T;
  expires: number;
  lastAccess: number;
  version: number;
  tags: string[];
}

@Injectable()
export class MemoryCacheAdapter {
  private readonly logger = new Logger(MemoryCacheAdapter.name);
  private userCache = new Map<string, CachedUserData>();
  private tagIndex = new Map<string, Set<string>>();
  private cacheVersion = 1;

  constructor() {
    this.logger.warn(
      '⚠️  Using IN-MEMORY cache - data will be lost on restart!',
    );
    this.logger.warn('⚠️  For production use Redis cache adapter');
    this.logger.log('📦 In-memory cache initialized');

    // Очистка истекших записей каждые 5 минут
    setInterval(
      () => this.cleanupExpiredCache(),
      AppConstants.CACHE.TTL.CLEANUP_INTERVAL_MS,
    );
    this.logger.log(
      `🔄 Cache cleanup scheduled every ${AppConstants.CACHE.TTL.CLEANUP_INTERVAL_MS / 1000}s`,
    );
  }

  async getFromCache<T>(key: string): Promise<T | null> {
    const cached = this.userCache.get(key);
    if (!cached) {
      return null;
    }

    const now = Date.now();

    if (cached.expires <= now) {
      this.userCache.delete(key);
      this.removeFromTagIndex(key, cached.tags);
      return null;
    }

    cached.lastAccess = now;
    return cached.data as T;
  }

  async setToCache<T>(
    key: string,
    data: T,
    ttl: number,
    tags: string[] = [],
  ): Promise<void> {
    const now = Date.now();

    const cached: CachedUserData = {
      data,
      expires: now + ttl,
      lastAccess: now,
      version: this.cacheVersion,
      tags: [...tags, `user:${key}`],
    };

    const oldCached = this.userCache.get(key);
    if (oldCached) {
      this.removeFromTagIndex(key, oldCached.tags);
    }

    this.userCache.set(key, cached);
    this.addToTagIndex(key, cached.tags);
  }

  async invalidateUserCache(telegramID: string): Promise<void> {
    const cached = this.userCache.get(telegramID);
    if (cached) {
      this.removeFromTagIndex(telegramID, cached.tags);
      this.userCache.delete(telegramID);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToInvalidate = new Set<string>();

    for (const tag of tags) {
      const tagSet = this.tagIndex.get(tag);
      if (tagSet) {
        for (const key of tagSet) {
          keysToInvalidate.add(key);
        }
      }
    }

    for (const key of keysToInvalidate) {
      const cached = this.userCache.get(key);
      if (cached) {
        this.removeFromTagIndex(key, cached.tags);
      }
      this.userCache.delete(key);
    }
  }

  async invalidateAllCache(): Promise<void> {
    const size = this.userCache.size;
    this.userCache.clear();
    this.tagIndex.clear();
    this.cacheVersion++;
    this.logger.log(`Cache CLEARED: ${size} entries removed`);
  }

  getCacheStats(): CacheStats {
    return {
      size: this.userCache.size,
      tags: Array.from(this.tagIndex.keys()),
      version: this.cacheVersion,
    };
  }

  private addToTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  private removeFromTagIndex(key: string, tags: string[]): void {
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

  private cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    const beforeSize = this.userCache.size;

    for (const [key, value] of this.userCache.entries()) {
      if (value.expires <= now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      const cached = this.userCache.get(key);
      if (cached) {
        this.removeFromTagIndex(key, cached.tags);
      }
      this.userCache.delete(key);
    }

    if (expiredKeys.length > 0) {
      this.logger.log(
        `🧹 Cache cleanup: removed ${expiredKeys.length} expired entries (${beforeSize} → ${this.userCache.size})`,
      );
    }
  }
}
