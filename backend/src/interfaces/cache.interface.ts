export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  totalRequests: number;
  hitRate: number;
}

export interface CacheStats {
  size: number;
  tags: string[];
  version: number;
}
