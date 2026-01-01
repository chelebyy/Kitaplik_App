import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { logError } from "../utils/errorUtils";

export interface OpenLibraryBookResult {
    key: string;
    title?: string;
    authors?: Array<{ name: string }>;
    covers?: number[];
    subjects?: string[];
    number_of_pages?: number;
    isbn_10?: string[];
    isbn_13?: string[];
}

const BASE_URL = "https://openlibrary.org";

export const OpenLibraryService = {
    /**
     * Search for a book by ISBN using Open Library API
     * @param isbn - ISBN-10 or ISBN-13
     * @returns Book data or null if not found
     */
    searchByIsbn: async (isbn: string): Promise<OpenLibraryBookResult | null> => {
        try {
            // Open Library ISBN endpoint
            const response = await fetchWithTimeout(
                `${BASE_URL}/isbn/${isbn}.json`,
                10000, // 10 second timeout
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            logError("OpenLibraryService.searchByIsbn", error);
            return null;
        }
    },

    /**
     * Get cover image URL for a book
     * @param coverId - Cover ID from Open Library
     * @param size - Size: S (small), M (medium), L (large)
     * @returns Cover image URL
     */
    getCoverUrl: (coverId: number, size: "S" | "M" | "L" = "L"): string => {
        return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
    },

    /**
     * Convert Open Library result to our GoogleBookResult format
     * This allows us to use the same data structure across the app
     */
    toGoogleBookFormat: (
        openLibBook: OpenLibraryBookResult,
    ): {
        id: string;
        volumeInfo: {
            title: string;
            authors?: string[];
            imageLinks?: { thumbnail: string };
            categories?: string[];
            pageCount?: number;
        };
    } => {
        return {
            id: openLibBook.key,
            volumeInfo: {
                title: openLibBook.title || "Bilinmeyen Kitap",
                authors: openLibBook.authors?.map((a) => a.name),
                imageLinks: openLibBook.covers?.[0]
                    ? {
                        thumbnail: OpenLibraryService.getCoverUrl(
                            openLibBook.covers[0],
                            "M",
                        ),
                    }
                    : undefined,
                categories: openLibBook.subjects?.slice(0, 1),
                pageCount: openLibBook.number_of_pages,
            },
        };
    },
};
