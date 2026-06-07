/**
 * Lightweight cache with TTL support
 * Can be swapped for Redis by implementing the same interface
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private maxItems: number;

  constructor(maxItems: number = 1000) {
    this.maxItems = maxItems;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxItems) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async keys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.store.keys());
    if (!pattern) return keys;
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(k => regex.test(k));
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    });
  }
}

// Singleton instance
export const cache = new Cache();

// Auto-cleanup every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

export default cache;
