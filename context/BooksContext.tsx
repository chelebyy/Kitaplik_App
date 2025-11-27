import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
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
  progress?: number; // 0 ile 1 arası (Yüzdelik gösterim için korunuyor)
  pageCount?: number; // Toplam sayfa sayısı
  currentPage?: number; // Şu anki sayfa
  notes?: string;
  addedAt: number;
}

interface BooksContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  updateBookStatus: (id: string, status: BookStatus) => void;
  updateBookNotes: (id: string, notes: string) => void;
  updateBookProgress: (id: string, currentPage: number, pageCount: number) => void;
  deleteBook: (id: string) => void;
  getBookById: (id: string) => Book | undefined;
  clearAllData: () => Promise<void>;
  restoreBooks: (books: Book[]) => Promise<void>;
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
    pageCount: 110,
    currentPage: 66,
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
    pageCount: 350,
    currentPage: 70,
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
    pageCount: 188,
    currentPage: 188,
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
    pageCount: 712,
    currentPage: 0,
    addedAt: Date.now() - 30000,
  },
];

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kitapları yükle
  useEffect(() => {
    const loadBooks = async () => {
      try {
        if (user) {
          // Kullanıcı giriş yapmışsa Firestore'dan yükle
          const firestoreBooks = await FirestoreService.getBooks(user.uid);

          // Eğer Firestore boşsa ama yerelde veri varsa (ilk giriş senaryosu), yerel veriyi aktar
          if (firestoreBooks.length === 0) {
            const localData = await AsyncStorage.getItem('books');
            if (localData) {
              const localBooks = JSON.parse(localData);
              if (localBooks.length > 0) {
                // Yerel kitapları Firestore'a kaydet
                for (const book of localBooks) {
                  await FirestoreService.saveBook(user.uid, book);
                }
                setBooks(localBooks);
                // Yerel veriyi temizle (isteğe bağlı, ama karışıklığı önler)
                await AsyncStorage.removeItem('books');
              } else {
                setBooks([]);
              }
            } else {
              setBooks([]);
            }
          } else {
            setBooks(firestoreBooks);
          }
        } else {
          // Misafir kullanıcı ise AsyncStorage'dan yükle
          const savedBooks = await AsyncStorage.getItem('books');
          if (savedBooks) {
            setBooks(JSON.parse(savedBooks));
          } else {
            // İlk kez açılıyorsa örnek verileri yükle
            setBooks(INITIAL_BOOKS);
            await AsyncStorage.setItem('books', JSON.stringify(INITIAL_BOOKS));
          }
        }
      } catch (error) {
        console.error('Error loading books:', error);
        Alert.alert('Hata', 'Kitaplar yüklenirken bir sorun oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [user]);

  // Kitaplar değiştiğinde yerel depolamayı güncelle (Sadece misafir kullanıcılar için)
  useEffect(() => {
    const saveLocal = async () => {
      if (!user && !isLoading) {
        try {
          await AsyncStorage.setItem('books', JSON.stringify(books));
        } catch (error) {
          console.error('Error saving books locally:', error);
        }
      }
    };

    saveLocal();
  }, [books, user, isLoading]);

  const addBook = async (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook: Book = {
      id: Date.now().toString(),
      addedAt: Date.now(),
      ...newBookData,
    };

    const updatedBooks = [newBook, ...books];
    setBooks(updatedBooks);

    if (user) {
      try {
        await FirestoreService.saveBook(user.uid, newBook);
      } catch (error) {
        console.error('Error saving book to Firestore:', error);
        Alert.alert('Hata', 'Kitap buluta kaydedilemedi.');
      }
    }
  };

  const updateBookStatus = async (id: string, status: BookStatus) => {
    const updatedBooks = books.map((book) => {
      if (book.id === id) {
        const updatedBook = { ...book, status };
        // Status değiştiğinde progress güncelleme mantığı
        if (status === 'Okundu') {
          updatedBook.progress = 1;
          updatedBook.currentPage = book.pageCount || book.currentPage;
        } else if (status === 'Okunacak') {
          updatedBook.progress = 0;
          updatedBook.currentPage = 0;
        }

        if (user) {
          FirestoreService.updateBook(user.uid, updatedBook).catch(err =>
            console.error('Error updating book status in Firestore:', err)
          );
        }
        return updatedBook;
      }
      return book;
    });
    setBooks(updatedBooks);
  };

  const updateBookNotes = async (id: string, notes: string) => {
    const updatedBooks = books.map((book) => {
      if (book.id === id) {
        const updatedBook = { ...book, notes };
        if (user) {
          FirestoreService.updateBook(user.uid, updatedBook).catch(err =>
            console.error('Error updating book notes in Firestore:', err)
          );
        }
        return updatedBook;
      }
      return book;
    });
    setBooks(updatedBooks);
  };

  const updateBookProgress = async (id: string, currentPage: number, pageCount: number) => {
    const updatedBooks = books.map((book) => {
      if (book.id === id) {
        const progress = pageCount > 0 ? currentPage / pageCount : 0;
        const updatedBook = {
          ...book,
          currentPage,
          pageCount,
          progress: Math.min(Math.max(progress, 0), 1)
        };

        if (user) {
          FirestoreService.updateBook(user.uid, updatedBook).catch(err =>
            console.error('Error updating book progress in Firestore:', err)
          );
        }
        return updatedBook;
      }
      return book;
    });
    setBooks(updatedBooks);
  };

  const deleteBook = async (id: string) => {
    const updatedBooks = books.filter((book) => book.id !== id);
    setBooks(updatedBooks);

    if (user) {
      try {
        await FirestoreService.deleteBook(user.uid, id);
      } catch (error) {
        console.error('Error deleting book from Firestore:', error);
        Alert.alert('Hata', 'Kitap buluttan silinemedi.');
      }
    }
  };

  const getBookById = (id: string) => {
    return books.find((book) => book.id === id);
  };

  const clearAllData = async () => {
    try {
      if (user) {
        // Kullanıcı giriş yapmışsa Firestore'daki verileri silmeli miyiz? 
        // Genellikle "Verileri Sıfırla" yerel veriyi ve state'i sıfırlar.
        // Ancak tam bir sıfırlama isteniyorsa Firestore da temizlenmeli.
        // Şimdilik sadece yerel state'i ve AsyncStorage'ı sıfırlıyoruz, 
        // ama Firestore senkronizasyonu varsa oraya da yansıtmak gerekebilir.
        // Güvenlik için şimdilik sadece yerel sıfırlama yapalım ve kullanıcıyı uyaralım.
        Alert.alert('Bilgi', 'Bulut verileriniz korunmaktadır. Sadece yerel görünüm sıfırlandı.');
      }

      await AsyncStorage.removeItem('books');
      setBooks(INITIAL_BOOKS);
      Alert.alert('Başarılı', 'Tüm veriler sıfırlandı ve varsayılan kitaplar yüklendi.');
    } catch (error) {
      console.error('Error clearing data:', error);
      Alert.alert('Hata', 'Veriler sıfırlanırken bir sorun oluştu.');
    }
  };

  const restoreBooks = async (restoredBooks: Book[]) => {
    try {
      setBooks(restoredBooks);

      if (user) {
        Alert.alert('Uyarı', 'Bulut senkronizasyonu için her kitabın güncellenmesi gerekebilir. Bu işlem biraz zaman alabilir.');
        // Firestore'a toplu veya tek tek kaydetme
        for (const book of restoredBooks) {
          await FirestoreService.saveBook(user.uid, book);
        }
      } else {
        await AsyncStorage.setItem('books', JSON.stringify(restoredBooks));
      }

      Alert.alert('Başarılı', `${restoredBooks.length} kitap başarıyla geri yüklendi.`);
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Hata', 'Veriler kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <BooksContext.Provider value={{
      books,
      addBook,
      updateBookStatus,
      updateBookNotes,
      updateBookProgress,
      deleteBook,
      getBookById,
      clearAllData,
      restoreBooks
    }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
}
