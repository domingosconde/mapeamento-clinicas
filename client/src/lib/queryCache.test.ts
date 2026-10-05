import { describe, expect, it } from "vitest";
import { QUERY_CACHE_TIMES, queryCache } from "./queryCache";

describe("query cache policy", () => {
  it("keeps the public list fresh for one minute and cached for ten minutes", () => {
    expect(queryCache.publicList).toEqual({
      staleTime: 60_000,
      gcTime: 10 * 60_000,
    });
  });

  it("uses a shorter freshness window for private lists", () => {
    expect(queryCache.privateList).toEqual({
      staleTime: 15_000,
      gcTime: 60_000,
    });
    expect(queryCache.privateList.staleTime).toBeLessThan(queryCache.publicList.staleTime);
  });

  it("keeps every cache entry alive longer than its freshness window", () => {
    for (const policy of Object.values(QUERY_CACHE_TIMES)) {
      expect(policy.gcTime).toBeGreaterThan(policy.staleTime);
    }
  });

  it("exposes the same immutable policy references used by consumers", () => {
    expect(queryCache.privateList).toBe(QUERY_CACHE_TIMES.privateList);
    expect(queryCache.publicDetail).toBe(QUERY_CACHE_TIMES.publicDetail);
  });
});
