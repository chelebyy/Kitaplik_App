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
  },
}));

describe("SearchEngine 🦁", () => {
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
      }; // +20 cover, +30 title, +15 lang = 65

      const bookWrongLang = {
        id: "2",
        volumeInfo: {
          title: "Nutuk",
          language: "en",
          imageLinks: { thumbnail: "img" },
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9782" }],
        },
      }; // +20 cover, +30 title, +0 lang = 50

      const bookNoCover = {
        id: "3",
        volumeInfo: {
          title: "Nutuk",
          language: "tr",
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9783" }],
        },
      }; // +0 cover, +30 title, +15 lang = 45

      const bookVague = {
        id: "4",
        volumeInfo: {
          title: "Nutuk Analizi",
          language: "tr",
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9784" }],
        }, // Removed image to lower score
      }; // +0 cover, +15 title (partial), +15 lang = 30

      // Return them in shuffled order
      (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([
        bookNoCover,
        bookVague,
      ]);
      (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([
        bookWrongLang,
        bookPerfect,
      ]);

      // PASS "book" AS SEARCH TYPE
      const results = await SearchEngine.search(query, lang, "book");

      expect(results).toHaveLength(4);

      expect(results[0].id).toBe("1"); // Perfect (65)
      expect(results[1].id).toBe("2"); // WrongLang (50)
      expect(results[2].id).toBe("3"); // NoCover (45)
      expect(results[3].id).toBe("4"); // Vague (30)
    });
  });
});
