export const QUERY_CACHE_TIMES = {
  publicList: {
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  },
  publicDetail: {
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  },
  privateList: {
    staleTime: 15_000,
    gcTime: 60_000,
  },
  privateDetail: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  },
  auth: {
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  },
} as const;

export const queryCache = {
  publicList: QUERY_CACHE_TIMES.publicList,
  publicDetail: QUERY_CACHE_TIMES.publicDetail,
  privateList: QUERY_CACHE_TIMES.privateList,
  privateDetail: QUERY_CACHE_TIMES.privateDetail,
  auth: QUERY_CACHE_TIMES.auth,
} as const;
