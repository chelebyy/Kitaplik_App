/**
 * RecommendationService Test Suite
 */

import { RecommendationService } from "../RecommendationService";
import { Book } from "../../context/BooksContext";

// Mock fetchWithRetry
jest.mock("../../utils/fetchWithRetry", () => ({
  fetchWithRetry: jest.fn(),
  RetryPresets: {
    standard: { maxRetries: 3 },
    aggressive: { maxRetries: 5 },
    minimal: { maxRetries: 1 },
    none: { maxRetries: 0 },
  },
}));

// Mock logError
jest.mock("../../utils/errorUtils", () => ({
  logError: jest.fn(),
}));

// Mock cryptoUtils
jest.mock("../../utils/cryptoUtils", () => ({
  getSecureRandomInt: jest.fn(),
}));

import { fetchWithRetry } from "../../utils/fetchWithRetry";
import { logError } from "../../utils/errorUtils";
import { getSecureRandomInt } from "../../utils/cryptoUtils";

const mockFetchWithRetry = fetchWithRetry as jest.MockedFunction<
  typeof fetchWithRetry
>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockGetSecureRandomInt = getSecureRandomInt as jest.MockedFunction<
  typeof getSecureRandomInt
>;

describe("RecommendationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRandomFromLibrary", () => {
    it("should return null when library is empty", async () => {
      const result = await RecommendationService.getRandomFromLibrary([]);
      expect(result).toBeNull();
    });

    it("should return null when no books have Okunacak status", async () => {
      const books: Book[] = [
        {
          id: "1",
          title: "Okunuyor Kitap",
          author: "Author",
          status: "Okunuyor",
          coverUrl: "cover.jpg",
          addedAt: Date.now(),
        },
        {
          id: "2",
          title: "Okunmuş Kitap",
          author: "Author",
          status: "Okundu",
          coverUrl: "cover.jpg",
          addedAt: Date.now(),
        },
      ];

      const result = await RecommendationService.getRandomFromLibrary(books);
      expect(result).toBeNull();
    });

    it("should return a book from Okunacak status", async () => {
      const books: Book[] = [
        {
          id: "1",
          title: "Okunacak Kitap 1",
          author: "Author 1",
          status: "Okunacak",
          coverUrl: "cover1.jpg",
          addedAt: Date.now(),
        },
        {
          id: "2",
          title: "Okunacak Kitap 2",
          author: "Author 2",
          status: "Okunacak",
          coverUrl: "cover2.jpg",
          addedAt: Date.now(),
        },
      ];

      mockGetSecureRandomInt.mockResolvedValue(0);

      const result = await RecommendationService.getRandomFromLibrary(books);
      expect(result).not.toBeNull();
      expect(result?.status).toBe("Okunacak");
      expect(["Okunacak Kitap 1", "Okunacak Kitap 2"]).toContain(result?.title);
    });

    it("should filter only Okunacak books from mixed library", async () => {
      const books: Book[] = [
        {
          id: "1",
          title: "Okunacak Kitap",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          addedAt: Date.now(),
        },
        {
          id: "2",
          title: "Okunuyor Kitap",
          author: "Author",
          status: "Okunuyor",
          coverUrl: "cover.jpg",
          addedAt: Date.now(),
        },
        {
          id: "3",
          title: "Okunmuş Kitap",
          author: "Author",
          status: "Okundu",
          coverUrl: "cover.jpg",
          addedAt: Date.now(),
        },
      ];

      mockGetSecureRandomInt.mockResolvedValue(0);

      const result = await RecommendationService.getRandomFromLibrary(books);
      expect(result?.status).toBe("Okunacak");
      expect(result?.title).toBe("Okunacak Kitap");
    });
  });

  describe("getDiscoveryRecommendation", () => {
    const mockResponse = (items: any[]) =>
      ({
        ok: true,
        json: async () => ({ items }),
      }) as Response;

    it("should fetch recommendation by genre", async () => {
      const mockBook = {
        id: "test-id",
        volumeInfo: {
          title: "Test Book",
          authors: ["Test Author"],
          categories: ["Fiction"],
          imageLinks: { thumbnail: "test-cover.jpg" },
          description: "Test description",
          pageCount: 300,
        },
      };

      mockFetchWithRetry.mockResolvedValue(mockResponse([mockBook]));
      mockGetSecureRandomInt.mockResolvedValue(0);

      const result =
        await RecommendationService.getDiscoveryRecommendation("Fiction");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Test Book");
      expect(result?.author).toBe("Test Author");
      expect(result?.genre).toBe("Fiction");
    });

    it("should exclude titles already in library", async () => {
      const mockBook1 = {
        id: "1",
        volumeInfo: { title: "Existing Book", authors: ["Author"] },
      };
      const mockBook2 = {
        id: "2",
        volumeInfo: {
          title: "New Recommendation",
          authors: ["Author"],
          categories: ["Fiction"],
          imageLinks: { thumbnail: "cover.jpg" },
        },
      };

      mockFetchWithRetry.mockResolvedValue(
        mockResponse([mockBook1, mockBook2]),
      );
      mockGetSecureRandomInt.mockResolvedValue(0);

      const result = await RecommendationService.getDiscoveryRecommendation(
        "Fiction",
        ["Existing Book"],
      );

      expect(result?.title).toBe("New Recommendation");
    });

    it("should handle API errors gracefully", async () => {
      mockFetchWithRetry.mockRejectedValue(new Error("API Error"));

      const result =
        await RecommendationService.getDiscoveryRecommendation("Fiction");

      expect(result).toBeNull();
      expect(mockLogError).toHaveBeenCalled();
    });

    it("should return null when no results found", async () => {
      mockFetchWithRetry.mockResolvedValue(mockResponse([]));

      const result =
        await RecommendationService.getDiscoveryRecommendation("Fiction");

      expect(result).toBeNull();
    });

    it("should try fallback without language restriction when first attempt fails", async () => {
      // First call returns empty
      mockFetchWithRetry
        .mockResolvedValueOnce(mockResponse([]))
        // Second call (without lang restriction) returns results
        .mockResolvedValueOnce(
          mockResponse([
            {
              id: "test-id",
              volumeInfo: {
                title: "Test Book",
                authors: ["Author"],
                categories: ["Fiction"],
              },
            },
          ]),
        );
      mockGetSecureRandomInt.mockResolvedValue(0);

      const result =
        await RecommendationService.getDiscoveryRecommendation("Fiction");

      expect(mockFetchWithRetry).toHaveBeenCalledTimes(2);
      expect(result).not.toBeNull();
    });

    it("should handle AbortError without logging", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      mockFetchWithRetry.mockRejectedValue(abortError);

      const result =
        await RecommendationService.getDiscoveryRecommendation("Fiction");

      expect(result).toBeNull();
      expect(mockLogError).not.toHaveBeenCalled();
    });

    it("should default to Roman genre when not provided", async () => {
      mockFetchWithRetry.mockResolvedValue(
        mockResponse([
          {
            id: "test-id",
            volumeInfo: {
              title: "Test Book",
              authors: ["Author"],
              categories: ["Roman"],
            },
          },
        ]),
      );
      mockGetSecureRandomInt.mockResolvedValue(0);

      await RecommendationService.getDiscoveryRecommendation();

      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        expect.stringContaining("subject:Roman"),
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe("getFavoriteGenre", () => {
    it("should return Roman when library is empty", () => {
      const result = RecommendationService.getFavoriteGenre([]);
      expect(result).toBe("Roman");
    });

    it("should return most common genre", () => {
      const books: Book[] = [
        {
          id: "1",
          title: "Book 1",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          genre: "Fiction",
          addedAt: Date.now(),
        },
        {
          id: "2",
          title: "Book 2",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          genre: "Fiction",
          addedAt: Date.now(),
        },
        {
          id: "3",
          title: "Book 3",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          genre: "Science Fiction",
          addedAt: Date.now(),
        },
      ];

      const result = RecommendationService.getFavoriteGenre(books);
      expect(result).toBe("Fiction");
    });

    it("should handle books without genre", () => {
      const books: Book[] = [
        {
          id: "1",
          title: "Book 1",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          genre: "Fiction",
          addedAt: Date.now(),
        },
        {
          id: "2",
          title: "Book 2",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          // No genre
          addedAt: Date.now(),
        },
      ];

      const result = RecommendationService.getFavoriteGenre(books);
      expect(result).toBe("Fiction");
    });

    it("should return first genre when there is a tie", () => {
      const books: Book[] = [
        {
          id: "1",
          title: "Book 1",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          genre: "Fiction",
          addedAt: Date.now(),
        },
        {
          id: "2",
          title: "Book 2",
          author: "Author",
          status: "Okunacak",
          coverUrl: "cover.jpg",
          genre: "Science Fiction",
          addedAt: Date.now(),
        },
      ];

      const result = RecommendationService.getFavoriteGenre(books);
      // Should return one of them (first in alphabetical order due to Object.entries)
      expect(["Fiction", "Science Fiction"]).toContain(result);
    });
  });
});
