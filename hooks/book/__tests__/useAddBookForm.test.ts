import { renderHook, act } from "@testing-library/react-native";
import { useAddBookForm } from "../useAddBookForm";

describe("useAddBookForm", () => {
  describe("initial state", () => {
    it("should initialize with empty values", () => {
      const { result } = renderHook(() => useAddBookForm());

      expect(result.current.title).toBe("");
      expect(result.current.author).toBe("");
      expect(result.current.genre).toBe("");
      expect(result.current.pageCount).toBe("");
      expect(result.current.currentPage).toBe("");
      expect(result.current.coverUrl).toBeNull();
    });

    it('should initialize with default status as "Okunacak"', () => {
      const { result } = renderHook(() => useAddBookForm());

      expect(result.current.status).toBe("Okunacak");
    });
  });

  describe("form updates", () => {
    it("should update title correctly", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test Kitabı");
      });

      expect(result.current.title).toBe("Test Kitabı");
    });

    it("should update author correctly", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setAuthor("Test Yazar");
      });

      expect(result.current.author).toBe("Test Yazar");
    });

    it("should update genre correctly", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setGenre("Roman");
      });

      expect(result.current.genre).toBe("Roman");
    });

    it("should update pageCount correctly", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setPageCount("350");
      });

      expect(result.current.pageCount).toBe("350");
    });

    it("should update currentPage correctly", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setCurrentPage("120");
      });

      expect(result.current.currentPage).toBe("120");
    });

    it("should update coverUrl correctly", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setCoverUrl("https://example.com/cover.jpg");
      });

      expect(result.current.coverUrl).toBe("https://example.com/cover.jpg");
    });

    it("should update status correctly", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setStatus("Okunuyor");
      });

      expect(result.current.status).toBe("Okunuyor");

      act(() => {
        result.current.setStatus("Okundu");
      });

      expect(result.current.status).toBe("Okundu");
    });
  });

  describe("validation", () => {
    it("should return error when title is empty", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setAuthor("Test Yazar");
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.title).toBe("add_book_fill_required");
    });

    it("should return error when author is empty", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test Kitabı");
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.author).toBe("add_book_fill_required");
    });

    it("should return errors when both title and author are empty", () => {
      const { result } = renderHook(() => useAddBookForm());

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.title).toBe("add_book_fill_required");
      expect(validation.errors.author).toBe("add_book_fill_required");
    });

    it("should return error when title is only whitespace", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("   ");
        result.current.setAuthor("Test Yazar");
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.title).toBe("add_book_fill_required");
    });

    it("should return error when author is only whitespace", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test Kitabı");
        result.current.setAuthor("   ");
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.author).toBe("add_book_fill_required");
    });

    it("should pass validation with valid data", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test Kitabı");
        result.current.setAuthor("Test Yazar");
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it("should pass validation even without optional fields", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test Kitabı");
        result.current.setAuthor("Test Yazar");
        // genre, pageCount, currentPage, coverUrl are all optional
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(true);
    });
  });

  describe("reset", () => {
    it("should reset all fields to initial state", () => {
      const { result } = renderHook(() => useAddBookForm());

      // Set all fields
      act(() => {
        result.current.setTitle("Test Kitabı");
        result.current.setAuthor("Test Yazar");
        result.current.setGenre("Roman");
        result.current.setPageCount("350");
        result.current.setCurrentPage("120");
        result.current.setCoverUrl("https://example.com/cover.jpg");
        result.current.setStatus("Okunuyor");
      });

      // Verify fields are set
      expect(result.current.title).toBe("Test Kitabı");
      expect(result.current.author).toBe("Test Yazar");
      expect(result.current.status).toBe("Okunuyor");

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify all fields are back to initial state
      expect(result.current.title).toBe("");
      expect(result.current.author).toBe("");
      expect(result.current.genre).toBe("");
      expect(result.current.pageCount).toBe("");
      expect(result.current.currentPage).toBe("");
      expect(result.current.coverUrl).toBeNull();
      expect(result.current.status).toBe("Okunacak");
    });
  });

  describe("fillFromBook", () => {
    it("should populate form from GoogleBookResult data", () => {
      const { result } = renderHook(() => useAddBookForm());

      const bookData = {
        title: "1984",
        author: "George Orwell",
        genre: "Bilim Kurgu" as const,
        pageCount: 328,
        coverUrl: "https://example.com/1984.jpg",
      };

      act(() => {
        result.current.fillFromBook(bookData);
      });

      expect(result.current.title).toBe("1984");
      expect(result.current.author).toBe("George Orwell");
      expect(result.current.genre).toBe("Bilim Kurgu");
      expect(result.current.pageCount).toBe("328");
      expect(result.current.coverUrl).toBe("https://example.com/1984.jpg");
    });

    it("should handle missing optional fields when filling from book", () => {
      const { result } = renderHook(() => useAddBookForm());

      const bookData = {
        title: "Minimal Book",
        author: "Unknown Author",
      };

      act(() => {
        result.current.fillFromBook(bookData);
      });

      expect(result.current.title).toBe("Minimal Book");
      expect(result.current.author).toBe("Unknown Author");
      expect(result.current.genre).toBe("");
      expect(result.current.pageCount).toBe("");
      expect(result.current.coverUrl).toBeNull();
    });
  });

  describe("getBookData", () => {
    it("should return formatted book data ready for addBook", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test Kitabı");
        result.current.setAuthor("Test Yazar");
        result.current.setGenre("Roman");
        result.current.setPageCount("350");
        result.current.setCurrentPage("120");
        result.current.setCoverUrl("https://example.com/cover.jpg");
        result.current.setStatus("Okunuyor");
      });

      const bookData = result.current.getBookData();

      expect(bookData.title).toBe("Test Kitabı");
      expect(bookData.author).toBe("Test Yazar");
      expect(bookData.genre).toBe("Roman");
      expect(bookData.pageCount).toBe(350);
      expect(bookData.currentPage).toBe(120);
      expect(bookData.coverUrl).toBe("https://example.com/cover.jpg");
      expect(bookData.status).toBe("Okunuyor");
    });

    it("should calculate progress correctly for Okunuyor status", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test");
        result.current.setAuthor("Author");
        result.current.setPageCount("100");
        result.current.setCurrentPage("50");
        result.current.setStatus("Okunuyor");
      });

      const bookData = result.current.getBookData();

      expect(bookData.progress).toBe(0.5);
    });

    it("should set progress to 1 for Okundu status", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test");
        result.current.setAuthor("Author");
        result.current.setPageCount("100");
        result.current.setCurrentPage("50");
        result.current.setStatus("Okundu");
      });

      const bookData = result.current.getBookData();

      expect(bookData.progress).toBe(1);
      expect(bookData.currentPage).toBe(100); // Should be set to pageCount
    });

    it("should set progress to 0 for Okunacak status", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test");
        result.current.setAuthor("Author");
        result.current.setPageCount("100");
        result.current.setStatus("Okunacak");
      });

      const bookData = result.current.getBookData();

      expect(bookData.progress).toBe(0);
    });

    it("should use default cover URL when coverUrl is null", () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test");
        result.current.setAuthor("Author");
      });

      const bookData = result.current.getBookData();

      expect(bookData.coverUrl).toContain("unsplash.com");
    });

    it('should use "Diğer" as default genre when genre is empty', () => {
      const { result } = renderHook(() => useAddBookForm());

      act(() => {
        result.current.setTitle("Test");
        result.current.setAuthor("Author");
      });

      const bookData = result.current.getBookData();

      expect(bookData.genre).toBe("Diğer");
    });
  });

  describe("hook stability", () => {
    it("should have stable setter references across re-renders", () => {
      const { result, rerender } = renderHook(() => useAddBookForm());

      const initialSetTitle = result.current.setTitle;
      const initialSetAuthor = result.current.setAuthor;
      const initialReset = result.current.reset;

      rerender({});

      expect(result.current.setTitle).toBe(initialSetTitle);
      expect(result.current.setAuthor).toBe(initialSetAuthor);
      expect(result.current.reset).toBe(initialReset);
    });
  });
});
