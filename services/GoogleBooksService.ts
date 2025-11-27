import { Alert } from 'react-native';

export interface GoogleBookResult {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: {
            thumbnail: string;
        };
        categories?: string[];
        pageCount?: number;
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
    };
}

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const GoogleBooksService = {
    /**
     * Search for books by general query (title, author, etc.)
     * @param query Search term
     * @returns List of books or empty array
     */
    searchBooks: async (query: string): Promise<GoogleBookResult[]> => {
        try {
            const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=10`);
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Google Books Search Error:', error);
            throw new Error('Kitap aranırken bir sorun oluştu.');
        }
    },

    /**
     * Search for a specific book by ISBN
     * @param isbn ISBN-10 or ISBN-13
     * @returns The first matching book or null
     */
    searchByIsbn: async (isbn: string): Promise<GoogleBookResult | null> => {
        try {
            const response = await fetch(`${BASE_URL}?q=isbn:${isbn}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                return data.items[0];
            }
            return null;
        } catch (error) {
            console.error('Google Books ISBN Error:', error);
            throw new Error('Barkod taranırken bir sorun oluştu.');
        }
    }
};
