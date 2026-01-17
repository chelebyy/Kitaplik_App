import { fetchWithRetry, RetryPresets } from "../utils/fetchWithRetry";
import { logErrorWithCrashlytics } from "../utils/errorUtils";
import {
  convertISBN10ToISBN13,
  convertISBN13ToISBN10,
  normalizeISBN,
} from "../utils/isbnConverter";
import { normalizeForMatching } from "../utils/stringUtils";
import { OpenLibraryService } from "./OpenLibraryService";

export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    language?: string; // ISO 639-1 language code (e.g., "en", "tr")
    imageLinks?: {
      thumbnail: string;
    };
    categories?: string[];
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export const GoogleBooksService = {
  /**
   * Search for books by general query (title, author, etc.)
   * Uses smart search strategy:
   * 1. First try with specific prefix (intitle: or inauthor:)
   * 2. If no results, fallback to general search
   * 3. Filter irrelevant results with relevance scoring
   * 4. Prioritize books with cover images
   * 5. Sort by language preference
   * @param query Search term
   * @param lang Language code (e.g., 'tr', 'en')
   * @param searchType 'book' or 'author' search
   * @param signal Optional AbortSignal for request cancellation
   * @returns List of books or empty array
   */
  searchBooks: async (
    query: string,
    lang: string = "tr",
    searchType: "book" | "author" = "book",
    skipFallback: boolean = false,
    signal?: AbortSignal,
  ): Promise<GoogleBookResult[]> => {
    try {
      // STEP 1: Try specific search first
      const prefix = searchType === "author" ? "inauthor:" : "intitle:";
      let specificResults = await searchWithPrefix(prefix, query, lang, signal);

      if (specificResults.length > 0) {
        // Apply filters
        const filtered = filterRelevantResults(
          query,
          specificResults,
          searchType,
        );
        const withCovers = prioritizeCovers(filtered);
        return filterByLanguage(withCovers, lang);
      }

      // STEP 2: Fallback to general search
      // STEP 2: Fallback to general search
      let generalResults = await searchWithPrefix("", query, lang, signal);
      const filtered = filterRelevantResults(query, generalResults, searchType);
      const withCovers = prioritizeCovers(filtered);
      let finalResults = filterByLanguage(withCovers, lang);

      // STEP 3: IF results are scarce, try Open Library Fallback
      if (!skipFallback && finalResults.length < 5) {
        try {
          const openLibraryResults = await OpenLibraryService.searchBooks(
            query,
            searchType,
            signal,
          );

          if (openLibraryResults.length > 0) {
            // Convert to Google Book format and merge
            // Use a Map to deduplicate by title (simple dedupe)
            const existingTitles = new Set(
              finalResults.map((b) => b.volumeInfo.title.toLowerCase()),
            );

            const newBooks = openLibraryResults.filter((b) => {
              if (!b.volumeInfo.title) return false;
              const title = b.volumeInfo.title.toLowerCase();
              if (existingTitles.has(title)) return false;
              existingTitles.add(title);
              return true;
            });

            finalResults = [
              ...finalResults,
              ...filterByLanguage(newBooks, lang),
            ];
          }
        } catch (olError) {
          // Silent fail for fallback
          logError("OpenLibraryFallback", olError);
        }
      }

      return finalResults;
    } catch (error) {
      await logErrorWithCrashlytics("GoogleBooksService.searchBooks", error);
      throw new Error("Kitap aranırken bir sorun oluştu.");
    }
  },

  /**
   * Search for a specific book by ISBN
   * Strategy: Parallel execution for performance (60-70% faster)
   * 1. Try Google Books with original ISBN
   * 2. Try Google Books with converted ISBN (10↔13)
   * 3. Fallback to Open Library with both formats
   *
   * @param isbn ISBN-10 or ISBN-13
   * @param lang Language code (e.g., 'tr', 'en')
   * @param signal Optional AbortSignal for request cancellation
   * @returns The first matching book or null
   */
  searchByIsbn: async (
    isbn: string,
    lang: string = "tr",
    signal?: AbortSignal,
  ): Promise<GoogleBookResult | null> => {
    try {
      const normalized = normalizeISBN(isbn);
      const isISBN10 = normalized.length === 10;
      const convertedISBN = isISBN10
        ? convertISBN10ToISBN13(normalized)
        : convertISBN13ToISBN10(normalized);

      // Parallel execution: tüm aramaları aynı anda başlat
      const searchPromises: Promise<GoogleBookResult | null>[] = [];

      // Google Books - orijinal ISBN
      searchPromises.push(tryISBNSearch(normalized, lang, signal));

      // Google Books - çevrilmiş ISBN
      if (convertedISBN) {
        searchPromises.push(tryISBNSearch(convertedISBN, lang, signal));
      }

      // Open Library - orijinal ISBN
      const olPromise1 = OpenLibraryService.searchByIsbn(
        normalized,
        signal,
      ).then((result) =>
        result ? OpenLibraryService.toGoogleBookFormat(result) : null,
      );
      searchPromises.push(olPromise1);

      // Open Library - çevrilmiş ISBN
      if (convertedISBN) {
        const olPromise2 = OpenLibraryService.searchByIsbn(
          convertedISBN,
          signal,
        ).then((result) =>
          result ? OpenLibraryService.toGoogleBookFormat(result) : null,
        );
        searchPromises.push(olPromise2);
      }

      // Promise.allSettled: tüm promise'ları paralel çalıştır, ilk başarılıyı dön
      const results = await Promise.allSettled(searchPromises);

      // İlk başarılı sonucu dön
      for (const result of results) {
        if (result.status === "fulfilled" && result.value !== null) {
          return result.value;
        }
      }

      return null;
    } catch (error) {
      await logErrorWithCrashlytics("GoogleBooksService.searchByIsbn", error);
      throw new Error("Barkod taranırken bir sorun oluştu.");
    }
  },
};

/**
 * Helper function to search by a single ISBN
 */
async function tryISBNSearch(
  isbn: string,
  lang: string,
  signal?: AbortSignal,
): Promise<GoogleBookResult | null> {
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}?q=isbn:${isbn}&hl=${lang}&langRestrict=${lang}`,
      { signal },
      RetryPresets.standard,
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }
    return null;
  } catch (error) {
    // AbortError hariç hataları logla
    if (error instanceof Error && error.name !== "AbortError") {
      await logErrorWithCrashlytics("GoogleBooksService.searchByIsbn", error);
    }
    return null;
  }
}

/**
 * Helper function to search with a specific prefix
 * @param prefix - Search prefix (e.g., "intitle:", "inauthor:", "")
 * @param query - Search query
 * @param lang - Language code
 * @param signal - Optional AbortSignal for request cancellation
 * @returns List of books or empty array
 */
async function searchWithPrefix(
  prefix: string,
  query: string,
  lang: string,
  signal?: AbortSignal,
): Promise<GoogleBookResult[]> {
  try {
    const searchQuery = prefix ? `${prefix}${query}` : query;
    const encodedQuery = encodeURIComponent(searchQuery);
    // maxResults=40 to get more candidates for filtering
    const url = `${BASE_URL}?q=${encodedQuery}&langRestrict=${lang}&maxResults=40&printType=books`;

    const response = await fetchWithRetry(
      url,
      { signal },
      RetryPresets.standard,
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items;
    }
    return [];
  } catch (error) {
    // AbortError hariç hataları logla
    if (error instanceof Error && error.name !== "AbortError") {
      await logErrorWithCrashlytics("GoogleBooksService.searchWithPrefix", error);
    }
    return [];
  }
}

/**
 * Filter and sort books by language preference
 * Books in the requested language come first, followed by others
 * @param books - Array of books to filter
 * @param preferredLang - Preferred language code (e.g., "en", "tr")
 * @returns Sorted array with preferred language books first
 */
function filterByLanguage(
  books: GoogleBookResult[],
  preferredLang: string,
): GoogleBookResult[] {
  // Separate books by language
  const preferredBooks: GoogleBookResult[] = [];
  const otherBooks: GoogleBookResult[] = [];

  books.forEach((book) => {
    const bookLang = book.volumeInfo.language;

    // If no language info, include it (don't be too restrictive)
    if (!bookLang) {
      otherBooks.push(book);
      return;
    }

    // Check if book matches preferred language
    if (bookLang === preferredLang || bookLang.startsWith(preferredLang)) {
      preferredBooks.push(book);
    } else {
      otherBooks.push(book);
    }
  });

  // Return preferred books first, then others
  return [...preferredBooks, ...otherBooks];
}

/**
 * Filter irrelevant results based on query relevance
 * Removes books that don't match the search query well enough
 * @param query - Search query
 * @param books - Books to filter
 * @param searchType - 'book' or 'author'
 * @returns Filtered books with high relevance
 */

function filterRelevantResults(
  query: string,
  books: GoogleBookResult[],
  searchType: "book" | "author",
): GoogleBookResult[] {
  // Normalize both query and content for comparison
  const normalizedQuery = normalizeForMatching(query.trim());
  const queryWords = normalizedQuery.split(/\s+/);

  return books.filter((book) => {
    const title = book.volumeInfo.title || "";
    const authors = book.volumeInfo.authors?.join(" ") || "";

    const rawTarget = searchType === "author" ? authors : title;
    const normalizedTarget = normalizeForMatching(rawTarget);

    // Check if at least 70% of query words appear in the target
    const matchedWords = queryWords.filter((word) =>
      normalizedTarget.includes(word),
    );

    const matchRatio = matchedWords.length / queryWords.length;
    return matchRatio >= 0.7; // At least 70% word match
  });
}

/**
 * Prioritize books with cover images
 * Books with covers come first
 * @param books - Books to sort
 * @returns Sorted books with covers first
 */
function prioritizeCovers(books: GoogleBookResult[]): GoogleBookResult[] {
  const withCovers: GoogleBookResult[] = [];
  const withoutCovers: GoogleBookResult[] = [];

  books.forEach((book) => {
    if (book.volumeInfo.imageLinks?.thumbnail) {
      withCovers.push(book);
    } else {
      withoutCovers.push(book);
    }
  });

  return [...withCovers, ...withoutCovers];
}
