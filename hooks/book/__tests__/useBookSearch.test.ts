/**
 * @fileoverview useBookSearch hook testleri
 * useBookSearch artık useBookSearchQuery'ye yönlendirdiği için
 * bu dosya deprecated edildi ve ana testler useBookSearchQuery.test.ts'de
 *
 * @deprecated useBookSearchQuery.test.ts kullanın
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

// Compatibility layer test - useBookSearch -> useBookSearchQuery
import { useBookSearch } from "../useBookSearch";

// SearchEngine mock
jest.mock("../../../services/SearchEngine", () => ({
  SearchEngine: {
    search: jest.fn(),
  },
}));

// Mock useDebounce to avoid timing issues
jest.mock("../../useDebounce", () => ({
  useDebounce: jest.fn((value: string) => ({ debouncedValue: value })),
}));

import { SearchEngine } from "../../../services/SearchEngine";

const mockSearchEngine = SearchEngine as jest.Mocked<typeof SearchEngine>;

describe("useBookSearch (compatibility layer)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };
  }

  describe("initial state", () => {
    it("should return initial state correctly", () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

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
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setQuery("Harry Potter");
      });

      expect(result.current.query).toBe("Harry Potter");
    });

    it("should clear query when clear is called", async () => {
      mockSearchEngine.search.mockResolvedValue([
        {
          id: "1",
          volumeInfo: {
            title: "Test Book",
            authors: ["Test Author"],
          },
        },
      ]);

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

      // Arama yap
      act(() => {
        result.current.setQuery("test");
      });

      await waitFor(() => {
        expect(result.current.results.length).toBeGreaterThan(0);
      });

      // Temizle
      act(() => {
        result.current.clear();
      });

      expect(result.current.query).toBe("");
    });
  });

  describe("search behavior", () => {
    it("should search when query changes", async () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setQuery("Harry");
      });

      await waitFor(() => {
        expect(mockSearchEngine.search).toHaveBeenCalledWith(
          "Harry",
          "tr",
          "book",
          expect.any(AbortSignal),
        );
      });
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

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setQuery("Harry");
      });

      await waitFor(() => {
        expect(result.current.results).toEqual(mockResults);
      });
    });

    it("should handle search errors", async () => {
      const mockError = new Error("Network error");
      mockSearchEngine.search.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setQuery("test");
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

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchType("author");
      });

      act(() => {
        result.current.setQuery("Rowling");
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

  describe("empty query handling", () => {
    it("should not search when query is empty", async () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setQuery("");
      });

      // Give it time to potentially call search
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSearchEngine.search).not.toHaveBeenCalled();
    });
  });
});
