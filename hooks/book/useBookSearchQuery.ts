import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "../useDebounce";
import { SearchEngine } from "../../services/SearchEngine";
import { GoogleBookResult } from "../../services/GoogleBooksService";

/**
 * useBookSearchQuery hook options
 */
export interface UseBookSearchQueryOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Stale time in ms (default: 5 minutes) */
  staleTime?: number;
  /** Enable/disable the query (default: true) */
  enabled?: boolean;
  /** Initial search query */
  initialQuery?: string;
  /** Initial search type */
  initialSearchType?: "book" | "author";
}

/**
 * useBookSearchQuery hook return type
 * Backward compatible with useBookSearch
 */
export interface UseBookSearchQueryReturn {
  /** Current search query */
  query: string;
  /** Update search query */
  setQuery: (query: string) => void;
  /** Search results */
  results: GoogleBookResult[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Error object */
  error: Error | null;
  /** Search type: book title or author */
  searchType: "book" | "author";
  /** Update search type */
  setSearchType: (type: "book" | "author") => void;
  /** Manually trigger search (refetch) */
  search: () => Promise<void>;
  /** Clear all state */
  clear: () => void;
  /** Is fetching in background (for cache updates) */
  isFetching: boolean;
  /** Invalidate cache for current query */
  invalidate: () => Promise<void>;
}

/**
 * Query key factory for book search queries
 */
export const bookSearchKeys = {
  all: ["bookSearch"] as const,
  search: (query: string, searchType: "book" | "author") =>
    ["bookSearch", query, searchType] as const,
};

/**
 * useBookSearchQuery - React Query powered book search hook
 *
 * Features:
 * - Automatic caching (5 minutes fresh, 30 minutes in cache)
 * - Debounced search (300ms default)
 * - Deduplication of concurrent requests
 * - Background refetching
 * - Optimistic UI with previous data
 *
 * @param options - Hook configuration options
 * @returns UseBookSearchQueryReturn
 *
 * @example
 * ```tsx
 * const {
 *   query,
 *   setQuery,
 *   results,
 *   isLoading,
 *   searchType,
 *   setSearchType
 * } = useBookSearchQuery();
 *
 * return (
 *   <TextInput
 *     value={query}
 *     onChangeText={setQuery}
 *     placeholder="Kitap ara..."
 *   />
 * );
 * ```
 */
export function useBookSearchQuery(
  options: UseBookSearchQueryOptions = {},
): UseBookSearchQueryReturn {
  const {
    debounceMs = 300,
    staleTime = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    initialQuery = "",
    initialSearchType = "book",
  } = options;

  const queryClient = useQueryClient();

  // Local state for query and search type
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"book" | "author">(
    initialSearchType,
  );

  // Debounce the query
  const { debouncedValue: debouncedQuery } = useDebounce(query, debounceMs);

  // Query key for this search
  const queryKey = bookSearchKeys.search(debouncedQuery, searchType);

  // React Query hook
  const {
    data: results = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!debouncedQuery.trim()) {
        return [];
      }
      return SearchEngine.search(debouncedQuery, "tr", searchType, signal);
    },
    enabled: enabled && debouncedQuery.trim().length > 0,
    staleTime,
    // Keep previous data while loading new results
    placeholderData: (previousData) => previousData,
  });

  /**
   * Manually trigger search (refetch)
   */
  const search = useCallback(async () => {
    if (query.trim()) {
      await refetch();
    }
  }, [query, refetch]);

  /**
   * Clear all state
   */
  const clear = useCallback(() => {
    setQuery("");
    // Optionally clear cache for empty query
  }, []);

  /**
   * Invalidate cache for current query
   */
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isError,
    error: error as Error | null,
    searchType,
    setSearchType,
    search,
    clear,
    isFetching,
    invalidate,
  };
}
