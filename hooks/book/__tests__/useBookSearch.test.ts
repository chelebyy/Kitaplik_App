/**
 * @fileoverview useBookSearch hook testleri
 * TDD RED fazı: Bu testler başlangıçta başarısız olmalı
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";

// Hook henüz yok (RED)
import { useBookSearch } from "../useBookSearch";

// SearchEngine mock
jest.mock("../../../services/SearchEngine", () => ({
  SearchEngine: {
    search: jest.fn(),
  },
}));

import { SearchEngine } from "../../../services/SearchEngine";

const mockSearchEngine = SearchEngine as jest.Mocked<typeof SearchEngine>;

describe("useBookSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initial state", () => {
    it("should return initial state correctly", () => {
      const { result } = renderHook(() => useBookSearch());

      expect(result.current.query).toBe("");
      expect(result.current.results).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.searchType).toBe("book");
    });
  });

  describe("query management", () => {
    it("should update query when setQuery is called", () => {
      const { result } = renderHook(() => useBookSearch());

      act(() => {
        result.current.setQuery("Harry Potter");
      });

      expect(result.current.query).toBe("Harry Potter");
    });

    it("should clear results when clear is called", async () => {
      mockSearchEngine.search.mockResolvedValue([
        {
          id: "1",
          volumeInfo: {
            title: "Test Book",
            authors: ["Test Author"],
          },
        },
      ]);

      const { result } = renderHook(() => useBookSearch());

      // Arama yap
      act(() => {
        result.current.setQuery("test");
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.results.length).toBeGreaterThan(0);
      });

      // Temizle
      act(() => {
        result.current.clear();
      });

      expect(result.current.query).toBe("");
      expect(result.current.results).toEqual([]);
    });
  });

  describe("search behavior", () => {
    it("should debounce search calls", async () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearch());

      // Hızlı değişiklikler
      act(() => {
        result.current.setQuery("H");
      });
      act(() => {
        result.current.setQuery("Ha");
      });
      act(() => {
        result.current.setQuery("Har");
      });
      act(() => {
        result.current.setQuery("Harry");
      });

      // Debounce süresi dolmadan API çağrılmamalı
      expect(mockSearchEngine.search).not.toHaveBeenCalled();

      // Debounce sonrası
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockSearchEngine.search).toHaveBeenCalledTimes(1);
        expect(mockSearchEngine.search).toHaveBeenCalledWith(
          "Harry",
          "tr",
          "book",
          expect.any(AbortSignal),
        );
      });
    });

    it("should set loading state during search", async () => {
      let resolveSearch: (value: unknown[]) => void;
      mockSearchEngine.search.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSearch = resolve;
          }),
      );

      const { result } = renderHook(() => useBookSearch());

      act(() => {
        result.current.setQuery("test");
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Loading true olmalı
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Search'ü resolve et
      await act(async () => {
        resolveSearch!([]);
      });

      // Loading false olmalı
      expect(result.current.isLoading).toBe(false);
    });

    it("should update results on successful search", async () => {
      const mockResults = [
        {
          id: "1",
          volumeInfo: {
            title: "Harry Potter",
            authors: ["J.K. Rowling"],
          },
        },
      ];
      mockSearchEngine.search.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useBookSearch());

      act(() => {
        result.current.setQuery("Harry");
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.results).toEqual(mockResults);
      });
    });

    it("should handle search errors", async () => {
      const mockError = new Error("Network error");
      mockSearchEngine.search.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBookSearch());

      act(() => {
        result.current.setQuery("test");
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(mockError);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("search type", () => {
    it("should use search type in API call", async () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearch());

      act(() => {
        result.current.setSearchType("author");
      });

      act(() => {
        result.current.setQuery("Rowling");
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockSearchEngine.search).toHaveBeenCalledWith(
          "Rowling",
          "tr",
          "author",
          expect.any(AbortSignal),
        );
      });
    });
  });

  describe("manual search", () => {
    it("should trigger immediate search when search() is called", async () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearch());

      act(() => {
        result.current.setQuery("Harry");
      });

      // Manuel arama - debounce beklemeden
      await act(async () => {
        await result.current.search();
      });

      expect(mockSearchEngine.search).toHaveBeenCalledWith(
        "Harry",
        "tr",
        "book",
        undefined,
      );
    });
  });

  describe("empty query handling", () => {
    it("should not search when query is empty", async () => {
      const { result } = renderHook(() => useBookSearch());

      act(() => {
        result.current.setQuery("");
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockSearchEngine.search).not.toHaveBeenCalled();
    });
  });
});
