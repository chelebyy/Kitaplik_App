import { db } from '../config/firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { Book } from '../context/BooksContext';

export const FirestoreService = {
    // Get all books for a user
    getBooks: async (userId: string): Promise<Book[]> => {
        try {
            const booksRef = collection(db, 'users', userId, 'books');
            const snapshot = await getDocs(booksRef);
            return snapshot.docs.map(doc => doc.data() as Book);
        } catch (error) {
            console.error('Error fetching books from Firestore:', error);
            return [];
        }
    },

    // Add or Update a book
    saveBook: async (userId: string, book: Book) => {
        try {
            const bookRef = doc(db, 'users', userId, 'books', book.id);
            await setDoc(bookRef, book);
        } catch (error) {
            console.error('Error saving book to Firestore:', error);
        }
    },

    // Delete a book
    deleteBook: async (userId: string, bookId: string) => {
        try {
            const bookRef = doc(db, 'users', userId, 'books', bookId);
            await deleteDoc(bookRef);
        } catch (error) {
            console.error('Error deleting book from Firestore:', error);
        }
    },

    // Sync local books to cloud (Merge)
    syncLocalToCloud: async (userId: string, localBooks: Book[]) => {
        try {
            const batch = writeBatch(db);
            localBooks.forEach(book => {
                const bookRef = doc(db, 'users', userId, 'books', book.id);
                batch.set(bookRef, book);
            });
            await batch.commit();
            console.log('Local books synced to cloud');
        } catch (error) {
            console.error('Error syncing to cloud:', error);
        }
    }
};
