import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "../useDebounce";
import { SearchEngine } from "../../services/SearchEngine";
import { GoogleBookResult } from "../../services/GoogleBooksService";

/**
 * Google Books API'den gelen kitap sonuç tipi (Service'den alınır)
 */
// export interface GoogleBookResult { ... } -> Removed in favor of shared type

/**
 * useBookSearch hook'unun return type'ı
 */
export interface UseBookSearchReturn {
  /** Mevcut arama sorgusu */
  query: string;
  /** Arama sorgusunu güncelle */
  setQuery: (query: string) => void;
  /** Arama sonuçları */
  results: GoogleBookResult[];
  /** Yükleniyor durumu */
  isLoading: boolean;
  /** Hata durumu */
  isError: boolean;
  /** Hata objesi */
  error: Error | null;
  /** Arama tipi: kitap adı veya yazar */
  searchType: "book" | "author";
  /** Arama tipini güncelle */
  setSearchType: (type: "book" | "author") => void;
  /** Manuel arama tetikle (debounce beklemeden) */
  search: () => Promise<void>;
  /** Tüm state'i temizle */
  clear: () => void;
}

/**
 * useBookSearch - Kitap arama işlemlerini yöneten hook
 *
 * Debounce, loading state, error handling ve cleanup içerir.
 *
 * @param initialQuery - Başlangıç arama sorgusu (opsiyonel)
 * @returns UseBookSearchReturn
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
 * } = useBookSearch();
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
export function useBookSearch(initialQuery: string = ""): UseBookSearchReturn {
  // State
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchType, setSearchType] = useState<"book" | "author">("book");

  // Debounced query
  const { debouncedValue: debouncedQuery } = useDebounce(query, 300);

  /**
   * Arama fonksiyonu
   */
  const performSearch = useCallback(
    async (searchQuery: string, signal?: AbortSignal) => {
      // Boş sorgu kontrolü
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const searchResults = await SearchEngine.search(
          searchQuery,
          "tr",
          searchType,
          signal,
        );
        // Eğer request iptal edildiyse sonuçları güncelleme
        if (!signal?.aborted) {
          setResults(searchResults);
        }
      } catch (err) {
        // AbortError hariç hataları göster
        if (err instanceof Error && err.name !== "AbortError") {
          setIsError(true);
          setError(err);
          setResults([]);
        }
      } finally {
        // Sadece request iptal edilmediyse loading'i kapat
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [searchType],
  );

  /**
   * Debounced query değiştiğinde otomatik arama
   */
  useEffect(() => {
    if (debouncedQuery) {
      // Her yeni arama için yeni AbortController oluştur
      const controller = new AbortController();
      const { signal } = controller;

      performSearch(debouncedQuery, signal);

      // Cleanup: Component unmount veya yeni query geldiğinde request'i iptal et
      return () => {
        controller.abort();
      };
    }
  }, [debouncedQuery, performSearch]);

  /**
   * Manuel arama - debounce beklemeden
   */
  const search = useCallback(async () => {
    await performSearch(query);
  }, [query, performSearch]);

  /**
   * Tüm state'i temizle
   */
  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsLoading(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isError,
    error,
    searchType,
    setSearchType,
    search,
    clear,
  };
}
