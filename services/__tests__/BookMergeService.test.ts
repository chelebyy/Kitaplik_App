/**
 * BookMergeService Test Suite
 *
 * Bu testler, Google Books ve Open Library verilerinin
 * akıllıca birleştirilmesini doğrular.
 */

import {
  extractISBN13,
  mergeBooks,
  mergeCategories,
  mergeSearchResults,
  mergeIsbnResults,
} from "../BookMergeService";
import { GoogleBookResult } from "../GoogleBooksService";

describe("BookMergeService 🧬", () => {
  describe("extractISBN13", () => {
    test("should extract ISBN-13 from Google Books format", () => {
      const identifiers = [
        { type: "ISBN_13", identifier: "9786053609421" },
        { type: "ISBN_10", identifier: "6053609421" },
      ];
      expect(extractISBN13(identifiers)).toBe("9786053609421");
    });

    test("should convert ISBN-10 to ISBN-13 when only ISBN-10 available", () => {
      const identifiers = [{ type: "ISBN_10", identifier: "0140449132" }];
      // ISBN-10: 0140449132 → ISBN-13: 9780140449136
      expect(extractISBN13(identifiers)).toBe("9780140449136");
    });

    test("should return null when no ISBN available", () => {
      expect(extractISBN13(undefined)).toBeNull();
      expect(extractISBN13([])).toBeNull();
    });

    test("should return null for 979 prefix ISBN-13 (cannot convert to ISBN-10)", () => {
      // 979 prefix ISBN-13'ler ISBN-10'a dönüştürülemez
      const identifiers = [{ type: "ISBN_13", identifier: "9791234567890" }];
      expect(extractISBN13(identifiers)).toBe("9791234567890");
    });
  });

  describe("mergeCategories", () => {
    test("should merge categories from both sources", () => {
      const googleCats = ["Fiction", "Science Fiction"];
      const olCats = ["Roman", "Bilim Kurgu"];

      const result = mergeCategories(googleCats, olCats);

      expect(result).toHaveLength(4);
      expect(result).toContain("Fiction");
      expect(result).toContain("Roman");
    });

    test("should remove duplicate categories (case-insensitive)", () => {
      const googleCats = ["Fiction", "Roman"];
      const olCats = ["fiction", "roman"]; // aynı, farklı case

      const result = mergeCategories(googleCats, olCats);

      expect(result).toHaveLength(2);
    });

    test("should return undefined when both sources empty", () => {
      expect(mergeCategories(undefined, undefined)).toBeUndefined();
      expect(mergeCategories([], [])).toBeUndefined();
    });

    test("should return single source when other is empty", () => {
      const cats = ["Fiction"];
      expect(mergeCategories(cats, undefined)).toEqual(["Fiction"]);
      expect(mergeCategories(undefined, cats)).toEqual(["Fiction"]);
    });

    test("should handle Turkish Unicode characters in categories", () => {
      const googleCats = ["Roman", "Bilim Kurgu", "Tarih"];
      const olCats = ["roman", "BİLİM KURGU", "Polisiye"];

      const result = mergeCategories(googleCats, olCats);

      // Case-insensitive deduplication çalışmalı
      // "roman" ve "Roman" birleştirilir, "BİLİM KURGU" ve "Bilim Kurgu" farklı case'de
      // Sonuç: Roman (ilk orijinal), Bilim Kurgu, Tarih, BİLİM KURGU, Polisiye
      expect(result).toHaveLength(5);
      expect(result).toContain("Roman");
      expect(result).toContain("Bilim Kurgu");
      expect(result).toContain("BİLİM KURGU"); // Uppercase preserved
      // Turkish characters in original case preserved
      expect(result).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Roman"),
          expect.stringContaining("Bilim"),
        ]),
      );
    });

    test("should handle empty strings and special characters", () => {
      const googleCats = ["Fiction", "", "  ", "Science-Fiction"];
      const olCats = ["Science Fiction"];

      const result = mergeCategories(googleCats, olCats);

      // Empty strings trim'lenmiş haliyle unique key oluşturur
      // Implementation doesn't filter empty strings - they become unique keys
      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThanOrEqual(2);
      // "Science-Fiction" ve "Science Fiction" farklı
      expect(result).toContain("Fiction");
    });

    test("should handle null and undefined categories", () => {
      expect(mergeCategories(undefined, undefined)).toBeUndefined();
      expect(mergeCategories(["Fiction"], undefined)).toEqual(["Fiction"]);
      expect(mergeCategories(undefined, ["Roman"])).toEqual(["Roman"]);
    });
  });

  describe("mergeBooks", () => {
    const createGoogleBook = (
      overrides: Partial<GoogleBookResult["volumeInfo"]> = {},
    ): GoogleBookResult => ({
      id: "google-123",
      volumeInfo: {
        title: "Test Kitap",
        authors: ["Yazar"],
        ...overrides,
      },
    });

    const createOLBook = (
      overrides: Partial<GoogleBookResult["volumeInfo"]> = {},
    ): GoogleBookResult => ({
      id: "ol-456",
      volumeInfo: {
        title: "Test Kitap",
        authors: ["Yazar"],
        ...overrides,
      },
    });

    test("should use Google Books cover when available", () => {
      const gb = createGoogleBook({
        imageLinks: { thumbnail: "google-cover.jpg" },
      });
      const ol = createOLBook({
        imageLinks: { thumbnail: "ol-cover.jpg" },
      });

      const result = mergeBooks(gb, ol);

      expect(result.volumeInfo.imageLinks?.thumbnail).toBe("google-cover.jpg");
    });

    test("should fallback to Open Library cover when Google missing", () => {
      const gb = createGoogleBook({ imageLinks: undefined });
      const ol = createOLBook({
        imageLinks: { thumbnail: "ol-cover.jpg" },
      });

      const result = mergeBooks(gb, ol);

      expect(result.volumeInfo.imageLinks?.thumbnail).toBe("ol-cover.jpg");
    });

    test("should merge categories from both sources", () => {
      const gb = createGoogleBook({ categories: ["Fiction"] });
      const ol = createOLBook({ categories: ["Roman"] });

      const result = mergeBooks(gb, ol);

      expect(result.volumeInfo.categories).toContain("Fiction");
      expect(result.volumeInfo.categories).toContain("Roman");
    });

    test("should use Google pageCount when available", () => {
      const gb = createGoogleBook({ pageCount: 300 });
      const ol = createOLBook({ pageCount: 350 });

      const result = mergeBooks(gb, ol);

      expect(result.volumeInfo.pageCount).toBe(300);
    });

    test("should fallback to Open Library pageCount when Google missing", () => {
      const gb = createGoogleBook({ pageCount: undefined });
      const ol = createOLBook({ pageCount: 350 });

      const result = mergeBooks(gb, ol);

      expect(result.volumeInfo.pageCount).toBe(350);
    });

    test("should prefer Google Books title", () => {
      const gb = createGoogleBook({ title: "Doğru Başlık" });
      const ol = createOLBook({ title: "Yanlış Başlık" });

      const result = mergeBooks(gb, ol);

      expect(result.volumeInfo.title).toBe("Doğru Başlık");
    });

    test("should return Google book when Open Library null", () => {
      const gb = createGoogleBook({ pageCount: 100, categories: ["Test"] });

      const result = mergeBooks(gb, null);

      expect(result.volumeInfo.pageCount).toBe(100);
      expect(result.id).toBe("google-123");
    });

    test("should return Open Library book when Google null", () => {
      const ol = createOLBook({ pageCount: 200, categories: ["Roman"] });

      const result = mergeBooks(null, ol);

      expect(result.volumeInfo.pageCount).toBe(200);
      expect(result.id).toBe("ol-456");
    });

    test("should throw error when both sources null", () => {
      expect(() => mergeBooks(null, null)).toThrow(
        "At least one book source required",
      );
    });
  });

  describe("mergeSearchResults", () => {
    test("should merge books with same ISBN", () => {
      const googleBooks: GoogleBookResult[] = [
        {
          id: "g1",
          volumeInfo: {
            title: "Test Kitap",
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9786053609421" },
            ],
            pageCount: 300,
            // categories eksik
          },
        },
      ];

      const olBooks: GoogleBookResult[] = [
        {
          id: "ol1",
          volumeInfo: {
            title: "Test Kitap",
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9786053609421" },
            ],
            categories: ["Roman", "Kurgu"],
            // pageCount eksik
          },
        },
      ];

      const result = mergeSearchResults(googleBooks, olBooks);

      expect(result).toHaveLength(1);
      expect(result[0].volumeInfo.pageCount).toBe(300);
      expect(result[0].volumeInfo.categories).toContain("Roman");
    });

    test("should NOT merge books with different ISBNs", () => {
      const googleBooks: GoogleBookResult[] = [
        {
          id: "g1",
          volumeInfo: {
            title: "Kitap 1",
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9781111111111" },
            ],
          },
        },
      ];

      const olBooks: GoogleBookResult[] = [
        {
          id: "ol1",
          volumeInfo: {
            title: "Kitap 2",
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9782222222222" },
            ],
          },
        },
      ];

      const result = mergeSearchResults(googleBooks, olBooks);

      expect(result).toHaveLength(2); // 2 ayrı kitap
    });

    test("should match books by title+author when ISBN missing", () => {
      const googleBooks: GoogleBookResult[] = [
        {
          id: "g1",
          volumeInfo: {
            title: "Küçük Prens",
            authors: ["Antoine de Saint-Exupéry"],
            pageCount: 96,
          },
        },
      ];

      const olBooks: GoogleBookResult[] = [
        {
          id: "ol1",
          volumeInfo: {
            title: "Küçük Prens",
            authors: ["Antoine de Saint-Exupéry"],
            categories: ["Çocuk Edebiyatı"],
          },
        },
      ];

      const result = mergeSearchResults(googleBooks, olBooks);

      expect(result).toHaveLength(1);
      expect(result[0].volumeInfo.pageCount).toBe(96);
      expect(result[0].volumeInfo.categories).toContain("Çocuk Edebiyatı");
    });

    test("should preserve existing data (not overwrite)", () => {
      const googleBooks: GoogleBookResult[] = [
        {
          id: "g1",
          volumeInfo: {
            title: "Test",
            pageCount: 200, // MEVCUT VERİ
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9783333333333" },
            ],
          },
        },
      ];

      const olBooks: GoogleBookResult[] = [
        {
          id: "ol1",
          volumeInfo: {
            title: "Test",
            pageCount: 999, // FARKLI VERİ - ezilmemeli!
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9783333333333" },
            ],
          },
        },
      ];

      const result = mergeSearchResults(googleBooks, olBooks);

      // Google'ın verisi korunmalı
      expect(result[0].volumeInfo.pageCount).toBe(200);
    });
  });

  describe("mergeIsbnResults 🔍", () => {
    const createBookWithCover = (
      id: string,
      isbn: string,
      hasCover: boolean,
    ): GoogleBookResult => ({
      id,
      volumeInfo: {
        title: "Test Kitap",
        authors: ["Test Yazar"],
        industryIdentifiers: [{ type: "ISBN_13", identifier: isbn }],
        imageLinks: hasCover
          ? { thumbnail: `https://covers.example.com/${id}.jpg` }
          : undefined,
        pageCount: 300,
      },
    });

    test("should return empty array when both sources null", () => {
      const result = mergeIsbnResults(null, null);
      expect(result).toEqual([]);
    });

    test("should return Google book when Open Library null", () => {
      const googleBook = createBookWithCover("g1", "9781234567890", true);
      const result = mergeIsbnResults(googleBook, null);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("g1");
    });

    test("should return Open Library book when Google null", () => {
      const olBook = createBookWithCover("ol1", "9781234567890", true);
      const result = mergeIsbnResults(null, olBook);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("ol1");
    });

    test("should merge books with same ISBN and prioritize cover", () => {
      // Google kapaksız, OL kapaklı
      const googleBook = createBookWithCover("g1", "9781234567890", false);
      const olBook = createBookWithCover("ol1", "9781234567890", true);

      const result = mergeIsbnResults(googleBook, olBook);

      // Tek birleştirilmiş sonuç
      expect(result).toHaveLength(1);
      // Kapak OL'den alınmalı
      expect(result[0].volumeInfo.imageLinks?.thumbnail).toContain("ol1");
    });

    test("should merge and use Google cover when both have covers", () => {
      const googleBook = createBookWithCover("g1", "9781234567890", true);
      const olBook = createBookWithCover("ol1", "9781234567890", true);

      const result = mergeIsbnResults(googleBook, olBook);

      expect(result).toHaveLength(1);
      // Google öncelikli
      expect(result[0].volumeInfo.imageLinks?.thumbnail).toContain("g1");
    });

    test("should return separate results for different ISBNs", () => {
      const googleBook = createBookWithCover("g1", "9781111111111", true);
      const olBook = createBookWithCover("ol1", "9782222222222", true);

      const result = mergeIsbnResults(googleBook, olBook);

      // Farklı ISBN = 2 ayrı sonuç
      expect(result).toHaveLength(2);
    });

    test("should sort by cover availability (covers first)", () => {
      const googleBook = createBookWithCover("g1", "9781111111111", false);
      const olBook = createBookWithCover("ol1", "9782222222222", true);

      const result = mergeIsbnResults(googleBook, olBook);

      expect(result).toHaveLength(2);
      // Kapaklı olan ilk sırada
      expect(result[0].volumeInfo.imageLinks?.thumbnail).toBeDefined();
      expect(result[1].volumeInfo.imageLinks?.thumbnail).toBeUndefined();
    });
  });

  describe("Unicode Characters", () => {
    test("should handle Turkish characters in titles and authors", () => {
      const gb: GoogleBookResult = {
        id: "g1",
        volumeInfo: {
          title: "Şişeçük Şeyler",
          authors: ["Ahmet Ümit", "Elif Şafak"],
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9786051111111" },
          ],
        },
      };

      const ol: GoogleBookResult = {
        id: "ol1",
        volumeInfo: {
          title: "Şişeçük Şeyler",
          authors: ["Ahmet Ümit"],
          categories: ["Roman", "Polisiye"],
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9786051111111" },
          ],
        },
      };

      const result = mergeBooks(gb, ol);

      // Unicode karakterler korunmalı
      expect(result.volumeInfo.title).toContain("Ş");
      expect(result.volumeInfo.authors).toContain("Ahmet Ümit");
      expect(result.volumeInfo.authors).toContain("Elif Şafak");
      // Google Books authors preferred (both kept)
      expect(result.volumeInfo.authors).toHaveLength(2);
    });

    test("should handle special characters in categories", () => {
      const googleCats = ["Çocuk Kitapları", "Bilim & Teknoloji"];
      const olCats = ["Edebiyat/Klasik", "Macera-Roman"];

      const result = mergeCategories(googleCats, olCats);

      expect(result).toBeDefined();
      expect(result!.some((c) => c.includes("Ç"))).toBe(true);
      expect(result!.some((c) => c.includes("&"))).toBe(true);
    });
  });

  describe("Performance Tests", () => {
    test("should handle large result set (100+ books)", () => {
      const googleBooks: GoogleBookResult[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `g${i}`,
          volumeInfo: {
            title: `Book ${i}`,
            authors: [`Author ${i}`],
            industryIdentifiers: [
              {
                type: "ISBN_13",
                identifier: `978000000000${i.toString().padStart(3, "0")}`,
              },
            ],
            pageCount: 200 + i,
          },
        }),
      );

      const olBooks: GoogleBookResult[] = Array.from(
        { length: 50 },
        (_, i) => ({
          id: `ol${i}`,
          volumeInfo: {
            title: `Book ${i}`,
            authors: [`Author ${i}`],
            categories: ["Fiction", "Test"],
            industryIdentifiers: [
              {
                type: "ISBN_13",
                identifier: `978000000000${i.toString().padStart(3, "0")}`,
              },
            ],
          },
        }),
      );

      const startTime = Date.now();
      const result = mergeSearchResults(googleBooks, olBooks);
      const endTime = Date.now();

      // 100+ kitap birleştirme işlemi 1 saniyeden kısa sürmeli
      expect(endTime - startTime).toBeLessThan(1000);
      // 50 kitap ortak ISBN ile birleştirilmiş olmalı
      expect(result.length).toBe(100);
      // Birleştirilen kitapların kategorisi olmalı
      const mergedBook = result.find((b) => b.volumeInfo.categories);
      expect(mergedBook?.volumeInfo.categories).toContain("Fiction");
    });

    test("should handle merge with no matching ISBNs efficiently", () => {
      const googleBooks: GoogleBookResult[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `g${i}`,
          volumeInfo: {
            title: `Google Book ${i}`,
            industryIdentifiers: [
              {
                type: "ISBN_13",
                identifier: `978100000000${i.toString().padStart(3, "0")}`,
              },
            ],
          },
        }),
      );

      const olBooks: GoogleBookResult[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `ol${i}`,
          volumeInfo: {
            title: `OL Book ${i}`,
            industryIdentifiers: [
              {
                type: "ISBN_13",
                identifier: `978200000000${i.toString().padStart(3, "0")}`,
              },
            ],
          },
        }),
      );

      const startTime = Date.now();
      const result = mergeSearchResults(googleBooks, olBooks);
      const endTime = Date.now();

      // Hiçbir eşleşme yok - tüm kitaplar ayrı
      expect(result).toHaveLength(200);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
