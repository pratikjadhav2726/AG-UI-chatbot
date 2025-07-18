/**
 * Intelligent caching system for MCP server
 * Provides multiple caching strategies and automatic invalidation
 */

import NodeCache from 'node-cache';
import crypto from 'crypto';
import type { CacheConfig } from '../types/mcp.js';
import { getLogger } from './logger.js';

export interface CacheEntry<T = unknown> {
  value: T;
  timestamp: number;
  hits: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  keys: number;
  hitRate: number;
}

export class Cache {
  private cache: NodeCache;
  private config: CacheConfig;
  private stats: CacheStats;
  private logger = getLogger();

  constructor(config: CacheConfig) {
    this.config = config;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      keys: 0,
      hitRate: 0,
    };

    if (!config.enabled) {
      // Create a no-op cache if disabled
      this.cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
      return;
    }

    this.cache = new NodeCache({
      stdTTL: config.ttl,
      checkperiod: Math.floor(config.ttl / 2),
      useClones: false,
      maxKeys: config.maxSize,
    });

    // Set up event listeners for cache operations
    this.cache.on('set', (key: string, value: unknown) => {
      this.stats.sets++;
      this.stats.keys = this.cache.keys().length;
      this.updateHitRate();
      this.logger.debug('Cache set', { key, type: 'cache_set' });
    });

    this.cache.on('del', (key: string, value: unknown) => {
      this.stats.deletes++;
      this.stats.keys = this.cache.keys().length;
      this.logger.debug('Cache delete', { key, type: 'cache_delete' });
    });

    this.cache.on('expired', (key: string, value: unknown) => {
      this.stats.deletes++;
      this.stats.keys = this.cache.keys().length;
      this.logger.debug('Cache expired', { key, type: 'cache_expired' });
    });
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(prefix: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);

    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(sortedParams))
      .digest('hex')
      .substring(0, 16);

    return `${prefix}:${hash}`;
  }

  /**
   * Get value from cache
   */
  get<T = unknown>(key: string): T | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      this.logger.debug('Cache hit', { key, type: 'cache_hit' });
    } else {
      this.stats.misses++;
      this.logger.debug('Cache miss', { key, type: 'cache_miss' });
    }

    this.updateHitRate();
    return value;
  }

  /**
   * Set value in cache
   */
  set<T = unknown>(key: string, value: T, ttl?: number): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const success = this.cache.set(key, value, ttl || this.config.ttl);
    
    if (success) {
      this.stats.size += this.estimateSize(value);
    }

    return success;
  }

  /**
   * Delete value from cache
   */
  delete(key: string): number {
    if (!this.config.enabled) {
      return 0;
    }

    const deleted = this.cache.del(key);
    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    if (!this.config.enabled) {
      return;
    }

    this.cache.flushAll();
    this.stats.deletes += this.stats.keys;
    this.stats.keys = 0;
    this.stats.size = 0;
    this.logger.info('Cache cleared', { type: 'cache_clear' });
  }

  /**
   * Get or set pattern - if key exists, return it, otherwise compute and cache
   */
  async getOrSet<T>(
    key: string,
    computeFn: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const value = await computeFn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Cache template generation results
   */
  cacheTemplate(templateType: string, params: Record<string, unknown>, result: unknown, ttl?: number): void {
    const key = this.generateKey(`template:${templateType}`, params);
    this.set(key, result, ttl);
  }

  /**
   * Get cached template
   */
  getCachedTemplate<T = unknown>(templateType: string, params: Record<string, unknown>): T | undefined {
    const key = this.generateKey(`template:${templateType}`, params);
    return this.get<T>(key);
  }

  /**
   * Cache data source results
   */
  cacheDataSource(sourceId: string, query: string, result: unknown, ttl?: number): void {
    const key = this.generateKey(`datasource:${sourceId}`, { query });
    this.set(key, result, ttl);
  }

  /**
   * Get cached data source result
   */
  getCachedDataSource<T = unknown>(sourceId: string, query: string): T | undefined {
    const key = this.generateKey(`datasource:${sourceId}`, { query });
    return this.get<T>(key);
  }

  /**
   * Cache resource content
   */
  cacheResource(uri: string, content: unknown, ttl?: number): void {
    const key = `resource:${uri}`;
    this.set(key, content, ttl);
  }

  /**
   * Get cached resource
   */
  getCachedResource<T = unknown>(uri: string): T | undefined {
    const key = `resource:${uri}`;
    return this.get<T>(key);
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    if (!this.config.enabled) {
      return 0;
    }

    const keys = this.cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    let deleted = 0;
    for (const key of matchingKeys) {
      deleted += this.cache.del(key);
    }

    this.logger.info('Cache pattern invalidated', { 
      pattern, 
      deletedKeys: deleted,
      type: 'cache_invalidate' 
    });

    return deleted;
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get cache key TTL
   */
  getTtl(key: string): number | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    return this.cache.getTtl(key);
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private estimateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate in bytes
    } catch {
      return 100; // Default size estimate
    }
  }
}

// Default cache instance
let defaultCache: Cache | null = null;

export function createCache(config: CacheConfig): Cache {
  return new Cache(config);
}

export function setDefaultCache(cache: Cache): void {
  defaultCache = cache;
}

export function getCache(): Cache {
  if (!defaultCache) {
    throw new Error('Cache not initialized. Call setDefaultCache() first.');
  }
  return defaultCache;
}

// Convenience function for creating a cache with sensible defaults
export function createDefaultCache(): Cache {
  return createCache({
    enabled: true,
    ttl: 300, // 5 minutes
    maxSize: 1000,
    strategy: 'lru',
  });
}