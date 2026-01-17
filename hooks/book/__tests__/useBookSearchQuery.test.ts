/**
 * useBookSearchQuery Test Suite
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { useBookSearchQuery, bookSearchKeys } from "../useBookSearchQuery";

// Mock SearchEngine
jest.mock("../../../services/SearchEngine", () => ({
  SearchEngine: {
    search: jest.fn(),
  },
}));

// Mock useDebounce
jest.mock("../../useDebounce", () => ({
  useDebounce: jest.fn((value: string) => ({ debouncedValue: value })),
}));

import { SearchEngine } from "../../../services/SearchEngine";

const mockSearchEngine = SearchEngine as jest.Mocked<typeof SearchEngine>;

describe("useBookSearchQuery", () => {
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

  describe("initialization", () => {
    it("should initialize with empty state", () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(() => useBookSearchQuery(), {
        wrapper: createWrapper(),
      });

      expect(result.current.query).toBe("");
      expect(result.current.results).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.searchType).toBe("book");
    });

    it("should accept initial query", () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(
        () => useBookSearchQuery({ initialQuery: "Test Book" }),
        { wrapper: createWrapper() },
      );

      expect(result.current.query).toBe("Test Book");
    });

    it("should accept initial search type", () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(
        () => useBookSearchQuery({ initialSearchType: "author" }),
        { wrapper: createWrapper() },
      );

      expect(result.current.searchType).toBe("author");
    });
  });

  describe("search functionality", () => {
    it("should search when query changes", async () => {
      const mockResults = [
        {
          id: "1",
          volumeInfo: {
            title: "Test Book",
            authors: ["Test Author"],
          },
        },
      ];
      mockSearchEngine.search.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useBookSearchQuery(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setQuery("test");
      });

      await waitFor(() => {
        expect(result.current.results).toEqual(mockResults);
      });

      expect(mockSearchEngine.search).toHaveBeenCalledWith(
        "test",
        "tr",
        "book",
        expect.any(AbortSignal),
      );
    });

    it("should not search for empty query", async () => {
      mockSearchEngine.search.mockResolvedValue([]);

      const { result } = renderHook(
        () => useBookSearchQuery({ initialQuery: "" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSearchEngine.search).not.toHaveBeenCalled();
    });
  });

  describe("clear functionality", () => {
    it("should clear query when clear is called", async () => {
      mockSearchEngine.search.mockResolvedValue([
        { id: "1", volumeInfo: { title: "Book" } },
      ]);

      const { result } = renderHook(() => useBookSearchQuery(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setQuery("test");
      });

      await waitFor(() => {
        expect(result.current.results.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.query).toBe("");
    });
  });

  describe("bookSearchKeys", () => {
    it("should generate correct query keys", () => {
      expect(bookSearchKeys.all).toEqual(["bookSearch"]);
      expect(bookSearchKeys.search("test", "book")).toEqual([
        "bookSearch",
        "test",
        "book",
      ]);
      expect(bookSearchKeys.search("author name", "author")).toEqual([
        "bookSearch",
        "author name",
        "author",
      ]);
    });
  });
});
