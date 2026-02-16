import { CacheMetrics, CacheStats } from '../../interfaces/cache.interface';

// Интерфейс для кэша (Redis/Memory)
export interface ICacheService {
  // Базовые операции
  getFromCache<T>(key: string): T | null;
  setToCache<T>(key: string, data: T, ttl: number, tags?: string[]): void;
  invalidateUserCache(telegramID: string): void;
  invalidateByTags(tags: string[]): void;
  invalidateAllCache(): void;

  // Метрики
  getCacheMetrics(): CacheMetrics;
  getCacheStats(): CacheStats;
}
