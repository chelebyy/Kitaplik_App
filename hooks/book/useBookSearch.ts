import { useBookSearchQuery } from "./useBookSearchQuery";

/**
 * Compatibility layer for useBookSearch
 * Uses the new React Query implementation under the hood.
 * @deprecated Use useBookSearchQuery directly
 */
export { useBookSearchQuery as useBookSearch } from "./useBookSearchQuery";
