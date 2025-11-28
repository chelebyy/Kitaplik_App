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
     * @param lang Language code (e.g., 'tr', 'en')
     * @returns List of books or empty array
     */
    searchBooks: async (query: string, lang: string = 'tr'): Promise<GoogleBookResult[]> => {
        try {
            // hl: Interface language (for snippets, etc.)
            // langRestrict: Restrict results to specific language (for book content/title)
            const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=10&hl=${lang}&langRestrict=${lang}`);
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
     * @param lang Language code (e.g., 'tr', 'en')
     * @returns The first matching book or null
     */
    searchByIsbn: async (isbn: string, lang: string = 'tr'): Promise<GoogleBookResult | null> => {
        try {
            const response = await fetch(`${BASE_URL}?q=isbn:${isbn}&hl=${lang}&langRestrict=${lang}`);
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
