import { GoogleBooksService, GoogleBookResult } from "./GoogleBooksService";
import { OpenLibraryService } from "./OpenLibraryService";
import { normalizeForMatching } from "../utils/stringUtils";
import { mergeSearchResults, mergeIsbnResults } from "./BookMergeService";

/**
 * Relevance Scoring Constants
 * Named constants for maintainability
 */
const RELEVANCE_SCORE = {
  COVER_IMAGE: 20,
  EXACT_TITLE_MATCH: 30,
  PARTIAL_TITLE_MATCH: 15,
  AUTHOR_MATCH: 20,
  LANGUAGE_MATCH: 15,
  HAS_METADATA: 5,
} as const;

/**
 * The Hybrid Search Engine
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
   * @param signal Optional AbortSignal for request cancellation
   */
  search: async (
    query: string,
    lang: string = "tr",
    searchType: "book" | "author" = "book",
    signal?: AbortSignal,
  ): Promise<GoogleBookResult[]> => {
    // 1. Check if ISBN - use enriched search for better results
    if (SearchEngine.isISBN(query)) {
      return await SearchEngine.searchByIsbnEnriched(query, lang, signal);
    }

    // 2. Hybrid Search (Parallel)
    try {
      const [googleBooks, openLibBooks] = await Promise.all([
        GoogleBooksService.searchBooks(query, lang, searchType, true, signal), // Skip fallback
        OpenLibraryService.searchBooks(query, searchType, signal),
      ]);

      // 3. Smart Merge Results (Enrichment)
      // Akıllı birleştirme: Eksik alanları karşı kaynaktan tamamla
      const allBooks = mergeSearchResults(googleBooks, openLibBooks);

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
      // AbortError hariç hataları logla
      if (error instanceof Error && error.name !== "AbortError") {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Search Engine Error:", message);
      }
      return [];
    }
  },

  /**
   * ISBN ile zenginleştirilmiş arama
   * Google Books ve Open Library'den paralel veri çeker
   * Sonuçları akıllıca birleştirir (kapak önceliklendirmeli)
   *
   * @param isbn ISBN-10 veya ISBN-13
   * @param lang Dil tercihi
   * @param signal Optional AbortSignal for request cancellation
   * @returns Birleştirilmiş sonuçlar (genellikle 1, bazen 2+ farklı baskı)
   */
  searchByIsbnEnriched: async (
    isbn: string,
    lang: string = "tr",
    signal?: AbortSignal,
  ): Promise<GoogleBookResult[]> => {
    try {
      // Paralel sorgu - her iki kaynaktan da veri çek
      const [googleResult, olResult] = await Promise.allSettled([
        GoogleBooksService.searchByIsbn(isbn, lang, signal),
        OpenLibraryService.searchByIsbn(isbn, signal),
      ]);

      // Sonuçları çıkar (hata varsa null)
      const googleBook =
        googleResult.status === "fulfilled" ? googleResult.value : null;
      const olBookRaw = olResult.status === "fulfilled" ? olResult.value : null;

      // Open Library result'unu GoogleBookResult formatına çevir
      const olBook = olBookRaw
        ? (OpenLibraryService.toGoogleBookFormat(olBookRaw) as GoogleBookResult)
        : null;

      // Akıllı birleştirme
      return mergeIsbnResults(googleBook, olBook);
    } catch (error) {
      // AbortError hariç hataları logla
      if (error instanceof Error && error.name !== "AbortError") {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error("SearchByIsbnEnriched Error:", message);
      }
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

  // 1. Cover Image
  if (info.imageLinks?.thumbnail) {
    score += RELEVANCE_SCORE.COVER_IMAGE;
  }

  // 2. Title Match
  if (normalizedTitle === normalizedQuery) {
    score += RELEVANCE_SCORE.EXACT_TITLE_MATCH; // Exact match
  } else if (normalizedTitle.includes(normalizedQuery)) {
    score += RELEVANCE_SCORE.PARTIAL_TITLE_MATCH; // Partial match
  }

  // 3. Author Match
  if (normalizedAuthors.includes(normalizedQuery)) {
    score += RELEVANCE_SCORE.AUTHOR_MATCH;
  }

  // 4. Language Match
  if (info.language === targetLang) {
    score += RELEVANCE_SCORE.LANGUAGE_MATCH;
  }

  // 5. Metadata Bonus
  if (info.pageCount && info.pageCount > 0)
    score += RELEVANCE_SCORE.HAS_METADATA;
  if (info.industryIdentifiers && info.industryIdentifiers.length > 0)
    score += RELEVANCE_SCORE.HAS_METADATA;

  return score;
}
