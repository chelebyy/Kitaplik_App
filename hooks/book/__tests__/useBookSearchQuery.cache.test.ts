/**
 * useBookSearchQuery Cache Test Suite
 * Basit cache testi - JSX olmadan
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useBookSearchQuery, bookSearchKeys } from "../useBookSearchQuery";

jest.mock("../../../services/SearchEngine", () => ({
  SearchEngine: {
    search: jest.fn(),
  },
}));

jest.mock("../../useDebounce", () => ({
  useDebounce: jest.fn((value: string) => ({ debouncedValue: value })),
}));

import { SearchEngine } from "../../../services/SearchEngine";

const mockSearchEngine = SearchEngine as jest.Mocked<typeof SearchEngine>;

describe("useBookSearchQuery Cache Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 60000,
        },
      },
    });
  });

  const createWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };

  it("should return cached results for same query", async () => {
    const mockResults = [{ id: "1", volumeInfo: { title: "Cached Book" } }];
    mockSearchEngine.search.mockResolvedValue(mockResults);

    const { result: result1, unmount } = renderHook(
      () => useBookSearchQuery({ initialQuery: "cached" }),
      { wrapper: createWrapper },
    );

    await waitFor(() => {
      expect(result1.current.results).toEqual(mockResults);
    });

    expect(mockSearchEngine.search).toHaveBeenCalledTimes(1);

    unmount();

    mockSearchEngine.search.mockClear();

    const { result: result2 } = renderHook(
      () => useBookSearchQuery({ initialQuery: "cached" }),
      { wrapper: createWrapper },
    );

    expect(result2.current.results).toEqual(mockResults);
    expect(mockSearchEngine.search).not.toHaveBeenCalled();
  });
});
