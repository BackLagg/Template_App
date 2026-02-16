import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { RedisCacheAdapter } from './adapters/redis-cache.adapter';
import { MemoryCacheAdapter } from './adapters/memory-cache.adapter';
import { CacheMetrics, CacheStats } from '../../interfaces/cache.interface';

@Injectable()
export class CacheService implements OnModuleInit {
  private cacheMetrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
    totalRequests: 0,
    hitRate: 0,
  };

  constructor(
    @Inject('CACHE_ADAPTER')
    private readonly cacheAdapter: RedisCacheAdapter | MemoryCacheAdapter,
  ) {}

  onModuleInit(): void {
    // Метрики обновляются при каждом запросе
  }

  async getFromCache<T>(key: string): Promise<T | null> {
    this.cacheMetrics.totalRequests++;

    const result = await this.cacheAdapter.getFromCache<T>(key);
    if (result) {
      this.cacheMetrics.hits++;
    } else {
      this.cacheMetrics.misses++;
    }
    return result;
  }

  async setToCache<T>(
    key: string,
    data: T,
    ttl: number,
    tags: string[] = [],
  ): Promise<void> {
    await this.cacheAdapter.setToCache(key, data, ttl, tags);
  }

  async invalidateUserCache(telegramID: string): Promise<void> {
    this.cacheMetrics.invalidations++;
    await this.cacheAdapter.invalidateUserCache(telegramID);
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    await this.cacheAdapter.invalidateByTags(tags);
  }

  async invalidateAllCache(): Promise<void> {
    await this.cacheAdapter.invalidateAllCache();
  }

  getCacheMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.cacheMetrics };
  }

  getCacheStats(): CacheStats & { metrics: CacheMetrics; adapter: string } {
    const stats =
      this.cacheAdapter instanceof MemoryCacheAdapter
        ? this.cacheAdapter.getCacheStats()
        : { size: 0, tags: [], version: 1 };

    return {
      ...stats,
      metrics: this.getCacheMetrics(),
      adapter:
        this.cacheAdapter instanceof RedisCacheAdapter ? 'Redis' : 'Memory',
    };
  }

  private updateMetrics(): void {
    this.cacheMetrics.hitRate =
      this.cacheMetrics.totalRequests > 0
        ? (this.cacheMetrics.hits / this.cacheMetrics.totalRequests) * 100
        : 0;
  }
}
