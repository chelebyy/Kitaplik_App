import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BooksProvider, useBooks, BookStatus } from "../BooksContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock i18n
jest.mock("../../i18n/i18n", () => ({
  t: (key: string) => key,
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Wrapper component
function wrapper({ children }: { children: React.ReactNode }) {
  return <BooksProvider>{children}</BooksProvider>;
}

describe("BooksContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe("addBook", () => {
    it("kitap başarıyla eklenmeli", async () => {
      const { result } = renderHook(() => useBooks(), { wrapper });

      // isLoading bitene kadar bekle
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const newBook = {
        title: "Test Kitap",
        author: "Test Yazar",
        status: "Okunacak" as BookStatus,
        coverUrl: "https://example.com/cover.jpg",
        genre: "Roman",
      };

      let result_value: boolean = false;
      act(() => {
        result_value = result.current.addBook(newBook);
      });

      expect(result_value).toBe(true);
      expect(
        result.current.books.some((book) => book.title === "Test Kitap"),
      ).toBe(true);
    });

    it("aynı title+author ile kitap eklendiğinde reddedilmeli", async () => {
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const book1 = {
        title: "Duplicate Test",
        author: "Duplicate Author",
        status: "Okunacak" as BookStatus,
        coverUrl: "https://example.com/cover.jpg",
      };

      // İlk ekleme başarılı olmalı
      let firstAdd: boolean = false;
      act(() => {
        firstAdd = result.current.addBook(book1);
      });
      expect(firstAdd).toBe(true);

      // İkinci ekleme reddedilmeli
      let secondAdd: boolean = true;
      act(() => {
        secondAdd = result.current.addBook(book1);
      });
      expect(secondAdd).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        "duplicate_book_title",
        "duplicate_book_message",
      );
    });

    it("case-insensitive duplicate kontrolü çalışmalı", async () => {
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const book1 = {
        title: "Case Test",
        author: "Author Name",
        status: "Okunacak" as BookStatus,
        coverUrl: "https://example.com/cover.jpg",
      };

      act(() => {
        result.current.addBook(book1);
      });

      // Farklı case ile aynı kitap
      const book2 = {
        title: "CASE TEST",
        author: "AUTHOR NAME",
        status: "Okunuyor" as BookStatus,
        coverUrl: "https://example.com/cover2.jpg",
      };

      let duplicateAdd: boolean = true;
      act(() => {
        duplicateAdd = result.current.addBook(book2);
      });
      expect(duplicateAdd).toBe(false);
    });

    it("farklı author ile aynı title eklenebilmeli", async () => {
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const book1 = {
        title: "Common Title",
        author: "Author One",
        status: "Okunacak" as BookStatus,
        coverUrl: "https://example.com/cover.jpg",
      };

      const book2 = {
        title: "Common Title",
        author: "Author Two",
        status: "Okunacak" as BookStatus,
        coverUrl: "https://example.com/cover.jpg",
      };

      let firstAdd: boolean = false;
      let secondAdd: boolean = false;

      act(() => {
        firstAdd = result.current.addBook(book1);
      });
      act(() => {
        secondAdd = result.current.addBook(book2);
      });

      expect(firstAdd).toBe(true);
      expect(secondAdd).toBe(true);
    });

    it("whitespace trim edilerek karşılaştırma yapılmalı", async () => {
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const book1 = {
        title: "  Trim Test  ",
        author: "  Trim Author  ",
        status: "Okunacak" as BookStatus,
        coverUrl: "https://example.com/cover.jpg",
      };

      act(() => {
        result.current.addBook(book1);
      });

      // Whitespace olmadan aynı kitap
      const book2 = {
        title: "Trim Test",
        author: "Trim Author",
        status: "Okunuyor" as BookStatus,
        coverUrl: "https://example.com/cover2.jpg",
      };

      let duplicateAdd: boolean = true;
      act(() => {
        duplicateAdd = result.current.addBook(book2);
      });
      expect(duplicateAdd).toBe(false);
    });
  });
});
