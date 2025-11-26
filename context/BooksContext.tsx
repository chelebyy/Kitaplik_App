
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/FirestoreService';

export type BookStatus = 'Okunacak' | 'Okunuyor' | 'Okundu';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  coverUrl: string;
  genre?: string;
  progress?: number; // 0 ile 1 arası
  notes?: string;
  addedAt: number;
}

interface BooksContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  updateBookStatus: (id: string, status: BookStatus) => void;
  updateBookNotes: (id: string, notes: string) => void;
  deleteBook: (id: string) => void;
  getBookById: (id: string) => Book | undefined;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

// Başlangıç için örnek veriler
const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Yabancı',
    author: 'Albert Camus',
    status: 'Okunuyor',
    coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400&h=600',
    genre: 'Roman',
    progress: 0.6,
    addedAt: Date.now(),
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    status: 'Okunuyor',
    coverUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=400&h=600',
    genre: 'Bilim Kurgu',
    progress: 0.2,
    addedAt: Date.now() - 10000,
  },
  {
    id: '3',
    title: 'Simyacı',
    author: 'Paulo Coelho',
    status: 'Okundu',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600',
    genre: 'Roman',
    progress: 1,
    addedAt: Date.now() - 20000,
  },
  {
    id: '4',
    title: 'Dune',
    author: 'Frank Herbert',
    status: 'Okunacak',
    coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400&h=600',
    genre: 'Bilim Kurgu',
    progress: 0,
    addedAt: Date.now() - 30000,
  },
];

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load books based on Auth state
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Logged In: Load from Firestore
          const cloudBooks = await FirestoreService.getBooks(user.uid);

          // Check for local books to sync (Migration scenario)
          const localBooksJson = await AsyncStorage.getItem('books');
          if (localBooksJson) {
            const localBooks = JSON.parse(localBooksJson);
            if (localBooks.length > 0) {
              // Merge local books to cloud
              await FirestoreService.syncLocalToCloud(user.uid, localBooks);

              // Refetch to get merged data
              const mergedBooks = await FirestoreService.getBooks(user.uid);
              setBooks(mergedBooks);

              // Clear local books to prevent confusion
              await AsyncStorage.removeItem('books');
            } else {
              setBooks(cloudBooks);
            }
          } else {
            setBooks(cloudBooks);
          }
        } else {
          // Guest: Load from AsyncStorage
          const storedBooks = await AsyncStorage.getItem('books');
          if (storedBooks) {
            setBooks(JSON.parse(storedBooks));
          } else {
            setBooks(INITIAL_BOOKS);
            await AsyncStorage.setItem('books', JSON.stringify(INITIAL_BOOKS));
          }
        }
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [user]);

  // Save books (Effect for Local Storage only)
  useEffect(() => {
    const saveLocal = async () => {
      if (!user && !isLoading) {
        await AsyncStorage.setItem('books', JSON.stringify(books));
      }
    };
    saveLocal();
  }, [books, user, isLoading]);

  const addBook = async (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook: Book = {
      id: Date.now().toString(),
      addedAt: Date.now(),
      ...newBookData,
      progress: newBookData.status === 'Okundu' ? 1 : (newBookData.progress || 0),
    };

    setBooks(prev => [newBook, ...prev]);

    if (user) {
      await FirestoreService.saveBook(user.uid, newBook);
    }
  };

  const updateBookStatus = async (id: string, status: BookStatus) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        const updatedBook = {
          ...book,
          status,
          progress: status === 'Okundu' ? 1 : (status === 'Okunacak' ? 0 : book.progress)
        };
        if (user) {
          FirestoreService.saveBook(user.uid, updatedBook);
        }
        return updatedBook;
      }
      return book;
    }));
  };

  const updateBookNotes = async (id: string, notes: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        const updatedBook = { ...book, notes };
        if (user) {
          FirestoreService.saveBook(user.uid, updatedBook);
        }
        return updatedBook;
      }
      return book;
    }));
  };

  const deleteBook = async (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    if (user) {
      await FirestoreService.deleteBook(user.uid, id);
    }
  };

  const getBookById = (id: string) => {
    return books.find(book => book.id === id);
  };

  return (
    <BooksContext.Provider value={{ books, addBook, updateBookStatus, updateBookNotes, deleteBook, getBookById }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
}
