import { Book } from "../context/BooksContext";
import { fetchWithRetry, RetryPresets } from "../utils/fetchWithRetry";
import { logErrorWithCrashlytics } from "../utils/errorUtils";
import { getSecureRandomInt } from "../utils/cryptoUtils";

const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

// Google Books API response item interface
interface GoogleBooksApiItem {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    categories?: string[];
    imageLinks?: { thumbnail?: string };
    description?: string;
    pageCount?: number;
  };
}

export interface RecommendationResult {
  source: "library" | "external";
  book: Book;
}

export const RecommendationService = {
  /**
   * Picks a random book from the user's library that is marked as 'Okunacak'.
   */
  getRandomFromLibrary: async (books: Book[]): Promise<Book | null> => {
    const toReadBooks = books.filter((b) => b.status === "Okunacak");
    if (toReadBooks.length === 0) return null;

    const randomIndex = await getSecureRandomInt(toReadBooks.length);
    return toReadBooks[randomIndex];
  },

  /**
   * Fetches a recommendation from Google Books API based on a genre.
   * If no genre is provided, it defaults to 'Fiction'.
   * @param genre - Book genre to search for
   * @param excludedTitles - Titles to exclude from recommendations
   * @param signal - Optional AbortSignal for request cancellation
   */
  getDiscoveryRecommendation: async (
    genre: string = "Roman",
    excludedTitles: string[] = [],
    signal?: AbortSignal,
  ): Promise<Book | null> => {
    try {
      // Debug: Searching for genre
      // logError("RecommendationService.getDiscoveryRecommendation", `Searching for genre: ${genre}`);

      // 1. Try specific genre with Turkish language restriction
      let searchUrl = `${GOOGLE_BOOKS_API_URL}?q=subject:${encodeURIComponent(genre)}&langRestrict=tr&orderBy=relevance&maxResults=40&printType=books`;
      let response = await fetchWithRetry(
        searchUrl,
        { signal },
        RetryPresets.standard,
      );
      let data = await response.json();

      // 2. Fallback: Try without language restriction
      if (!data.items || data.items.length === 0) {
        // Debug: No results with TR filter, trying global
        searchUrl = `${GOOGLE_BOOKS_API_URL}?q=subject:${encodeURIComponent(genre)}&orderBy=relevance&maxResults=40&printType=books`;
        response = await fetchWithRetry(
          searchUrl,
          { signal },
          RetryPresets.standard,
        );
        data = await response.json();
      }

      // 3. Fallback: Try generic query (just the genre name)
      if (!data.items || data.items.length === 0) {
        // Debug: No results with subject, trying generic query
        searchUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(genre)}&maxResults=40&printType=books`;
        response = await fetchWithRetry(
          searchUrl,
          { signal },
          RetryPresets.standard,
        );
        data = await response.json();
      }

      if (!data.items || data.items.length === 0) {
        // Debug: Still no results found
        return null;
      }

      // Filter out books that are in the excluded list
      const candidates = data.items.filter((item: GoogleBooksApiItem) => {
        const title = item.volumeInfo.title;
        return (
          title &&
          !excludedTitles.some(
            (excluded) => excluded.toLowerCase() === title.toLowerCase(),
          )
        );
      });

      if (candidates.length === 0) {
        // Debug: All found books are already in the library
        return null;
      }

      // Pick a random book from the candidates
      const randomIndex = await getSecureRandomInt(candidates.length);
      const item = candidates[randomIndex];
      if (!item?.volumeInfo) return null; // Null safety
      const volumeInfo = item.volumeInfo;

      // Map Google Books API result to our Book interface
      return {
        id: item.id, // Use Google Books ID temporarily
        title: volumeInfo.title || "Bilinmeyen Kitap",
        author: volumeInfo.authors ? volumeInfo.authors[0] : "Bilinmeyen Yazar",
        status: "Okunacak", // Default status for new discoveries
        coverUrl:
          volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") ||
          "https://via.placeholder.com/128x192.png?text=No+Cover",
        genre: volumeInfo.categories ? volumeInfo.categories[0] : genre,
        progress: 0,
        addedAt: Date.now(),
        notes: volumeInfo.description || "",
        pageCount: volumeInfo.pageCount || 0,
        currentPage: 0,
      };
    } catch (error) {
      // AbortError hariç hataları logla
      if (error instanceof Error && error.name !== "AbortError") {
        await logErrorWithCrashlytics(
          "RecommendationService.getDiscoveryRecommendation",
          error,
        );
      }
      return null;
    }
  },

  /**
   * Determines the user's most frequent genre based on their library.
   */
  getFavoriteGenre: (books: Book[]): string => {
    if (books.length === 0) return "Roman";

    const genreCounts: Record<string, number> = {};
    books.forEach((book) => {
      if (book.genre) {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
      }
    });

    let favoriteGenre = "Roman";
    let maxCount = 0;

    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
      }
    });

    return favoriteGenre;
  },
};
