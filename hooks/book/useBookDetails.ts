import { useState, useEffect, useCallback, useMemo } from "react";
import { useBooks, BookStatus, Book } from "../../context/BooksContext";

/**
 * useBookDetails hook'unun return type'ı
 */
export interface UseBookDetailsReturn {
  /** Kitap verisi */
  book: Book | null;
  /** Yükleniyor durumu */
  isLoading: boolean;
  /** Notlar (local state) */
  notes: string;
  /** Mevcut sayfa (local state) */
  currentPage: number;
  /** Toplam sayfa (local state) */
  pageCount: number;
  /** İlerleme yüzdesi (hesaplanmış) */
  progressPercentage: number;
  /** Kitap durumunu güncelle */
  updateStatus: (status: BookStatus) => void;
  /** Notları güncelle */
  updateNotes: (notes: string) => void;
  /** Sayfa ilerlemesini güncelle */
  updateProgress: (currentPage: number, pageCount: number) => void;
  /** Kitap bilgilerini güncelle (başlık, yazar, tür, kapak) */
  updateBookInfo: (
    data: Partial<Pick<Book, "title" | "author" | "genre" | "coverUrl">>,
  ) => void;
  /** Kitabı sil */
  deleteBook: () => void;
}

/**
 * useBookDetails - Kitap detay sayfası için hook
 *
 * Kitap verisi, durum güncellemeleri, not ekleme ve ilerleme takibi
 * işlemlerini yönetir.
 *
 * @param bookId - Kitap ID'si
 * @returns UseBookDetailsReturn
 *
 * @example
 * ```tsx
 * const {
 *   book,
 *   notes,
 *   updateStatus,
 *   updateNotes,
 *   updateProgress,
 *   deleteBook,
 *   progressPercentage
 * } = useBookDetails(bookId);
 * ```
 */
export function useBookDetails(bookId: string): UseBookDetailsReturn {
  const {
    getBookById,
    updateBook,
    updateBookStatus,
    updateBookNotes,
    updateBookProgress,
    deleteBook: contextDeleteBook,
  } = useBooks();

  // Kitap verisini al
  const book = getBookById(bookId);

  // Local state'ler (optimistic updates için)
  const [notes, setNotes] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [localStatus, setLocalStatus] = useState<BookStatus | null>(null);
  const [isLoading] = useState<boolean>(false);

  // Kitap değiştiğinde local state'leri güncelle
  // React Compiler uyumluluğu için primitive değerler kullanıyoruz
  const bookNotes = book?.notes;
  const bookCurrentPage = book?.currentPage;
  const bookPageCount = book?.pageCount;

  useEffect(() => {
    if (book) {
      setNotes(bookNotes || "");
      setCurrentPage(bookCurrentPage || 0);
      setPageCount(bookPageCount || 0);
      setLocalStatus(null); // Context güncellendiğinde local state'i sıfırla
    }
  }, [book, bookNotes, bookCurrentPage, bookPageCount]);

  /**
   * İlerleme yüzdesi hesapla
   */
  const progressPercentage = useMemo(() => {
    if (pageCount === 0) return 0;
    return Math.round((currentPage / pageCount) * 100);
  }, [currentPage, pageCount]);

  /**
   * Durum güncelle (optimistic update)
   * Önce UI'ı anında günceller, sonra context'e yazar
   */
  const updateStatus = useCallback(
    (status: BookStatus) => {
      if (!bookId) return;
      setLocalStatus(status); // Optimistic update - UI anında güncellenir
      updateBookStatus(bookId, status); // Context'e yaz
    },
    [bookId, updateBookStatus],
  );

  /**
   * Notları güncelle
   */
  const updateNotes = useCallback(
    (newNotes: string) => {
      if (!bookId) return;
      setNotes(newNotes);
      updateBookNotes(bookId, newNotes);
    },
    [bookId, updateBookNotes],
  );

  /**
   * İlerlemeyi güncelle
   */
  const updateProgress = useCallback(
    (newCurrentPage: number, newPageCount: number) => {
      if (!bookId) return;
      setCurrentPage(newCurrentPage);
      setPageCount(newPageCount);
      updateBookProgress(bookId, newCurrentPage, newPageCount);
    },
    [bookId, updateBookProgress],
  );

  /**
   * Kitabı sil
   */
  const deleteBook = useCallback(() => {
    if (!bookId) return;
    contextDeleteBook(bookId);
  }, [bookId, contextDeleteBook]);

  /**
   * Kitap bilgilerini güncelle (başlık, yazar, tür, kapak)
   */
  const updateBookInfo = useCallback(
    (data: Partial<Pick<Book, "title" | "author" | "genre" | "coverUrl">>) => {
      if (!bookId) return;
      updateBook(bookId, data);
    },
    [bookId, updateBook],
  );

  // Optimistic status ile kitap nesnesini oluştur
  const bookWithOptimisticStatus: Book | null = book
    ? {
        ...book,
        status: localStatus ?? book.status, // Local varsa onu, yoksa context'i kullan
      }
    : null;

  return {
    book: bookWithOptimisticStatus,
    isLoading,
    notes,
    currentPage,
    pageCount,
    progressPercentage,
    updateStatus,
    updateNotes,
    updateProgress,
    updateBookInfo,
    deleteBook,
  };
}
