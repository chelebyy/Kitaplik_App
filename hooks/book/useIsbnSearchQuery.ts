import { useQuery } from "@tanstack/react-query";
import { SearchEngine } from "../../services/SearchEngine";

/**
 * useIsbnSearchQuery hook options
 */
export interface UseIsbnSearchQueryOptions {
  /** Stale time in ms (default: 24 hours) */
  staleTime?: number;
  /** Enable/disable the query (default: true) */
  enabled?: boolean;
  /** Language code (default: 'tr') */
  language?: string;
}

/**
 * Query key factory for ISBN search queries
 */
export const isbnSearchKeys = {
  all: ["isbnSearch"] as const,
  search: (isbn: string | null) => ["isbnSearch", isbn] as const,
};

/**
 * useIsbnSearchQuery - React Query powered ISBN search hook
 *
 * Features:
 * - Automatic caching (24 hours fresh)
 * - Specialized enriched search for ISBNs
 *
 * @param isbn - ISBN-10 or ISBN-13 string
 * @param options - Hook configuration options
 * @returns React Query result containing book results
 */
export function useIsbnSearchQuery(
  isbn: string | null,
  options: UseIsbnSearchQueryOptions = {},
) {
  const {
    staleTime = 24 * 60 * 60 * 1000, // 24 hours
    enabled = true,
    language = "tr",
  } = options;

  return useQuery({
    queryKey: isbnSearchKeys.search(isbn),
    queryFn: async ({ signal }) => {
      if (!isbn) return [];
      return SearchEngine.searchByIsbnEnriched(isbn, language, signal);
    },
    enabled: enabled && !!isbn,
    staleTime,
  });
}
