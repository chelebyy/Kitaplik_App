import { SearchEngine } from "./SearchEngine";
import { GoogleBooksService } from "./GoogleBooksService";
import { OpenLibraryService } from "./OpenLibraryService";

// Mock dependencies
jest.mock("./GoogleBooksService", () => ({
  GoogleBooksService: {
    searchByIsbn: jest.fn(),
    searchBooks: jest.fn(),
  },
}));

jest.mock("./OpenLibraryService", () => ({
  OpenLibraryService: {
    searchBooks: jest.fn(),
    searchByIsbn: jest.fn(),
    getCoverUrl: jest.fn(
      (id: number, size: string) =>
        `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`,
    ),
    toGoogleBookFormat: jest.fn((book: any) => ({
      id: book.key || "ol-" + Math.random(),
      volumeInfo: {
        title: book.title || "Test Book",
        authors: book.authors?.map((a: any) => a.name) || [],
        imageLinks: book.covers?.[0]
          ? {
              thumbnail: `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`,
            }
          : undefined,
        categories: book.subjects?.slice(0, 1),
        pageCount: book.number_of_pages,
        // Preserve ISBN identifiers for matching
        industryIdentifiers:
          book.isbn_13?.map((isbn: string) => ({
            type: "ISBN_13",
            identifier: isbn,
          })) ||
          book.isbn_10?.map((isbn: string) => ({
            type: "ISBN_10",
            identifier: isbn,
          })),
      },
    })),
  },
}));

// Mock fetchWithTimeout for timeout tests
jest.mock("../utils/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

describe("SearchEngine ", () => {
  describe("isISBN Detection", () => {
    const validISBNs = [
      "9786053609421", // ISBN-13
      "978-605-360-942-1", // ISBN-13 with dashes
      "0140449132", // ISBN-10
      "0-14-044913-2", // ISBN-10 with dashes
      "0-14-044913-X", // ISBN-10 with X
    ];

    const invalidInputs = [
      "Ahmet Ümit", // Plain text
      "12345", // Short number
      "978605360942122", // Too long
      "978-605-A60-942-1", // Contains letters (except X at end)
    ];

    test.each(validISBNs)("should identify '%s' as ISBN", (isbn) => {
      expect(SearchEngine.isISBN(isbn)).toBe(true);
    });

    test.each(invalidInputs)("should reject '%s' as not ISBN", (input) => {
      expect(SearchEngine.isISBN(input)).toBe(false);
    });
  });

  describe("search() Logic", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should sort results by relevance: Perfect > WrongLang > NoCover > Vague", async () => {
      const query = "Nutuk";
      const lang = "tr";

      const bookPerfect = {
        id: "1",
        volumeInfo: {
          title: "Nutuk",
          language: "tr",
          imageLinks: { thumbnail: "img" },
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9781" }],
        },
      };

      const bookWrongLang = {
        id: "2",
        volumeInfo: {
          title: "Nutuk",
          language: "en",
          imageLinks: { thumbnail: "img" },
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9782" }],
        },
      };

      const bookNoCover = {
        id: "3",
        volumeInfo: {
          title: "Nutuk",
          language: "tr",
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9783" }],
        },
      };

      const bookVague = {
        id: "4",
        volumeInfo: {
          title: "Nutuk Analizi",
          language: "tr",
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9784" }],
        },
      };

      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([
        bookNoCover,
        bookVague,
      ]);
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([
        bookWrongLang,
        bookPerfect,
      ]);

      const results = await SearchEngine.search(query, lang, "book");

      expect(results).toHaveLength(4);
      expect(results[0].id).toBe("1");
      expect(results[1].id).toBe("2");
      expect(results[2].id).toBe("3");
      expect(results[3].id).toBe("4");
    });
  });

  describe("searchByIsbnEnriched()", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return merged result when both sources have same ISBN", async () => {
      const googleBook = {
        id: "g1",
        volumeInfo: {
          title: "Test",
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9781234567890" },
          ],
          imageLinks: undefined,
        },
      };
      // OpenLibraryBookResult format (raw API response)
      const olBookRaw = {
        key: "ol1",
        title: "Test",
        isbn_13: ["9781234567890"],
        covers: [12345], // This will generate a cover URL
      };

      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(
        googleBook,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(
        olBookRaw,
      );

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results).toHaveLength(1);
      expect(results[0].volumeInfo.imageLinks?.thumbnail).toBe(
        "https://covers.openlibrary.org/b/id/12345-M.jpg",
      );
    });

    test("should return empty array when no results", async () => {
      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(null);
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results).toEqual([]);
    });

    test("should return Google book when OL fails", async () => {
      const googleBook = {
        id: "g1",
        volumeInfo: {
          title: "Test",
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9781234567890" },
          ],
          imageLinks: { thumbnail: "google-cover.jpg" },
        },
      };

      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(
        googleBook,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("g1");
    });
  });

  describe("AbortSignal - Request Cancellation", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should abort search when signal is triggered", async () => {
      const abortController = new AbortController();
      const { signal } = abortController;

      // Mock delay'li response
      (GoogleBooksService.searchBooks as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([]), 100);
          }),
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      // Abort immediately
      abortController.abort();

      const results = await SearchEngine.search("Nutuk", "tr", "book", signal);

      // Empty result because aborted
      expect(results).toEqual([]);
    });

    test("should abort ISBN enriched search when signal is triggered", async () => {
      const abortController = new AbortController();
      const { signal } = abortController;

      (GoogleBooksService.searchByIsbn as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(null), 100);
          }),
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      // Abort immediately
      abortController.abort();

      const results = await SearchEngine.searchByIsbnEnriched(
        "9786053609421",
        "tr",
        signal,
      );

      expect(results).toEqual([]);
    });
  });

  describe("Timeout Scenarios", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should handle timeout from Google Books gracefully", async () => {
      (GoogleBooksService.searchBooks as jest.Mock).mockRejectedValue(
        new Error("Request timeout"),
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      const results = await SearchEngine.search("Test Query", "tr", "book");

      // Timeout durumunda boş result dönmeli veya OL'den gelen sonuçlar
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test("should handle timeout from both services", async () => {
      (GoogleBooksService.searchBooks as jest.Mock).mockRejectedValue(
        new Error("Request timeout"),
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockRejectedValue(
        new Error("Request timeout"),
      );

      const results = await SearchEngine.search("Test Query", "tr", "book");

      // Her iki servis de timeout olursa boş result
      expect(results).toEqual([]);
    });

    test("should handle timeout in ISBN enriched search", async () => {
      (GoogleBooksService.searchByIsbn as jest.Mock).mockRejectedValue(
        new Error("Timeout"),
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockRejectedValue(
        new Error("Timeout"),
      );

      const results = await SearchEngine.searchByIsbnEnriched(
        "9786053609421",
        "tr",
      );

      expect(results).toEqual([]);
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should handle Google Books rate limit error", async () => {
      const rateLimitError = new Error("429 Too Many Requests");
      (GoogleBooksService.searchBooks as jest.Mock).mockRejectedValue(
        rateLimitError,
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([
        {
          id: "ol1",
          volumeInfo: {
            title: "Nutuk",
            authors: ["Mustafa Kemal Atatürk"],
          },
        },
      ]);

      const results = await SearchEngine.search("Nutuk", "tr", "book");

      // Error logged and empty array returned (Promise.all fails fast)
      expect(results).toEqual([]);
    });

    test("should handle 403 Forbidden error gracefully", async () => {
      (GoogleBooksService.searchBooks as jest.Mock).mockRejectedValue(
        new Error("403 Forbidden"),
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockRejectedValue(
        new Error("403 Forbidden"),
      );

      const results = await SearchEngine.search("Test", "tr", "book");

      expect(results).toEqual([]);
    });

    test("should handle network errors gracefully", async () => {
      (GoogleBooksService.searchBooks as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const results = await SearchEngine.search("Test", "tr", "book");

      expect(results).toEqual([]);
    });
  });

  describe("Unicode Query Handling", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should handle Turkish character search (ş, ı, ğ)", async () => {
      const query = "şişeçük şeyler";

      const googleResults = [
        {
          id: "g1",
          volumeInfo: {
            title: "Şişeçük Şeyler",
            authors: ["Test Yazar"],
            language: "tr",
            imageLinks: { thumbnail: "img" },
          },
        },
      ];

      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue(
        googleResults,
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      const results = await SearchEngine.search(query, "tr", "book");

      expect(results).toHaveLength(1);
      expect(results[0].volumeInfo.title).toContain("Ş");
    });

    test("should handle mixed language query", async () => {
      const query = "Ahmet Ümit";

      const googleResults = [
        {
          id: "g1",
          volumeInfo: {
            title: "İstanbul Hatırası",
            authors: ["Ahmet Ümit"],
            language: "tr",
            imageLinks: { thumbnail: "img" },
          },
        },
      ];

      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue(
        googleResults,
      );
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      const results = await SearchEngine.search(query, "tr", "author");

      expect(results).toHaveLength(1);
      expect(results[0].volumeInfo.authors).toContain("Ahmet Ümit");
    });

    test("should handle special characters in query", async () => {
      const query = "Olasılıksız";

      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([
        {
          id: "g1",
          volumeInfo: {
            title: "Olasılıksız",
            authors: ["Adam Fawer"],
            language: "tr",
          },
        },
      ]);
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      const results = await SearchEngine.search(query, "tr", "book");

      expect(results).toHaveLength(1);
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should handle empty query", async () => {
      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([]);
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      const results = await SearchEngine.search("", "tr", "book");

      expect(results).toEqual([]);
    });

    test("should handle whitespace-only query", async () => {
      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([]);
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      const results = await SearchEngine.search("   ", "tr", "book");

      expect(results).toEqual([]);
    });

    test("should handle very long query", async () => {
      const longQuery = "a".repeat(500);

      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([]);
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      const results = await SearchEngine.search(longQuery, "tr", "book");

      expect(results).toEqual([]);
    });

    test("should handle undefined language parameter", async () => {
      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([
        {
          id: "g1",
          volumeInfo: {
            title: "Test",
            authors: ["Author"],
          },
        },
      ]);
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([]);

      // Test undefined language (has default value in function)
      const results = await SearchEngine.search("Test", undefined, "book");

      expect(results).toBeDefined();
    });
  });

  describe("searchByIsbnEnriched with Merge", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should merge data from both sources when ISBN matches", async () => {
      const googleBook = {
        id: "g1",
        volumeInfo: {
          title: "Merged Book",
          authors: ["Google Author"],
          description: "Google description",
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9781234567890" },
          ],
          imageLinks: undefined, // Missing cover
          pageCount: 300,
        },
      };

      const olBookRaw = {
        key: "ol1",
        title: "Merged Book",
        isbn_13: ["9781234567890"],
        covers: [12345], // Has cover
        number_of_pages: 320, // Different page count
        subjects: ["Fiction", "Literature"],
      };

      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(
        googleBook,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(
        olBookRaw,
      );

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results).toHaveLength(1);
      expect(results[0].volumeInfo.title).toBe("Merged Book");
      // Should have cover from OpenLibrary
      expect(results[0].volumeInfo.imageLinks?.thumbnail).toBe(
        "https://covers.openlibrary.org/b/id/12345-M.jpg",
      );
    });

    test("should prefer Google Books data when both sources have same field", async () => {
      const googleBook = {
        id: "g1",
        volumeInfo: {
          title: "Google Title",
          authors: ["Google Author"],
          description: "Google description",
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9781234567890" },
          ],
          pageCount: 300,
        },
      };

      const olBookRaw = {
        key: "ol1",
        title: "OL Title",
        isbn_13: ["9781234567890"],
        authors: [{ name: "OL Author" }],
      };

      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(
        googleBook,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(
        olBookRaw,
      );

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results[0].volumeInfo.title).toBe("Google Title");
      expect(results[0].volumeInfo.authors).toEqual(["Google Author"]);
    });

    test("should use OpenLibrary cover when Google Books has no cover", async () => {
      const googleBook = {
        id: "g1",
        volumeInfo: {
          title: "Test",
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9781234567890" },
          ],
          // No imageLinks
        },
      };

      const olBookRaw = {
        key: "ol1",
        title: "Test",
        isbn_13: ["9781234567890"],
        covers: [99999],
      };

      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(
        googleBook,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(
        olBookRaw,
      );

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results[0].volumeInfo.imageLinks?.thumbnail).toContain(
        "covers.openlibrary.org",
      );
    });

    test("should not modify Google Book when OpenLibrary returns null", async () => {
      const googleBook = {
        id: "g1",
        volumeInfo: {
          title: "Google Only Book",
          authors: ["Author"],
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9781234567890" },
          ],
          imageLinks: { thumbnail: "google-cover.jpg" },
        },
      };

      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(
        googleBook,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results).toHaveLength(1);
      expect(results[0].volumeInfo.title).toBe("Google Only Book");
      expect(results[0].volumeInfo.imageLinks?.thumbnail).toBe(
        "google-cover.jpg",
      );
    });
  });

  describe("Error Handling in Enriched Search", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should handle Google Books API error gracefully", async () => {
      (GoogleBooksService.searchByIsbn as jest.Mock).mockRejectedValue(
        new Error("Google API Error"),
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results).toEqual([]);
    });

    test("should handle OpenLibrary API error gracefully", async () => {
      const googleBook = {
        id: "g1",
        volumeInfo: {
          title: "Test",
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9781234567890" },
          ],
        },
      };

      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue(
        googleBook,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockRejectedValue(
        new Error("OL API Error"),
      );

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      // Should still return Google Books result
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("g1");
    });

    test("should handle both APIs throwing errors", async () => {
      (GoogleBooksService.searchByIsbn as jest.Mock).mockRejectedValue(
        new Error("Google Error"),
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockRejectedValue(
        new Error("OL Error"),
      );

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results).toEqual([]);
    });

    test("should handle malformed response from Google Books", async () => {
      (GoogleBooksService.searchByIsbn as jest.Mock).mockResolvedValue({
        id: "g1",
        // Missing volumeInfo
      });
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      // Should handle gracefully
      expect(results).toBeDefined();
    });
  });

  describe("AbortSignal Cancellation Enhancement", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should abort ISBN search immediately when signal aborted", async () => {
      const abortController = new AbortController();
      const { signal } = abortController;

      (GoogleBooksService.searchByIsbn as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(null), 1000);
          }),
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      // Abort before calling
      abortController.abort();

      const results = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
        signal,
      );

      expect(results).toEqual([]);
      expect(GoogleBooksService.searchByIsbn).toHaveBeenCalledWith(
        "9781234567890",
        "tr",
        signal,
      );
    });

    test("should abort during fetch in enriched search", async () => {
      const abortController = new AbortController();
      const { signal } = abortController;

      let resolveGoogle: (value: any) => void;
      const googlePromise = new Promise((resolve) => {
        resolveGoogle = resolve;
      });

      (GoogleBooksService.searchByIsbn as jest.Mock).mockReturnValue(
        googlePromise,
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      // Start the search
      const resultsPromise = SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
        signal,
      );

      // Abort immediately
      abortController.abort();

      // Resolve Google after abort
      resolveGoogle!(null);

      const results = await resultsPromise;
      expect(results).toEqual([]);
    });

    test("should not affect subsequent searches after abort", async () => {
      const abortController = new AbortController();

      (GoogleBooksService.searchByIsbn as jest.Mock).mockImplementation(
        (isbn, lang, signal) => {
          if (signal?.aborted) {
            return Promise.reject(new DOMException("Aborted", "AbortError"));
          }
          return Promise.resolve({
            id: "g1",
            volumeInfo: {
              title: "Test",
              industryIdentifiers: [
                { type: "ISBN_13", identifier: "9781234567890" },
              ],
            },
          });
        },
      );
      (OpenLibraryService.searchByIsbn as jest.Mock).mockResolvedValue(null);

      // First search with abort
      abortController.abort();
      const results1 = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
        abortController.signal,
      );

      // Second search without abort
      const results2 = await SearchEngine.searchByIsbnEnriched(
        "9781234567890",
        "tr",
      );

      expect(results1).toEqual([]);
      expect(results2).toHaveLength(1);
    });
  });
});
