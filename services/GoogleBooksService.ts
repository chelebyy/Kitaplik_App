import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { logError } from "../utils/errorUtils";
import { convertISBN10ToISBN13, convertISBN13ToISBN10, normalizeISBN } from "../utils/isbnConverter";
import { OpenLibraryService } from "./OpenLibraryService";

export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
    categories?: string[];
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
   * @param query Search term
   * @param lang Language code (e.g., 'tr', 'en')
   * @returns List of books or empty array
   */
  searchBooks: async (
    query: string,
    lang: string = "tr",
  ): Promise<GoogleBookResult[]> => {
    try {
      // hl: Interface language (for snippets, etc.)
      // langRestrict: Restrict results to specific language (for book content/title)
      const response = await fetchWithTimeout(
        `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=10&hl=${lang}&langRestrict=${lang}`,
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      logError("GoogleBooksService.searchBooks", error);
      throw new Error("Kitap aranırken bir sorun oluştu.");
    }
  },

  /**
   * Search for a specific book by ISBN
   * Strategy:
   * 1. Try Google Books with original ISBN
   * 2. Try Google Books with converted ISBN (10↔13)
   * 3. Fallback to Open Library with both formats
   * 
   * @param isbn ISBN-10 or ISBN-13
   * @param lang Language code (e.g., 'tr', 'en')
   * @returns The first matching book or null
   */
  searchByIsbn: async (
    isbn: string,
    lang: string = "tr",
  ): Promise<GoogleBookResult | null> => {
    try {
      const normalized = normalizeISBN(isbn);

      // STEP 1: Try Google Books with original ISBN
      let result = await tryISBNSearch(normalized, lang);
      if (result) return result;

      // STEP 2: Try Google Books with converted format
      const isISBN10 = normalized.length === 10;
      const convertedISBN = isISBN10
        ? convertISBN10ToISBN13(normalized)
        : convertISBN13ToISBN10(normalized);

      if (convertedISBN) {
        result = await tryISBNSearch(convertedISBN, lang);
        if (result) return result;
      }

      // STEP 3: Fallback to Open Library
      const openLibResult = await OpenLibraryService.searchByIsbn(normalized);
      if (openLibResult) {
        return OpenLibraryService.toGoogleBookFormat(openLibResult);
      }

      // Try converted format in Open Library too
      if (convertedISBN) {
        const openLibResultConverted = await OpenLibraryService.searchByIsbn(convertedISBN);
        if (openLibResultConverted) {
          return OpenLibraryService.toGoogleBookFormat(openLibResultConverted);
        }
      }

      return null;
    } catch (error) {
      logError("GoogleBooksService.searchByIsbn", error);
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
): Promise<GoogleBookResult | null> {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}?q=isbn:${isbn}&hl=${lang}&langRestrict=${lang}`,
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }
    return null;
  } catch (error) {
    // Silent fail for individual attempts
    return null;
  }
}
