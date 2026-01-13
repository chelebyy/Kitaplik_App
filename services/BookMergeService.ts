/**
 * BookMergeService - Akıllı Kitap Veri Birleştirme Servisi
 *
 * Google Books ve Open Library'den gelen kitap verilerini
 * akıllıca birleştirerek eksik alanları tamamlar.
 *
 * Öncelik Kuralları:
 * - title: Google Books tercih
 * - authors: Google Books tercih
 * - imageLinks: Google Books, yoksa Open Library
 * - categories: İkisinden de al (merge)
 * - pageCount: Google Books, yoksa Open Library
 */

import { GoogleBookResult } from "./GoogleBooksService";
import { convertISBN10ToISBN13 } from "../utils/isbnConverter";
import { normalizeForMatching } from "../utils/stringUtils";

/**
 * ISBN-13 çıkarır (Google Books formatından)
 * ISBN-10 varsa ISBN-13'e dönüştürür
 */
export function extractISBN13(
  identifiers?: { type: string; identifier: string }[],
): string | null {
  if (!identifiers || identifiers.length === 0) return null;

  // Önce ISBN-13 ara
  const isbn13 = identifiers.find((id) => id.type === "ISBN_13")?.identifier;
  if (isbn13) return isbn13;

  // ISBN-10 varsa dönüştür
  const isbn10 = identifiers.find((id) => id.type === "ISBN_10")?.identifier;
  if (isbn10) {
    return convertISBN10ToISBN13(isbn10);
  }

  return null;
}

/**
 * Kategorileri birleştirir ve duplicate'lardan kurtulur
 * Case-insensitive karşılaştırma yapar
 */
export function mergeCategories(
  googleCats?: string[],
  olCats?: string[],
): string[] | undefined {
  const allCategories = [...(googleCats || []), ...(olCats || [])];

  if (allCategories.length === 0) return undefined;

  // Duplicate'ları kaldır (case-insensitive)
  const unique = new Map<string, string>();
  allCategories.forEach((cat) => {
    const normalized = cat.toLowerCase().trim();
    if (!unique.has(normalized)) {
      unique.set(normalized, cat); // Orijinal case'i koru
    }
  });

  return Array.from(unique.values());
}

/**
 * İki kitap kaydını akıllıca birleştirir
 * Primary'deki mevcut veriler ASLA ezilmez
 *
 * @param googleBook - Google Books'tan gelen kitap (primary)
 * @param olBook - Open Library'den gelen kitap (secondary)
 * @returns Birleştirilmiş kitap verisi
 */
export function mergeBooks(
  googleBook: GoogleBookResult | null,
  olBook: GoogleBookResult | null,
): GoogleBookResult {
  // Validation
  if (!googleBook && !olBook) {
    throw new Error("At least one book source required");
  }

  // Tek kaynak varsa onu döndür
  if (!googleBook) {
    // TypeScript: At this point, olBook must be non-null because of the check above
    return olBook as GoogleBookResult;
  }

  if (!olBook) {
    return googleBook;
  }

  // İki kaynak da var → Akıllı birleştirme
  const gInfo = googleBook.volumeInfo;
  const oInfo = olBook.volumeInfo;

  const merged: GoogleBookResult = {
    id: googleBook.id, // Google Books ID'sini koru
    volumeInfo: {
      // Title: Google Books tercih (daha güvenilir)
      title: gInfo.title || oInfo.title || "",

      // Authors: Google Books tercih (daha detaylı)
      authors: gInfo.authors || oInfo.authors,

      // Language: Google Books tercih (standart ISO 639-1)
      language: gInfo.language || oInfo.language,

      // Cover Image: Google Books varsa o, yoksa Open Library
      imageLinks: gInfo.imageLinks || oInfo.imageLinks,

      // Categories: Merge (ikisinden de al, duplicate kaldır)
      categories: mergeCategories(gInfo.categories, oInfo.categories),

      // Page Count: Google Books varsa o, yoksa Open Library
      pageCount: gInfo.pageCount || oInfo.pageCount,

      // ISBN: Google Books (yapılandırılmış format)
      industryIdentifiers:
        gInfo.industryIdentifiers || oInfo.industryIdentifiers,
    },
  };

  return merged;
}

/**
 * Unique key oluşturur (ISBN veya title+author)
 */
function getUniqueKey(book: GoogleBookResult): string {
  // volumeInfo null check - safety for malformed data
  const info = book.volumeInfo;
  if (!info) {
    return `id:${book.id}`;
  }

  const isbn13 = extractISBN13(info.industryIdentifiers);
  if (isbn13) {
    return `isbn:${isbn13}`;
  }

  // Fallback: title + author
  const title = normalizeForMatching(info.title || "");
  const author = normalizeForMatching(info.authors?.[0] || "");
  return `title:${title}|${author}`;
}

/**
 * Google Books ve Open Library sonuçlarını akıllıca birleştirir
 *
 * Algoritma:
 * 1. Google Books sonuçlarını Map'e ekle (ISBN veya title+author key ile)
 * 2. Open Library sonuçlarını kontrol et:
 *    - Aynı key varsa → mergeBooks() ile birleştir
 *    - Yoksa → yeni kayıt olarak ekle
 *
 * @param googleBooks - Google Books API sonuçları
 * @param olBooks - Open Library API sonuçları
 * @returns Birleştirilmiş ve dedupe edilmiş sonuçlar
 */
export function mergeSearchResults(
  googleBooks: GoogleBookResult[],
  olBooks: GoogleBookResult[],
): GoogleBookResult[] {
  // ISBN/Title+Author tabanlı Map
  const bookMap = new Map<string, GoogleBookResult>();

  // 1. Google Books sonuçlarını ekle
  googleBooks.forEach((book) => {
    const key = getUniqueKey(book);
    if (!bookMap.has(key)) {
      bookMap.set(key, book);
    }
  });

  // 2. Open Library sonuçlarını kontrol et ve birleştir
  olBooks.forEach((olBook) => {
    const key = getUniqueKey(olBook);

    if (bookMap.has(key)) {
      // Aynı kitap bulundu → Birleştir
      const existingBook = bookMap.get(key);
      if (existingBook) {
        const mergedBook = mergeBooks(existingBook, olBook);
        bookMap.set(key, mergedBook);
      }
    } else {
      // Yeni kitap → Ekle
      bookMap.set(key, olBook);
    }
  });

  // Map'ten array'e çevir
  return Array.from(bookMap.values());
}

/**
 * ISBN araması sonuçlarını akıllıca birleştirir
 *
 * Öncelik Kuralları:
 * - Aynı ISBN → Birleştir (kapak olanı önceliklendir)
 * - Farklı ISBN → Ayrı tut (seçim için)
 * - Kapak olanlar önce sıralanır
 *
 * @param googleBook - Google Books API sonucu
 * @param olBook - Open Library API sonucu
 * @returns Birleştirilmiş ve sıralanmış sonuçlar
 */
export function mergeIsbnResults(
  googleBook: GoogleBookResult | null,
  olBook: GoogleBookResult | null,
): GoogleBookResult[] {
  // Her iki sonuç da null ise boş dön
  if (!googleBook && !olBook) {
    return [];
  }

  // Tek kaynak varsa onu dön
  if (!googleBook) {
    // TypeScript: At this point, olBook must be non-null because of the check above
    return [olBook as GoogleBookResult];
  }

  if (!olBook) {
    return [googleBook];
  }

  // ISBN'leri karşılaştır
  const googleIsbn = extractISBN13(googleBook.volumeInfo?.industryIdentifiers);
  const olIsbn = extractISBN13(olBook.volumeInfo?.industryIdentifiers);

  // Aynı ISBN → Birleştir
  if (googleIsbn && olIsbn && googleIsbn === olIsbn) {
    // Aynı ISBN - kitapları birleştir
    return [mergeBooks(googleBook, olBook)];
  }

  // Farklı ISBN → Ayrı tut ve kapağa göre sırala
  const results = [googleBook, olBook];
  return results.sort((a, b) => {
    const aHasCover = a.volumeInfo?.imageLinks?.thumbnail ? 1 : 0;
    const bHasCover = b.volumeInfo?.imageLinks?.thumbnail ? 1 : 0;
    return bHasCover - aHasCover;
  });
}
