import { GoogleBooksService } from "../GoogleBooksService";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";

// fetchWithTimeout mock'luyoruz
jest.mock("../../utils/fetchWithTimeout");

describe("GoogleBooksService Integration Test", () => {
  const mockBooks = {
    items: [
      {
        id: "1",
        volumeInfo: {
          title: "Test Kitabı",
          authors: ["Yazar"],
        },
      },
      {
        id: "2",
        volumeInfo: {
          title: "Test Kitabı 2",
          authors: ["Yazar 2"],
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of books when search is successful", async () => {
    // Mock response
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBooks),
    });

    const result = await GoogleBooksService.searchBooks("test");

    expect(fetchWithTimeout).toHaveBeenCalledWith(
      expect.stringContaining("intitle%3Atest"),
      expect.any(Object),
    );
    expect(result).toHaveLength(2);
    expect(result[0].volumeInfo.title).toBe("Test Kitabı");
  });

  it("should return empty array when no items found", async () => {
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ items: [] }),
    });

    const result = await GoogleBooksService.searchBooks("nothing");
    expect(result).toEqual([]);
  });

  it("should find book by ISBN", async () => {
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBooks),
    });

    const result = await GoogleBooksService.searchByIsbn("12345");
    expect(result).toBeDefined();
    expect(result?.id).toBe("1");
    expect(fetchWithTimeout).toHaveBeenCalledWith(
      expect.stringContaining("isbn:12345"),
      expect.any(Object),
    );
  });
});
