import { GoogleBooksService, GoogleBookResult } from "./GoogleBooksService";
import { OpenLibraryService } from "./OpenLibraryService";
import { normalizeForMatching } from "../utils/stringUtils";

/**
 * The Hybrid Search Engine 🦁
 * Orchestrates Google Books and Open Library to provide the best results.
 */
export const SearchEngine = {
  /**
   * Detects if the query is likely an ISBN (10 or 13 digits)
   * Supports dashes and spaces.
   */
  isISBN(query: string): boolean {
    // Remove dashes and spaces
    const clean = query.replaceAll(/[\s-]/g, "");

    // Check if it's 10 or 13 digits (last char can be X for ISBN-10)
    if (!/^\d{9,12}[\dX]$/.test(clean)) return false;

    return clean.length === 10 || clean.length === 13;
  },

  /**
   * Main search function
   * @param query Search term
   * @param lang User's app language (e.g. 'tr', 'en')
   * @param searchType Search strategy ('book' or 'author')
   */
  search: async (
    query: string,
    lang: string = "tr",
    searchType: "book" | "author" = "book",
  ): Promise<GoogleBookResult[]> => {
    // 1. Check if ISBN
    if (SearchEngine.isISBN(query)) {
      // Direct call to precise search
      const book = await GoogleBooksService.searchByIsbn(query, lang);
      return book ? [book] : [];
    }

    // 2. Hybrid Search (Parallel)
    try {
      const [googleBooks, openLibBooks] = await Promise.all([
        GoogleBooksService.searchBooks(query, lang, searchType, true), // Skip fallback
        OpenLibraryService.searchBooks(query, searchType),
      ]);

      // 3. Merge Results
      // Deduplicate by ID and Title key
      const mergedMap = new Map<string, GoogleBookResult>();

      // Helper to generate a unique key for deduplication
      const getUniqueKey = (book: GoogleBookResult) => {
        if (book.volumeInfo.industryIdentifiers?.length) {
          const isbn = book.volumeInfo.industryIdentifiers.find((id) =>
            id.type.includes("ISBN"),
          )?.identifier;
          if (isbn) return `isbn:${isbn}`;
        }
        // Fallback to title+author normalization
        const title = normalizeForMatching(book.volumeInfo.title || "");
        const auth = normalizeForMatching(book.volumeInfo.authors?.[0] || "");
        return `title:${title}|${auth}`;
      };

      // Add Google Books first (with unique key)
      googleBooks.forEach((book) => {
        const key = getUniqueKey(book);
        if (!mergedMap.has(key)) {
          mergedMap.set(key, book);
        }
      });

      // Add OpenLib books if not exists
      openLibBooks.forEach((book) => {
        const key = getUniqueKey(book);
        if (!mergedMap.has(key)) {
          mergedMap.set(key, book);
        }
      });

      const allBooks = Array.from(mergedMap.values());

      // 4. Score & Sort
      const scoredBooks = allBooks.map((book) => ({
        book,
        score: calculateRelevanceScore(book, query, lang),
      }));

      // Sort descending by score
      scoredBooks.sort((a, b) => b.score - a.score);

      // Return just the books
      return scoredBooks.map((item) => item.book);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Search Engine Error:", message);
      return [];
    }
  },
};

/**
 * Calculates a relevance score for a book based on the query and user preferences.
 *
 * Scoring Rules:
 * - Cover Image: +20
 * - Exact Title Match: +30
 * - Exact Author Match: +20
 * - Language Match: +15 (Dynamic)
 * - Page Count available: +5
 * - Published Date available: +5
 */
function calculateRelevanceScore(
  book: GoogleBookResult,
  query: string,
  targetLang: string,
): number {
  let score = 0;
  const info = book.volumeInfo;
  const normalizedQuery = normalizeForMatching(query.trim());
  const normalizedTitle = normalizeForMatching(info.title || "");
  const normalizedAuthors = normalizeForMatching(info.authors?.join(" ") || "");

  // 1. Cover Image (+20)
  if (info.imageLinks?.thumbnail) {
    score += 20;
  }

  // 2. Title Match (+30 / +15)
  if (normalizedTitle === normalizedQuery) {
    score += 30; // Exact match
  } else if (normalizedTitle.includes(normalizedQuery)) {
    score += 15; // Partial match
  }

  // 3. Author Match (+20)
  if (normalizedAuthors.includes(normalizedQuery)) {
    score += 20;
  }

  // 4. Language Match (+15)
  if (info.language === targetLang) {
    score += 15;
  }

  // 5. Metadata Bonus (+5 each)
  if (info.pageCount && info.pageCount > 0) score += 5;
  if (info.industryIdentifiers && info.industryIdentifiers.length > 0)
    score += 5;

  return score;
}
