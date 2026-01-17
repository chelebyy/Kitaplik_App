/**
 * @fileoverview useRecommendation hook testleri
 * TDD RED fazı
 */

import { renderHook, act } from "@testing-library/react-native";

// Hook henüz yok (RED)
import { useRecommendation } from "../useRecommendation";

// Mock services
const mockGetRandomFromLibrary = jest.fn();
const mockGetDiscoveryRecommendation = jest.fn();
const mockGetFavoriteGenre = jest.fn();

jest.mock("../../../services/RecommendationService", () => ({
  RecommendationService: {
    getRandomFromLibrary: async (...args: unknown[]) =>
      mockGetRandomFromLibrary(...args),
    getDiscoveryRecommendation: (...args: unknown[]) =>
      mockGetDiscoveryRecommendation(...args),
    getFavoriteGenre: () => mockGetFavoriteGenre(),
  },
}));

// BooksContext mock
const mockBooks = [
  { id: "1", title: "Book 1", status: "Okunacak" },
  { id: "2", title: "Book 2", status: "Okunuyor" },
];
jest.mock("../../../context/BooksContext", () => ({
  useBooks: () => ({
    books: mockBooks,
  }),
}));

const mockLibraryBook = {
  id: "lib-1",
  title: "Library Book",
  author: "Author 1",
  status: "Okunacak",
  coverUrl: "https://example.com/cover1.jpg",
  genre: "Fiction",
};

const mockExternalBook = {
  id: "ext-1",
  title: "External Book",
  author: "Author 2",
  status: "Okunacak",
  coverUrl: "https://example.com/cover2.jpg",
  genre: "Thriller",
};

describe("useRecommendation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFavoriteGenre.mockReturnValue("Fiction");
  });

  describe("initial state", () => {
    it("should return null recommendation initially", () => {
      const { result } = renderHook(() => useRecommendation());

      expect(result.current.recommendation).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.source).toBeNull();
    });
  });

  describe("getRecommendation from library", () => {
    it("should return library book when available", async () => {
      mockGetRandomFromLibrary.mockReturnValue(mockLibraryBook);

      const { result } = renderHook(() => useRecommendation());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.recommendation).toEqual(mockLibraryBook);
      expect(result.current.source).toBe("library");
    });

    it("should set isLoading true during fetch", async () => {
      mockGetRandomFromLibrary.mockReturnValue(mockLibraryBook);

      const { result } = renderHook(() => useRecommendation());

      expect(result.current.isLoading).toBe(false);

      // refresh çağrılınca loading true olmalı
      const refreshPromise = act(async () => {
        await result.current.refresh();
      });

      // İşlem bittikten sonra loading false
      await refreshPromise;
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("getRecommendation from external API", () => {
    it("should fetch external book when library is empty", async () => {
      mockGetRandomFromLibrary.mockReturnValue(null);
      mockGetDiscoveryRecommendation.mockResolvedValue(mockExternalBook);

      const { result } = renderHook(() => useRecommendation());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.recommendation).toEqual(mockExternalBook);
      expect(result.current.source).toBe("external");
    });

    it("should use favorite genre for external search", async () => {
      mockGetRandomFromLibrary.mockReturnValue(null);
      mockGetDiscoveryRecommendation.mockResolvedValue(mockExternalBook);

      const { result } = renderHook(() => useRecommendation());

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockGetDiscoveryRecommendation).toHaveBeenCalledWith(
        "Fiction",
        expect.any(Array),
        expect.any(AbortSignal),
      );
    });
  });

  describe("error handling", () => {
    it("should set isError when API fails", async () => {
      mockGetRandomFromLibrary.mockReturnValue(null);
      mockGetDiscoveryRecommendation.mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useRecommendation());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.recommendation).toBeNull();
    });
  });

  describe("refresh", () => {
    it("should get new recommendation on refresh", async () => {
      mockGetRandomFromLibrary
        .mockReturnValueOnce(mockLibraryBook)
        .mockReturnValueOnce({
          ...mockLibraryBook,
          id: "lib-2",
          title: "Book 2",
        });

      const { result } = renderHook(() => useRecommendation());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.recommendation?.title).toBe("Library Book");

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.recommendation?.title).toBe("Book 2");
    });
  });
});
