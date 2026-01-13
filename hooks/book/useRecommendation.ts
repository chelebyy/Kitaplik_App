import { useState, useCallback } from "react";
import { useBooks, Book } from "../../context/BooksContext";
import { RecommendationService } from "../../services/RecommendationService";

/**
 * useRecommendation hook return type
 */
export interface UseRecommendationReturn {
  /** Önerilen kitap */
  recommendation: Book | null;
  /** Yükleniyor durumu */
  isLoading: boolean;
  /** Hata durumu */
  isError: boolean;
  /** Öneri kaynağı: library veya external */
  source: "library" | "external" | null;
  /** Yeni öneri al */
  refresh: () => Promise<void>;
}

/**
 * useRecommendation - Kitap öneri hook'u
 *
 * Kütüphaneden veya harici API'den kitap önerisi alır.
 * Önce kütüphanedeki "Okunacak" kitaplardan rastgele seçer,
 * yoksa favori türe göre harici API'den öneri getirir.
 *
 * @returns UseRecommendationReturn
 *
 * @example
 * ```tsx
 * const { recommendation, isLoading, source, refresh } = useRecommendation();
 *
 * // Modal açıldığında
 * useEffect(() => {
 *   refresh();
 * }, []);
 * ```
 */
export function useRecommendation(): UseRecommendationReturn {
  const { books } = useBooks();

  const [recommendation, setRecommendation] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [source, setSource] = useState<"library" | "external" | null>(null);

  /**
   * Öneriyi yenile
   */
  const refresh = useCallback(async () => {
    // Önceki request'i iptal et
    const controller = new AbortController();
    const { signal } = controller;

    setIsLoading(true);
    setIsError(false);

    try {
      // Önce kütüphaneden dene
      const libraryBook =
        await RecommendationService.getRandomFromLibrary(books);

      if (libraryBook) {
        setRecommendation(libraryBook);
        setSource("library");
        setIsLoading(false);
        return;
      }

      // Kütüphanede uygun kitap yoksa harici API'den al
      const favoriteGenre = RecommendationService.getFavoriteGenre(books);
      const excludedTitles = books.map((b) => b.title);

      const externalBook =
        await RecommendationService.getDiscoveryRecommendation(
          favoriteGenre,
          excludedTitles,
          signal,
        );

      // Eğer request iptal edildiyse state güncelleme
      if (!signal.aborted) {
        if (externalBook) {
          setRecommendation(externalBook);
          setSource("external");
        } else {
          setRecommendation(null);
          setSource(null);
        }
      }
    } catch (err) {
      // AbortError hariç hataları göster
      if (err instanceof Error && err.name !== "AbortError") {
        setIsError(true);
        setRecommendation(null);
        setSource(null);
      }
    } finally {
      // Sadece request iptal edilmediyse loading'i kapat
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [books]);

  return {
    recommendation,
    isLoading,
    isError,
    source,
    refresh,
  };
}
