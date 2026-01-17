import { renderHook, waitFor } from "@testing-library/react-native";
import { useIsbnSearchQuery, isbnSearchKeys } from "../useIsbnSearchQuery";
import { SearchEngine } from "../../../services/SearchEngine";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock dependencies
jest.mock("../../../services/SearchEngine", () => ({
  SearchEngine: {
    searchByIsbnEnriched: jest.fn(),
  },
}));

describe("useIsbnSearchQuery", () => {
  let queryClient: QueryClient;
  const mockIsbn = "9789750719387";
  const mockResults = [
    {
      id: "1",
      volumeInfo: {
        title: "Kürk Mantolu Madonna",
        authors: ["Sabahattin Ali"],
      },
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return initial state correctly", () => {
    const { result } = renderHook(() => useIsbnSearchQuery(null), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false); // Disabled when isbn is null
  });

  it("should fetch results for valid ISBN", async () => {
    (SearchEngine.searchByIsbnEnriched as jest.Mock).mockResolvedValue(
      mockResults,
    );

    const { result } = renderHook(() => useIsbnSearchQuery(mockIsbn), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResults);
    expect(SearchEngine.searchByIsbnEnriched).toHaveBeenCalledWith(
      mockIsbn,
      "tr",
      expect.anything(),
    );
  });

  it("should not fetch when enabled is false", () => {
    const { result } = renderHook(
      () => useIsbnSearchQuery(mockIsbn, { enabled: false }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
    expect(SearchEngine.searchByIsbnEnriched).not.toHaveBeenCalled();
  });

  it("should handle errors correctly", async () => {
    const mockError = new Error("Network error");
    (SearchEngine.searchByIsbnEnriched as jest.Mock).mockRejectedValue(
      mockError,
    );

    const { result } = renderHook(() => useIsbnSearchQuery(mockIsbn), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it("should use correct cache key", async () => {
    (SearchEngine.searchByIsbnEnriched as jest.Mock).mockResolvedValue(
      mockResults,
    );

    const { result } = renderHook(() => useIsbnSearchQuery(mockIsbn), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cache = queryClient
      .getQueryCache()
      .find({ queryKey: isbnSearchKeys.search(mockIsbn) });
    expect(cache).toBeDefined();
  });
});
