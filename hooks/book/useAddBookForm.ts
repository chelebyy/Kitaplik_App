import { useState, useCallback } from "react";
import { BookStatus } from "../../context/BooksContext";
import { GenreType } from "../../utils/genreTranslator";

/**
 * Form state interface for add book form
 */
export interface AddBookFormState {
  title: string;
  author: string;
  genre: GenreType | "";
  pageCount: string;
  currentPage: string;
  coverUrl: string | null;
  status: BookStatus;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Book data ready for addBook function
 */
export interface BookData {
  title: string;
  author: string;
  genre: string;
  pageCount: number;
  currentPage: number;
  coverUrl: string;
  status: BookStatus;
  progress: number;
}

/**
 * Partial book data for filling form from external source
 */
export interface PartialBookData {
  title: string;
  author: string;
  genre?: GenreType | "";
  pageCount?: number;
  coverUrl?: string | null;
}

/**
 * Form actions interface
 */
export interface AddBookFormActions {
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setGenre: (value: GenreType | "") => void;
  setPageCount: (value: string) => void;
  setCurrentPage: (value: string) => void;
  setCoverUrl: (value: string | null) => void;
  setStatus: (value: BookStatus) => void;
  reset: () => void;
  validate: () => ValidationResult;
  fillFromBook: (book: PartialBookData) => void;
  getBookData: () => BookData;
}

/**
 * Combined return type for useAddBookForm hook
 */
export type UseAddBookFormReturn = AddBookFormState & AddBookFormActions;

/**
 * Default cover URL when no cover is provided
 */
const DEFAULT_COVER_URL =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=600";

/**
 * Initial form state
 */
const initialState: AddBookFormState = {
  title: "",
  author: "",
  genre: "",
  pageCount: "",
  currentPage: "",
  coverUrl: null,
  status: "Okunacak",
};

/**
 * Custom hook for managing add book form state
 *
 * Provides:
 * - Form field state management
 * - Validation logic
 * - Reset functionality
 * - Fill from external book data
 * - Get formatted book data for addBook
 *
 * @example
 * ```tsx
 * const form = useAddBookForm();
 *
 * // Update fields
 * form.setTitle("1984");
 * form.setAuthor("George Orwell");
 *
 * // Validate
 * const { isValid, errors } = form.validate();
 *
 * // Get data for addBook
 * if (isValid) {
 *   addBook(form.getBookData());
 * }
 * ```
 */
export function useAddBookForm(): UseAddBookFormReturn {
  const [formState, setFormState] = useState<AddBookFormState>(initialState);

  // Individual field setters with useCallback for stability
  const setTitle = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, title: value }));
  }, []);

  const setAuthor = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, author: value }));
  }, []);

  const setGenre = useCallback((value: GenreType | "") => {
    setFormState((prev) => ({ ...prev, genre: value }));
  }, []);

  const setPageCount = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, pageCount: value }));
  }, []);

  const setCurrentPage = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, currentPage: value }));
  }, []);

  const setCoverUrl = useCallback((value: string | null) => {
    setFormState((prev) => ({ ...prev, coverUrl: value }));
  }, []);

  const setStatus = useCallback((value: BookStatus) => {
    setFormState((prev) => ({ ...prev, status: value }));
  }, []);

  // Reset all fields to initial state
  const reset = useCallback(() => {
    setFormState(initialState);
  }, []);

  // Validate required fields
  const validate = useCallback((): ValidationResult => {
    const errors: Record<string, string> = {};

    if (!formState.title.trim()) {
      errors.title = "add_book_fill_required";
    }

    if (!formState.author.trim()) {
      errors.author = "add_book_fill_required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [formState.title, formState.author]);

  // Fill form from external book data (e.g., barcode scan result)
  const fillFromBook = useCallback((book: PartialBookData) => {
    setFormState((prev) => ({
      ...prev,
      title: book.title,
      author: book.author,
      genre: book.genre ?? "",
      pageCount: book.pageCount ? String(book.pageCount) : "",
      coverUrl: book.coverUrl ?? null,
    }));
  }, []);

  // Get formatted book data ready for addBook function
  const getBookData = useCallback((): BookData => {
    const totalPages = Number.parseInt(formState.pageCount, 10) || 0;
    const current = Number.parseInt(formState.currentPage, 10) || 0;

    // Calculate progress based on status
    let progress = 0;
    let finalCurrentPage = current;

    if (formState.status === "Okundu") {
      progress = 1;
      finalCurrentPage = totalPages; // Set to total pages when completed
    } else if (formState.status === "Okunuyor" && totalPages > 0) {
      progress = Math.min(current / totalPages, 1);
    }

    return {
      title: formState.title,
      author: formState.author,
      genre: formState.genre || "Diğer",
      pageCount: totalPages,
      currentPage: finalCurrentPage,
      coverUrl: formState.coverUrl || DEFAULT_COVER_URL,
      status: formState.status,
      progress,
    };
  }, [formState]);

  return {
    // State
    ...formState,
    // Actions
    setTitle,
    setAuthor,
    setGenre,
    setPageCount,
    setCurrentPage,
    setCoverUrl,
    setStatus,
    reset,
    validate,
    fillFromBook,
    getBookData,
  };
}
