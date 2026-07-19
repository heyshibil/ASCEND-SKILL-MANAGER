import {
  jest,
  test,
  expect,
  describe,
  afterEach,
} from "@jest/globals";

// Mock Redis — withCache and invalidateCache both depend on this
const mockGet = jest.fn();
const mockSet = jest.fn().mockResolvedValue("OK" as never);
const mockDel = jest.fn().mockResolvedValue(1 as never);

jest.unstable_mockModule("../../config/redis.js", () => ({
  redisConnection: {
    on: jest.fn(),
    get: mockGet,
    set: mockSet,
    del: mockDel,
  },
}));

// Dynamic imports after mocks
const { withCache, invalidateCache } = await import("../cache.js");
const { redisConnection } = await import("../../config/redis.js");

// ─── withCache ─────────────────────────────────────────────────────────────────
describe("withCache", () => {
  const cacheKey = "test:key";
  const options = { ttl: 300, stale: 60 };

  afterEach(() => {
    jest.clearAllMocks();
    mockSet.mockResolvedValue("OK" as never);
    mockDel.mockResolvedValue(1 as never);
  });

  // --- Cache MISS: fetcher must be called, result stored in Redis ---
  test("should call the fetcher on cache miss and return fresh data", async () => {
    mockGet.mockResolvedValueOnce(null as never); // no cache entry

    const freshData = { score: 90 };
    const mockFetcher = jest.fn().mockResolvedValueOnce(freshData as never);

    const result = await withCache(cacheKey, mockFetcher as any, options);

    expect(result).toEqual(freshData);
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  test("should store the fetched result in Redis on cache miss", async () => {
    mockGet.mockResolvedValueOnce(null as never);

    const freshData = { score: 90 };
    const mockFetcher = jest.fn().mockResolvedValueOnce(freshData as never);

    await withCache(cacheKey, mockFetcher as any, options);

    // Redis set should be called with the key, serialized data, and TTL
    expect(mockSet).toHaveBeenCalledWith(
      cacheKey,
      expect.stringContaining('"score":90'),
      "EX",
      options.ttl,
    );
  });

  // --- Cache HIT (fresh): fetcher must NOT be called ---
  test("should return cached data without calling fetcher when cache is fresh", async () => {
    const cachedData = { score: 75 };
    const freshCacheEntry = JSON.stringify({
      data: cachedData,
      cachedAt: Date.now() - 10 * 1000, // 10 seconds ago — well within stale: 60
    });

    mockGet.mockResolvedValueOnce(freshCacheEntry as never);
    const mockFetcher = jest.fn();

    const result = await withCache(cacheKey, mockFetcher as any, options);

    expect(result).toEqual(cachedData);
    expect(mockFetcher).not.toHaveBeenCalled(); // no fetcher call for fresh cache
  });

  test("should not write to Redis again when serving a fresh cache hit", async () => {
    const cachedData = { score: 75 };
    const freshCacheEntry = JSON.stringify({
      data: cachedData,
      cachedAt: Date.now() - 10 * 1000,
    });

    mockGet.mockResolvedValueOnce(freshCacheEntry as never);
    const mockFetcher = jest.fn();

    await withCache(cacheKey, mockFetcher as any, options);

    expect(redisConnection.set).not.toHaveBeenCalled();
  });

  // --- Cache HIT (stale): return stale data BUT trigger background refresh ---
  // SWR (stale-while-revalidate): user never waits, but cache is refreshed in background
  test("should return stale cached data immediately when cache is stale", async () => {
    const staleData = { score: 50 };
    const staleCacheEntry = JSON.stringify({
      data: staleData,
      cachedAt: Date.now() - 90 * 1000, // 90s ago → stale (options.stale = 60)
    });

    mockGet.mockResolvedValueOnce(staleCacheEntry as never);
    const freshData = { score: 55 };
    const mockFetcher = jest.fn().mockResolvedValueOnce(freshData as never);

    const result = await withCache(cacheKey, mockFetcher as any, options);

    // Must return stale data immediately — not wait for refresh
    expect(result).toEqual(staleData);
  });

  test("should trigger a background refresh when cache is stale", async () => {
    const staleData = { score: 50 };
    const staleCacheEntry = JSON.stringify({
      data: staleData,
      cachedAt: Date.now() - 90 * 1000, // 90s ago → stale
    });

    mockGet.mockResolvedValueOnce(staleCacheEntry as never);
    const freshData = { score: 55 };
    const mockFetcher = jest.fn().mockResolvedValueOnce(freshData as never);

    await withCache(cacheKey, mockFetcher as any, options);

    // The background refresh calls fetcher() — it's fired immediately (fire-and-forget)
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  // --- Redis error: falls through to fetcher gracefully ---
  test("should fall through to fetcher when Redis.get throws an error", async () => {
    mockGet.mockRejectedValueOnce(new Error("Redis offline") as never);

    const freshData = { score: 99 };
    const mockFetcher = jest.fn().mockResolvedValueOnce(freshData as never);

    const result = await withCache(cacheKey, mockFetcher as any, options);

    // Should gracefully fall through to fetcher on Redis error
    expect(result).toEqual(freshData);
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });
});

// ─── invalidateCache ───────────────────────────────────────────────────────────
describe("invalidateCache", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockDel.mockResolvedValue(1 as never);
  });

  test("should call redis.del with all provided keys", async () => {
    const keys = ["dashboard:user-1", "leaderboard:score:page1:uid:user-1"];

    await invalidateCache(...keys);

    expect(redisConnection.del).toHaveBeenCalledTimes(1);
    expect(redisConnection.del).toHaveBeenCalledWith(keys);
  });

  test("should call redis.del with a single key", async () => {
    await invalidateCache("dashboard:user-2");

    expect(redisConnection.del).toHaveBeenCalledWith(["dashboard:user-2"]);
  });

  // Empty call should be a no-op — no redis interaction
  test("should NOT call redis.del when no keys are provided", async () => {
    await invalidateCache();

    expect(redisConnection.del).not.toHaveBeenCalled();
  });
});
