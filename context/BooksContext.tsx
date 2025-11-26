import React, { createContext, useContext, useState } from 'react';

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
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);

  const addBook = (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook: Book = {
      ...newBookData,
      id: Date.now().toString(), // Basit ID oluşturma
      addedAt: Date.now(),
      progress: newBookData.status === 'Okundu' ? 1 : (newBookData.progress || 0),
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const updateBookStatus = (id: string, status: BookStatus) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        return { 
          ...book, 
          status,
          progress: status === 'Okundu' ? 1 : (status === 'Okunacak' ? 0 : book.progress)
        };
      }
      return book;
    }));
  };

  const updateBookNotes = (id: string, notes: string) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, notes } : book
    ));
  };

  const deleteBook = (id: string) => {
    // Güvenli silme işlemi: ID'si eşleşmeyenleri filtrele
    setBooks(prev => {
      const updated = prev.filter(book => book.id !== id);
      return updated;
    });
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
