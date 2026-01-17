import { fetchWithRetry, RetryPresets } from "../utils/fetchWithRetry";
import { logErrorWithCrashlytics } from "../utils/errorUtils";

export interface OpenLibraryBookResult {
  key: string;
  title?: string;
  authors?: { name: string }[];
  covers?: number[];
  subjects?: string[];
  number_of_pages?: number;
  isbn_10?: string[];
  isbn_13?: string[];
}

const BASE_URL = "https://openlibrary.org";

export interface OpenLibraryDoc {
  key: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  number_of_pages_median?: number;
  isbn?: string[];
}

export interface OpenLibrarySearchResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
}

// Google Books API compatible format for interoperability
export interface GoogleBookCompatible {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: { thumbnail: string };
    categories?: string[];
    pageCount?: number;
  };
}

export const OpenLibraryService = {
  /**
   * Search for books using Open Library Search API
   * @param query - Search term
   * @param type - 'book' (general) or 'author'
   * @param signal - Optional AbortSignal for request cancellation
   * @returns List of books converted to Google format
   */
  searchBooks: async (
    query: string,
    type: "book" | "author" = "book",
    signal?: AbortSignal,
  ): Promise<GoogleBookCompatible[]> => {
    try {
      const encodedQuery = encodeURIComponent(query);
      let url = `${BASE_URL}/search.json?q=${encodedQuery}&limit=20`;

      if (type === "author") {
        url = `${BASE_URL}/search.json?author=${encodedQuery}&limit=20`;
      }

      const response = await fetchWithRetry(
        url,
        { signal },
        RetryPresets.standard,
      );
      if (!response.ok) return [];

      const data: OpenLibrarySearchResponse = await response.json();

      if (data.docs && data.docs.length > 0) {
        // Filter items that have at least a title
        return data.docs
          .filter((doc) => doc.title)
          .map(OpenLibraryService.convertDocToGoogleFormat);
      }
      return [];
    } catch (error) {
      // AbortError hariç hataları logla
      if (error instanceof Error && error.name !== "AbortError") {
        await logErrorWithCrashlytics("OpenLibraryService.searchBooks", error);
      }
      return [];
    }
  },

  /**
   * Search for a book by ISBN using Open Library API
   * @param isbn - ISBN-10 or ISBN-13
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Book data or null if not found
   */
  searchByIsbn: async (
    isbn: string,
    signal?: AbortSignal,
  ): Promise<OpenLibraryBookResult | null> => {
    try {
      // Open Library ISBN endpoint
      const response = await fetchWithRetry(
        `${BASE_URL}/isbn/${isbn}.json`,
        { signal },
        RetryPresets.standard,
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // AbortError beklenen davranış, loglama
      if (error instanceof Error && error.name !== "AbortError") {
        await logErrorWithCrashlytics("OpenLibraryService.searchByIsbn", error);
      }
      return null;
    }
  },

  /**
   * Get cover image URL for a book
   * @param coverId - Cover ID from Open Library
   * @param size - Size: S (small), M (medium), L (large)
   * @returns Cover image URL
   */
  getCoverUrl: (coverId: number, size: "S" | "M" | "L" = "L"): string => {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  },

  /**
   * Convert Open Library Search Doc to GoogleBookResult format
   */
  convertDocToGoogleFormat: (doc: OpenLibraryDoc): GoogleBookCompatible => {
    return {
      id: doc.key.replace("/works/", ""),
      volumeInfo: {
        title: doc.title || "Bilinmeyen Kitap",
        authors: doc.author_name,
        imageLinks: doc.cover_i
          ? { thumbnail: OpenLibraryService.getCoverUrl(doc.cover_i, "M") }
          : undefined,
        categories: doc.subject?.slice(0, 1),
        pageCount: doc.number_of_pages_median,
      },
    };
  },

  /**
   * Convert Open Library result to our GoogleBookResult format
   * This allows us to use the same data structure across the app
   */
  toGoogleBookFormat: (
    openLibBook: OpenLibraryBookResult,
  ): {
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      imageLinks?: { thumbnail: string };
      categories?: string[];
      pageCount?: number;
    };
  } => {
    return {
      id: openLibBook.key,
      volumeInfo: {
        title: openLibBook.title || "Bilinmeyen Kitap",
        authors: openLibBook.authors?.map((a) => a.name),
        imageLinks: openLibBook.covers?.[0]
          ? {
              thumbnail: OpenLibraryService.getCoverUrl(
                openLibBook.covers[0],
                "M",
              ),
            }
          : undefined,
        categories: openLibBook.subjects?.slice(0, 1),
        pageCount: openLibBook.number_of_pages,
      },
    };
  },
};
