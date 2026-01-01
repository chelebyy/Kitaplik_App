import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { logError } from "../utils/errorUtils";
import { convertISBN10ToISBN13, convertISBN13ToISBN10, normalizeISBN } from "../utils/isbnConverter";
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
   * @returns List of books or empty array
   */
  searchBooks: async (
    query: string,
    lang: string = "tr",
    searchType: "book" | "author" = "book",
  ): Promise<GoogleBookResult[]> => {
    try {
      // STEP 1: Try specific search first
      const prefix = searchType === "author" ? "inauthor:" : "intitle:";
      let specificResults = await searchWithPrefix(prefix, query, lang);

      if (specificResults.length > 0) {
        // Apply filters
        const filtered = filterRelevantResults(query, specificResults, searchType);
        const withCovers = prioritizeCovers(filtered);
        return filterByLanguage(withCovers, lang);
      }

      // STEP 2: Fallback to general search
      let generalResults = await searchWithPrefix("", query, lang);
      const filtered = filterRelevantResults(query, generalResults, searchType);
      const withCovers = prioritizeCovers(filtered);
      return filterByLanguage(withCovers, lang);
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

/**
 * Helper function to search with a specific prefix
 * @param prefix - Search prefix (e.g., "intitle:", "inauthor:", "")
 * @param query - Search query
 * @param lang - Language code
 * @returns List of books or empty array
 */
async function searchWithPrefix(
  prefix: string,
  query: string,
  lang: string,
): Promise<GoogleBookResult[]> {
  try {
    const searchQuery = prefix ? `${prefix}${query}` : query;
    const response = await fetchWithTimeout(
      `${BASE_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=10&hl=${lang}&langRestrict=${lang}`,
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    // Silent fail, return empty array
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
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  return books.filter((book) => {
    const title = book.volumeInfo.title?.toLowerCase() || "";
    const authors = book.volumeInfo.authors?.map(a => a.toLowerCase()).join(" ") || "";

    const searchTarget = searchType === "author" ? authors : title;

    // Check if at least 70% of query words appear in the target
    const matchedWords = queryWords.filter(word =>
      searchTarget.includes(word)
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
