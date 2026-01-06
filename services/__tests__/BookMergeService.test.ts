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
    });

    describe("mergeBooks", () => {
        const createGoogleBook = (
            overrides: Partial<GoogleBookResult["volumeInfo"]> = {}
        ): GoogleBookResult => ({
            id: "google-123",
            volumeInfo: {
                title: "Test Kitap",
                authors: ["Yazar"],
                ...overrides,
            },
        });

        const createOLBook = (
            overrides: Partial<GoogleBookResult["volumeInfo"]> = {}
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
                "At least one book source required"
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
});
