import { redisConnection } from "../config/redis.js";

interface CacheOptions {
  ttl: number;   
  stale: number; 
}

export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions,
): Promise<T> => {
  try {
    const raw = await redisConnection.get(key);

    if (raw) {
      const { data, cachedAt } = JSON.parse(raw);
      const ageSeconds = (Date.now() - cachedAt) / 1000;

      // Data is stale - silently refresh in background
      if (ageSeconds > options.stale) {
        _refreshInBackground(key, fetcher, options.ttl);
      }

      return data as T;
    }
  } catch (err) {
    console.error(`[Cache Read Error] ${key}:`, err);
  }

  // Cache miss - fetch fresh data
  const fresh = await fetcher();

  redisConnection
    .set(key, JSON.stringify({ data: fresh, cachedAt: Date.now() }), "EX", options.ttl)
    .catch((err) => console.error(`[Cache Write Error] ${key}:`, err));

  return fresh;
};

// Fire-and-forget background refresh
const _refreshInBackground = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
): void => {
  fetcher()
    .then((fresh) =>
      redisConnection.set(
        key,
        JSON.stringify({ data: fresh, cachedAt: Date.now() }),
        "EX",
        ttl, 
      ),
    )
    .catch((err) => console.error(`[Cache Refresh Error] ${key}:`, err));
};

// Invalidate cache
export const invalidateCache = async (...keys: string[]): Promise<void> => {
  if (keys.length > 0) {
    await redisConnection
      .del(keys)
      .catch((err) => console.error(`[Cache Invalidation Error]:`, err));
  }
};
