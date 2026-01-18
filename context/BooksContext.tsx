import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Alert } from "react-native";
import { logErrorWithCrashlytics } from "../utils/errorUtils";
import CrashlyticsService from "../services/CrashlyticsService";
import i18n from "../i18n/i18n";
import {
  sendBookCompletionNotification,
  sendReadingProgressNotification,
} from "../services/NotificationService";
import { StorageService } from "../services/storage";

export type BookStatus = "Okunacak" | "Okunuyor" | "Okundu";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  coverUrl: string;
  genre?: string;
  progress?: number; // 0 ile 1 arası
  pageCount?: number; // Toplam sayfa sayısı
  currentPage?: number; // Şu anki sayfa
  notes?: string;
  addedAt: number;
  progressMilestones?: number[]; // Bildirim gönderilen kilometre taşları [25, 50, 75]
}

interface BooksContextType {
  books: Book[];
  isLoading: boolean;
  addBook: (book: Omit<Book, "id" | "addedAt">) => boolean;
  updateBook: (
    id: string,
    data: Partial<Pick<Book, "title" | "author" | "genre" | "coverUrl">>,
  ) => void;
  updateBookStatus: (id: string, status: BookStatus) => void;
  updateBookNotes: (id: string, notes: string) => void;
  updateBookProgress: (
    id: string,
    currentPage: number,
    pageCount: number,
  ) => void;
  deleteBook: (id: string) => void;
  getBookById: (id: string) => Book | undefined;
  clearAllData: () => Promise<void>;
  restoreBooks: (books: Book[]) => Promise<void>;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

const BOOKS_STORAGE_KEY = "books_data";

// Başlangıç için örnek veriler
const INITIAL_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Stranger",
    author: "Albert Camus",
    status: "Okunuyor",
    coverUrl:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400&h=600",
    genre: "Fiction",
    progress: 0.6,
    pageCount: 110,
    currentPage: 66,
    addedAt: Date.now(),
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    status: "Okunuyor",
    coverUrl:
      "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=400&h=600",
    genre: "Science Fiction",
    progress: 0.2,
    pageCount: 350,
    currentPage: 70,
    addedAt: Date.now() - 10000,
  },
  {
    id: "3",
    title: "The Alchemist",
    author: "Paulo Coelho",
    status: "Okundu",
    coverUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600",
    genre: "Fiction",
    progress: 1,
    pageCount: 188,
    currentPage: 188,
    addedAt: Date.now() - 20000,
  },
  {
    id: "4",
    title: "Dune",
    author: "Frank Herbert",
    status: "Okunacak",
    coverUrl:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400&h=600",
    genre: "Science Fiction",
    progress: 0,
    pageCount: 712,
    currentPage: 0,
    addedAt: Date.now() - 30000,
  },
];

export function BooksProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to track the current books array for duplicate checking
  // This is kept in sync with the books state via useEffect
  const booksRef = useRef<Book[]>([]);

  // Keep booksRef in sync with books state
  useEffect(() => {
    booksRef.current = books;
  }, [books]);

  // Kitapları yükle
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const savedBooks =
          await StorageService.getItem<Book[]>(BOOKS_STORAGE_KEY);
        if (savedBooks) {
          setBooks(savedBooks);
        } else {
          // İlk kez açılıyorsa örnek verileri yükle
          setBooks(INITIAL_BOOKS);
          await StorageService.setItem(BOOKS_STORAGE_KEY, INITIAL_BOOKS);
        }
      } catch (error) {
        await logErrorWithCrashlytics("BooksContext.loadBooks", error);
        Alert.alert(i18n.t("profile_error_title"), i18n.t("books_load_error"));
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Kitaplar değiştiğinde GECİKMELİ (Debounce: 500ms) kaydet
  useEffect(() => {
    if (isLoading) return;

    const handler = setTimeout(async () => {
      try {
        await StorageService.setItem(BOOKS_STORAGE_KEY, books);
      } catch (error) {
        await logErrorWithCrashlytics("BooksContext.saveBooks", error);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [books, isLoading]);

  // Kitap ekleme - useCallback ile memoize edildi
  // books bağımlılığı kaldırıldı (performans düzeltmesi - S7159)
  // booksRef kullanarak books state'e bağımlılık olmadan duplicate kontrolü
  const addBook = useCallback(
    (newBookData: Omit<Book, "id" | "addedAt">): boolean => {
      const normalizedTitle = (newBookData.title || "").trim().toLowerCase();
      const normalizedAuthor = (newBookData.author || "").trim().toLowerCase();

      // Duplicate kontrolü
      const isDuplicate = booksRef.current.some(
        (book) =>
          book.title.toLowerCase().trim() === normalizedTitle &&
          book.author.toLowerCase().trim() === normalizedAuthor,
      );

      if (isDuplicate) {
        Alert.alert(
          i18n.t("add_book_duplicate_title"),
          i18n.t("add_book_duplicate_msg"),
        );
        return false;
      }

      // Yeni kitap oluştur
      const newBook: Book = {
        id: Date.now().toString(),
        addedAt: Date.now(),
        ...newBookData,
      };

      // State güncelle (ref useEffect ile otomatik güncellenecek)
      setBooks((prev) => {
        // Crashlytics: Kitap sayısını ve son işlemi güncelle
        void CrashlyticsService.setBookCount(prev.length + 1);
        void CrashlyticsService.setLastOperation("add");

        return [newBook, ...prev];
      });

      return true;
    },
    [], // Boş bağımlılık dizisi - books değiştiğinde yeniden oluşturulmaz
  );

  // Kitap durumu güncelleme - useCallback ile memoize edildi (booksRef ile stabil hale getirildi)
  const updateBookStatus = useCallback(
    (id: string, status: BookStatus) => {
      // Ref üzerinden güncel listeyi al (stability için)
      const currentBooks = booksRef.current;
      const previousBook = currentBooks.find((b) => b.id === id);
      const wasNotCompleted = previousBook?.status !== "Okundu";

      setBooks((prev) =>
        prev.map((book) => {
          if (book.id === id) {
            const updatedBook = { ...book, status };
            // Status değiştiğinde progress güncelleme mantığı
            if (status === "Okundu") {
              updatedBook.progress = 1;
              updatedBook.currentPage = book.pageCount || book.currentPage;
            } else if (status === "Okunacak") {
              updatedBook.progress = 0;
              updatedBook.currentPage = 0;
            }
            return updatedBook;
          }
          return book;
        }),
      );

      // Kitap yeni tamamlandıysa bildirim gönder
      if (status === "Okundu" && wasNotCompleted && previousBook) {
        void triggerBookCompletionNotification(previousBook.title);
      }
    },
    [], // Boş bağımlılık dizisi - tam stabilite
  );

  // Kitap bitirme bildirimi tetikleyici (ayar kontrolü dahil)
  const triggerBookCompletionNotification = async (bookTitle: string) => {
    try {
      const settings = await StorageService.getItem<{
        bookCompletionCelebration?: boolean;
      }>("notification_settings_v1");
      // Settings yoksa varsayılan değer TRUE (ilk kurulum race condition fix)
      const shouldCelebrate = settings?.bookCompletionCelebration ?? true;
      if (shouldCelebrate) {
        await sendBookCompletionNotification(bookTitle);
      }
    } catch {
      // Bildirim gönderilemezse sessizce devam et
    }
  };

  // Kitap notları güncelleme - useCallback ile memoize edildi
  const updateBookNotes = useCallback((id: string, notes: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === id) {
          return { ...book, notes };
        }
        return book;
      }),
    );
  }, []);

  // Kitap bilgileri güncelleme (başlık, yazar, tür, kapak) - useCallback ile memoize edildi
  const updateBook = useCallback(
    (
      id: string,
      data: Partial<Pick<Book, "title" | "author" | "genre" | "coverUrl">>,
    ) => {
      setBooks((prev) => {
        // Crashlytics: Son işlemi güncelle
        void CrashlyticsService.setLastOperation("edit");

        return prev.map((book) => {
          if (book.id === id) {
            return { ...book, ...data };
          }
          return book;
        });
      });
    },
    [],
  );

  // Kitap ilerleme güncelleme - useCallback ile memoize edildi
  const updateBookProgress = useCallback(
    (id: string, currentPage: number, pageCount: number) => {
      setBooks((prev) =>
        prev.map((book) => {
          if (book.id === id) {
            const progress = pageCount > 0 ? currentPage / pageCount : 0;
            const progressPercentage = Math.round(progress * 100);

            // Kilometre taşı kontrolü (%25, %50, %75)
            const milestones = book.progressMilestones || [];
            const newMilestones = [...milestones];
            let milestoneReached: number | null = null;

            // Her kilometre taşını kontrol et ve sadece bir kere bildirim gönder
            if (progressPercentage >= 75 && !milestones.includes(75)) {
              newMilestones.push(75);
              milestoneReached = 75;
            } else if (progressPercentage >= 50 && !milestones.includes(50)) {
              newMilestones.push(50);
              milestoneReached = 50;
            } else if (progressPercentage >= 25 && !milestones.includes(25)) {
              newMilestones.push(25);
              milestoneReached = 25;
            }

            // Bildirim gönder (async, blocking olmasın)
            if (milestoneReached !== null) {
              void triggerReadingProgressNotification(
                book.title,
                milestoneReached,
              );
            }

            return {
              ...book,
              currentPage,
              pageCount,
              progress: Math.min(Math.max(progress, 0), 1),
              progressMilestones: newMilestones,
            };
          }
          return book;
        }),
      );
    },
    [],
  );

  // Okuma ilerlemesi bildirimi tetikleyici (ayar kontrolü dahil)
  const triggerReadingProgressNotification = async (
    bookTitle: string,
    milestone: number,
  ) => {
    try {
      const settings = await StorageService.getItem<{
        readingProgressAlert?: boolean;
      }>("notification_settings_v1");
      // Settings yoksa varsayılan değer TRUE (ilk kurulum race condition fix)
      const shouldAlert = settings?.readingProgressAlert ?? true;
      if (shouldAlert) {
        await sendReadingProgressNotification(bookTitle, milestone);
      }
    } catch {
      // Bildirim gönderilemezse sessizce devam et
    }
  };

  // Kitap silme - useCallback ile memoize edildi
  const deleteBook = useCallback((id: string) => {
    setBooks((prev) => {
      // Crashlytics: Son işlemi ve kitap sayısını güncelle
      void CrashlyticsService.setLastOperation("delete");
      void CrashlyticsService.setBookCount(prev.length - 1);

      return prev.filter((book) => book.id !== id);
    });
  }, []);

  // ID'ye göre kitap getirme - books state'i kullanarak reaktif hale getirildi
  const getBookById = useCallback(
    (id: string) => {
      return books.find((book) => book.id === id);
    },
    [books],
  );

  // Tüm verileri temizle - useCallback ile memoize edildi
  const clearAllData = useCallback(async () => {
    try {
      await StorageService.removeItem(BOOKS_STORAGE_KEY);
      setBooks(INITIAL_BOOKS);
      Alert.alert(i18n.t("success_title"), i18n.t("data_reset_success"));
    } catch (error) {
      await logErrorWithCrashlytics("BooksContext.clearAllData", error);
      Alert.alert(i18n.t("profile_error_title"), i18n.t("data_reset_error"));
    }
  }, []);

  // Kitapları geri yükle - useCallback ile memoize edildi
  const restoreBooks = useCallback(async (restoredBooks: Book[]) => {
    try {
      setBooks(restoredBooks);
      // useEffect will handle saving to AsyncStorage
      Alert.alert(
        i18n.t("success_title"),
        i18n.t("books_restore_success", { count: restoredBooks.length }),
      );
    } catch (error) {
      await logErrorWithCrashlytics("BooksContext.restoreBooks", error);
      Alert.alert(i18n.t("profile_error_title"), i18n.t("data_restore_error"));
    }
  }, []);

  // Context value - useMemo ile memoize edildi (S6481 düzeltmesi)
  const contextValue = useMemo<BooksContextType>(
    () => ({
      books,
      isLoading,
      addBook,
      updateBook,
      updateBookStatus,
      updateBookNotes,
      updateBookProgress,
      deleteBook,
      getBookById,
      clearAllData,
      restoreBooks,
    }),
    [
      books,
      isLoading,
      addBook,
      updateBook,
      updateBookStatus,
      updateBookNotes,
      updateBookProgress,
      deleteBook,
      getBookById,
      clearAllData,
      restoreBooks,
    ],
  );

  return (
    <BooksContext.Provider value={contextValue}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error("useBooks must be used within a BooksProvider");
  }
  return context;
}
