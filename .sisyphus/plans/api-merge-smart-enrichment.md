# Google Books & Open Library Akıllı Veri Birleştirme Planı

## Plan ID: PLAN-2025-01-06-001

**Durum:** 📋 Planlanıyor
**Öncelik:** Yüksek
**Tahmini Süre:** 4-6 saat
**Karmaşıklık:** Orta

---

## 📊 PROBLEMLER VE GEREKSİNİMLER

### Mevcut Durum

Kitaplık uygulamasında şu anda Google Books ve Open Library API'lerinden veri çekiliyor, ancak:

1. **Deduplication Var, Enrichment Yok:**
   - `SearchEngine.ts` zaten parallel arama yapıyor
   - `Promise.allSettled` ile iki API aynı anda çağrılıyor
   - Sonuçlar birleştiriliyor ama sadece duplicate'lardan kurtululuyor
   - Aynı kitabın Google Books'ta kapak resmi yoksa, Open Library'den getirilemiyor
   - Open Library'de kategori yoksa, Google Books'tan getirilemiyor

2. **API çağrı sayısı ARTMAYACAK:**
   - Şu anda zaten parallel arama yapılıyor
   - Ek API çağrısı gerektirmiyor
   - Mevcut veri akışı optimize edilecek

3. **Kayıp Veri Örnekleri:**

   ```
   Google Books: { title: "Kardeşimin Hikayesi", pageCount: 320,
                  imageLinks: undefined, categories: undefined }

   Open Library: { title: "Kardeşimin Hikayesi", pageCount: undefined,
                  imageLinks: { thumbnail: "..." }, categories: ["Roman"] }

   Mevcut: { title: "Kardeşimin Hikayesi", pageCount: 320,
             imageLinks: undefined, categories: undefined }

   İstenen: { title: "Kardeşimin Hikayesi", pageCount: 320,
             imageLinks: { thumbnail: "..." }, categories: ["Roman"] }
   ```

### Gereksinimler

- ✅ Google Books'tan dönen kitabın eksik alanları Open Library'den tamamlanacak
- ✅ Open Library'den dönen kitabın eksik alanları Google Books'tan tamamlanacak
- ✅ Mevcut arama akışına entegre edilecek
- ✅ Ek API çağrısı gerektirmeyecek
- ✅ ISBN-13 tabanlı akıllı deduplication
- ✅ Alan önceliklendirme (hangi kaynaktan ne alınmalı)

---

## 🔍 TEKNİK ANALİZ

### API Alanları Karşılaştırması

| Alan                   | Google Books   | Open Library         | Tercih                         |
| ---------------------- | -------------- | -------------------- | ------------------------------ |
| `title`                | ✅ Var         | ✅ Var               | Google Books (daha güvenilir)  |
| `authors`              | ✅ `string[]`  | ✅ `string[]`        | Google Books (detaylı)         |
| `pageCount`            | ✅ `number`    | ✅ `number_of_pages` | Google Books + OL (olmayan al) |
| `categories`           | ✅ `string[]`  | ✅ `subjects`        | İkisi de (merge)               |
| `imageLinks.thumbnail` | ✅ URL         | ✅ `cover_i` (ID)    | Google Books + OL (fallback)   |
| `language`             | ✅ `ISO 639-1` | ⚠️ Bazen             | Google Books                   |
| `industryIdentifiers`  | ✅ ISBN-10/13  | ✅ `isbn[]`          | Google Books (yapılandırılmış) |
| `publishedDate`        | ✅ `string`    | ❌ Yok               | Google Books                   |
| `description`          | ✅ `string`    | ❌ Yok               | Google Books                   |

### Mevcut Akış Analizi

**Dosya:** `services/SearchEngine.ts` (Satır 30-101)

```typescript
// Şu anki yaklaşım:
search: async (query, lang, searchType) => {
  if (isISBN(query)) {
    const book = await GoogleBooksService.searchByIsbn(query, lang);
    return book ? [book] : [];
  }

  // Parallel arama
  const [googleBooks, openLibBooks] = await Promise.allSettled([
    GoogleBooksService.searchBooks(query, lang, searchType, true),
    OpenLibraryService.searchBooks(query, searchType),
  ]);

  // Deduplication (sadece)
  const mergedMap = new Map<string, GoogleBookResult>();

  googleBooks.forEach((book) => {
    const key = getUniqueKey(book);
    if (!mergedMap.has(key)) mergedMap.set(key, book);
  });

  openLibBooks.forEach((book) => {
    const key = getUniqueKey(book);
    if (!mergedMap.has(key)) mergedMap.set(key, book);
  });

  // Skorlama ve sıralama
  return scoredBooks.map((item) => item.book);
};
```

**Sorun:** Aynı kitap farklı kaynaklardan gelse bile, sadece bir kaynak verisi tutuluyor.

### ISBN Tabanlı Matching Stratejisi

```
1. ISBN-13 varsa → Primary key
2. ISBN-10 varsa → ISBN-13'e çevir → Primary key
3. ISBN yoksa → Title + Author normalized → Secondary key
```

**Örnek ISBN matching:**

```typescript
// Google Books
{
  volumeInfo: {
    industryIdentifiers: [
      { type: "ISBN_13", identifier: "9786053609421" },
      { type: "ISBN_10", identifier: "6053609421" }
    ]
  }
}

// Open Library
{
  isbn_13: ["9786053609421"],
  isbn_10: ["6053609421"]
}

// Match: isbn:9786053609421
```

---

## 🎯 ÇÖZÜM MİMARİSİ

### 1. Smart Merge Fonksiyonu (YENİ)

**Dosya:** `services/BookMergeService.ts` (Yeni dosya)

```typescript
import { GoogleBookResult } from "./GoogleBooksService";
import { GoogleBookCompatible } from "./OpenLibraryService";
import { convertISBN10ToISBN13 } from "../utils/isbnConverter";

export interface BookWithSource extends GoogleBookResult {
  sources: ("google" | "openlibrary")[];
}

/**
 * ISBN-13 çıkarır (Google Books format)
 */
function extractISBN13(
  identifiers?: { type: string; identifier: string }[],
): string | null {
  if (!identifiers) return null;

  const isbn13 = identifiers.find((id) => id.type === "ISBN_13")?.identifier;
  if (isbn13) return isbn13;

  const isbn10 = identifiers.find((id) => id.type === "ISBN_10")?.identifier;
  if (isbn10) {
    return convertISBN10ToISBN13(isbn10);
  }

  return null;
}

/**
 * Akıllı kitap birleştirme
 * İki kaynaktan gelen aynı kitap için en iyi veriyi seçer
 */
export function mergeBooks(
  googleBook: GoogleBookResult | null,
  olBook: GoogleBookCompatible | null,
): GoogleBookResult {
  // Herhangi biri yoksa diğeri kullan
  if (!googleBook && !olBook) {
    throw new Error("At least one book source required");
  }

  if (!googleBook) {
    return { ...olBook, sources: ["openlibrary"] } as any;
  }

  if (!olBook) {
    return { ...googleBook, sources: ["google"] };
  }

  // İki kaynak da var → Enrichment başlasın!
  const merged: GoogleBookResult = {
    id: googleBook.id, // Google Books ID'si koru
    volumeInfo: {
      // Title: Google Books tercih edilir (daha güvenilir)
      title: googleBook.volumeInfo.title || olBook.volumeInfo.title || "",

      // Authors: Google Books (daha detaylı)
      authors: googleBook.volumeInfo.authors || olBook.volumeInfo.authors,

      // Language: Google Books (standart ISO 639-1)
      language: googleBook.volumeInfo.language || olBook.volumeInfo.language,

      // Cover Image: Google Books varsa o, yoksa Open Library fallback
      imageLinks:
        googleBook.volumeInfo.imageLinks || olBook.volumeInfo.imageLinks,

      // Categories: Merge (ikisinden de al, duplicate'lardan kurtul)
      categories: mergeCategories(
        googleBook.volumeInfo.categories,
        olBook.volumeInfo.categories,
      ),

      // Page Count: Hangisi varsa
      pageCount: googleBook.volumeInfo.pageCount || olBook.volumeInfo.pageCount,

      // ISBN: Google Books (yapılandırılmış format)
      industryIdentifiers: googleBook.volumeInfo.industryIdentifiers,

      // Published Date: Google Books (Open Library'de yok)
      publishedDate: googleBook.volumeInfo.publishedDate,
    },
  };

  return merged;
}

/**
 * Kategorileri birleştirir ve duplicate'lardan kurtulur
 */
function mergeCategories(
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
 * Google Books ve Open Library sonuçlarını akıllıca birleştirir
 */
export function mergeSearchResults(
  googleBooks: GoogleBookResult[],
  olBooks: GoogleBookCompatible[],
): GoogleBookResult[] {
  // ISBN-13 tabanlı matching
  const isbnMap = new Map<
    string,
    {
      google: GoogleBookResult | null;
      openlibrary: GoogleBookCompatible | null;
    }
  >();

  // Google Books ekle
  googleBooks.forEach((book) => {
    const isbn13 = extractISBN13(book.volumeInfo.industryIdentifiers);
    if (isbn13) {
      if (!isbnMap.has(isbn13)) {
        isbnMap.set(isbn13, { google: book, openlibrary: null });
      } else {
        // ISBN varsa, update et (Google Books priority)
        isbnMap.get(isbn13)!.google = book;
      }
    }
  });

  // Open Library ekle ve merge
  olBooks.forEach((book) => {
    // Open Library'den ISBN çıkarmayı deneyelim
    // Not: Şimdilik title+author matching kullanıyoruz
    // TODO: Open Library ISBN extraction implementasyonu
    const isbn13 = null; // Placeholder

    if (isbn13) {
      if (isbnMap.has(isbn13)) {
        // ISBN match buldu → Enrichment!
        const existing = isbnMap.get(isbn13)!;
        const merged = mergeBooks(existing.google, book);
        isbnMap.set(isbn13, { google: merged, openlibrary: book });
      } else {
        // Yeni kitap
        isbnMap.set(isbn13, { google: null, openlibrary: book });
      }
    }
  });

  // Map'ten array'e çevir
  const results: GoogleBookResult[] = [];

  for (const entry of isbnMap.values()) {
    if (entry.google && entry.openlibrary) {
      // İki kaynak da var → Zaten mergeBooks() çağrıldı
      results.push(entry.google);
    } else if (entry.google) {
      // Sadece Google Books
      results.push(entry.google);
    } else if (entry.openlibrary) {
      // Sadece Open Library → Convert to Google format
      results.push(entry.openlibrary as any);
    }
  }

  return results;
}
```

### 2. SearchEngine Güncelleme

**Dosya:** `services/SearchEngine.ts` (Değişiklikler)

```typescript
// İMPORT EKLE
import { mergeSearchResults } from "./BookMergeService";

export const SearchEngine = {
  search: async (
    query: string,
    lang: string = "tr",
    searchType: "book" | "author" = "book",
  ): Promise<GoogleBookResult[]> => {
    // 1. ISBN kontrolü (DEĞİŞMİYOR)
    if (SearchEngine.isISBN(query)) {
      const book = await GoogleBooksService.searchByIsbn(query, lang);

      // YENİ: Open Library'den enrichment ekle
      if (book) {
        const olBook = await OpenLibraryService.searchByIsbn(query);
        if (olBook) {
          return [
            mergeBooks(book, OpenLibraryService.toGoogleBookFormat(olBook)),
          ];
        }
        return [book];
      }
      return [];
    }

    // 2. Parallel arama (DEĞİŞMİYOR)
    try {
      const [googleBooks, openLibBooks] = await Promise.allSettled([
        GoogleBooksService.searchBooks(query, lang, searchType, true),
        OpenLibraryService.searchBooks(query, searchType),
      ]);

      const googleBooksData =
        googleBooks.status === "fulfilled" ? googleBooks.value : [];

      const olBooksData =
        openLibBooks.status === "fulfilled" ? openLibBooks.value : [];

      // 3. YENİ: Smart merge (eski kod yerine)
      const mergedBooks = mergeSearchResults(googleBooksData, olBooksData);

      // 4. Skorlama ve sıralama (DEĞİŞMİYOR)
      const scoredBooks = mergedBooks.map((book) => ({
        book,
        score: calculateRelevanceScore(book, query, lang),
      }));

      scoredBooks.sort((a, b) => b.score - a.score);

      return scoredBooks.map((item) => item.book);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Search Engine Error:", message);
      return [];
    }
  },
};
```

### 3. Type Güncellemeleri

**Dosya:** `services/GoogleBooksService.ts` (Opsiyonel)

```typescript
export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    language?: string;
    imageLinks?: {
      thumbnail: string;
    };
    categories?: string[];
    pageCount?: number;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
    publishedDate?: string; // Opsiyonel
  };
}
```

---

## 📋 UYGULAMA ADIMLARI

### Phase 1: Temel Merge Altyapısı (2 saat)

#### 1.1. BookMergeService.ts oluştur

- [ ] `services/BookMergeService.ts` dosyası oluştur
- [ ] `extractISBN13()` fonksiyonu ekle (Google Books format)
- [ ] `mergeBooks()` fonksiyonu ekle (iki kitap merge etme)
- [ ] `mergeCategories()` fonksiyonu ekle (kategori birleştirme)
- [ ] `mergeSearchResults()` fonksiyonu ekle (tüm sonuçları merge etme)

**Testler:**

```typescript
// services/__tests__/BookMergeService.test.ts

describe("BookMergeService", () => {
  test("should merge cover image from Open Library when Google Books missing", () => {
    const gb = {
      id: "1",
      volumeInfo: { title: "Book", imageLinks: undefined },
    };
    const ol = {
      id: "2",
      volumeInfo: { title: "Book", imageLinks: { thumbnail: "http://..." } },
    };

    const merged = mergeBooks(gb, ol);
    expect(merged.volumeInfo.imageLinks?.thumbnail).toBe("http://...");
  });

  test("should merge categories from both sources", () => {
    const gb = {
      id: "1",
      volumeInfo: { title: "Book", categories: ["Fiction"] },
    };
    const ol = {
      id: "2",
      volumeInfo: { title: "Book", categories: ["Roman"] },
    };

    const merged = mergeBooks(gb, ol);
    expect(merged.volumeInfo.categories).toEqual(["Fiction", "Roman"]);
  });

  test("should prefer Google Books title", () => {
    const gb = { id: "1", volumeInfo: { title: "Correct Title" } };
    const ol = { id: "2", volumeInfo: { title: "Wrong Title" } };

    const merged = mergeBooks(gb, ol);
    expect(merged.volumeInfo.title).toBe("Correct Title");
  });
});
```

### Phase 2: SearchEngine Entegrasyonu (1 saat)

#### 2.1. SearchEngine.ts güncelle

- [ ] `import { mergeSearchResults } from "./BookMergeService"` ekle
- [ ] ISBN search kısmında enrichment ekle
- [ ] Parallel search sonucunda `mergeSearchResults()` çağır
- [ ] Eski deduplication kodunu kaldır (artık mergeSearchResults yapıyor)

**Test güncellemesi:**

```typescript
// services/__tests__/SearchEngine.test.ts güncelle

test("should merge data from both Google Books and Open Library", async () => {
  // Mock data with complementary info
  const gb = {
    id: "1",
    volumeInfo: {
      title: "Book",
      pageCount: 300,
      categories: undefined,
      imageLinks: undefined,
    },
  };

  const ol = {
    id: "2",
    volumeInfo: {
      title: "Book",
      pageCount: undefined,
      categories: ["Fiction"],
      imageLinks: { thumbnail: "http://..." },
    },
  };

  (GoogleBooksService.searchBooks as jest.Mock).mockResolvedValue([gb]);
  (OpenLibraryService.searchBooks as jest.Mock).mockResolvedValue([ol]);

  const results = await SearchEngine.search("Book", "en", "book");

  expect(results).toHaveLength(1);
  expect(results[0].volumeInfo.pageCount).toBe(300);
  expect(results[0].volumeInfo.categories).toEqual(["Fiction"]);
  expect(results[0].volumeInfo.imageLinks?.thumbnail).toBe("http://...");
});
```

### Phase 3: Testler ve Dokümantasyon (1-2 saat)

#### 3.1. Birim testleri yaz

- [ ] `services/__tests__/BookMergeService.test.ts` oluştur
- [ ] Merge fonksiyonları için 10+ test case
- [ ] Edge case'leri test et (null değerler, empty array, etc.)
- [ ] ISBN matching testleri

#### 3.2. Entegrasyon testleri

- [ ] `SearchEngine.test.ts` güncelle
- [ ] Real API'ye yakın mock data ile test
- [ ] End-to-end merge testleri

#### 3.3. Kod dokümantasyonu

- [ ] JSDoc comments ekle
- [ ] Örnek kullanım senaryoları
- [ ] Alan önceliklendirme tablosu (markdown)

---

## 🎨 TASARIM KARARLARI

### Alan Önceliklendirme Stratejisi

| Alan                   | Google Books | Open Library | Karar                          |
| ---------------------- | ------------ | ------------ | ------------------------------ |
| `title`                | ⭐⭐⭐       | ⭐⭐         | Google Books (daha güvenilir)  |
| `authors`              | ⭐⭐⭐       | ⭐⭐         | Google Books (daha detaylı)    |
| `imageLinks.thumbnail` | ⭐⭐⭐       | ⭐⭐         | Google Books + OL (fallback)   |
| `categories`           | ⭐⭐         | ⭐⭐⭐       | Merge (ikisinden de al)        |
| `pageCount`            | ⭐⭐⭐       | ⭐⭐         | Google Books + OL (olmayan al) |
| `language`             | ⭐⭐⭐       | ⭐           | Google Books (standart)        |
| `ISBN`                 | ⭐⭐⭐       | ⭐⭐         | Google Books (yapılandırılmış) |

### Matching Hiyerarşisi

```
1. ISBN-13 exact match (En güvenilir)
2. ISBN-10 → ISBN-13 conversion (İkinci en güvenilir)
3. Title + Author exact match (Fallback)
4. Title partial match (Son seçenek)
```

### Data Enrichment Örnekleri

#### Örnek 1: Cover Image Fallback

```typescript
// Google Books
{
  imageLinks: undefined;
}

// Open Library
{
  imageLinks: {
    thumbnail: "https://covers.openlibrary.org/b/id/123-M.jpg";
  }
}

// Result
{
  imageLinks: {
    thumbnail: "https://covers.openlibrary.org/b/id/123-M.jpg";
  }
}
```

#### Örnek 2: Categories Merge

```typescript
// Google Books
{
  categories: ["Fiction", "Science Fiction"];
}

// Open Library
{
  categories: ["Roman", "Bilim Kurgu"];
}

// Result
{
  categories: ["Fiction", "Science Fiction", "Roman", "Bilim Kurgu"];
}
```

#### Örnek 3: Page Count Completion

```typescript
// Google Books
{
  pageCount: undefined;
}

// Open Library
{
  pageCount: 320;
}

// Result
{
  pageCount: 320;
}
```

---

## 🧪 TEST STRATEJİSİ

### Unit Testler (BookMergeService.test.ts)

```typescript
describe("BookMergeService", () => {
  describe("extractISBN13", () => {
    test("should extract ISBN-13 from Google Books", () => {
      const book = {
        volumeInfo: {
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9786053609421" },
          ],
        },
      };
      expect(extractISBN13(book.volumeInfo.industryIdentifiers)).toBe(
        "9786053609421",
      );
    });

    test("should convert ISBN-10 to ISBN-13", () => {
      const book = {
        volumeInfo: {
          industryIdentifiers: [{ type: "ISBN_10", identifier: "6053609421" }],
        },
      };
      expect(extractISBN13(book.volumeInfo.industryIdentifiers)).toBe(
        "9786053609421",
      );
    });
  });

  describe("mergeBooks", () => {
    test("should merge cover from Open Library when Google Books missing", () => {
      const gb = {
        id: "1",
        volumeInfo: {
          title: "Book",
          imageLinks: undefined,
          categories: ["Fiction"],
          pageCount: 300,
        },
      };

      const ol = {
        id: "2",
        volumeInfo: {
          title: "Book",
          imageLinks: { thumbnail: "http://ol.com/cover.jpg" },
          categories: undefined,
          pageCount: undefined,
        },
      };

      const merged = mergeBooks(gb, ol);

      expect(merged.volumeInfo.imageLinks?.thumbnail).toBe(
        "http://ol.com/cover.jpg",
      );
      expect(merged.volumeInfo.categories).toEqual(["Fiction"]);
      expect(merged.volumeInfo.pageCount).toBe(300);
    });

    test("should deduplicate categories", () => {
      const gb = {
        id: "1",
        volumeInfo: { title: "Book", categories: ["Fiction", "Roman"] },
      };
      const ol = {
        id: "2",
        volumeInfo: { title: "Book", categories: ["fiction", "roman"] },
      };

      const merged = mergeBooks(gb, ol);

      expect(merged.volumeInfo.categories).toEqual(["Fiction", "Roman"]);
    });

    test("should prefer Google Books title", () => {
      const gb = { id: "1", volumeInfo: { title: "Correct Title" } };
      const ol = { id: "2", volumeInfo: { title: "Wrong Title" } };

      const merged = mergeBooks(gb, ol);
      expect(merged.volumeInfo.title).toBe("Correct Title");
    });

    test("should handle null Google Books", () => {
      const ol = { id: "2", volumeInfo: { title: "Book" } };

      const merged = mergeBooks(null, ol);
      expect(merged.volumeInfo.title).toBe("Book");
    });
  });
});
```

---

## ⚠️ RİSKLER VE MITIGASYON STRATEJİLERİ

### Risk 1: ISBN Uyuşmazlığı

**Sorun:** Aynı kitabın farklı baskıları farklı ISBN'lere sahip olabilir.

**Mitigasyon:**

- ISBN-13 varsa primary key olarak kullan
- ISBN yoksa title + author normalization kullan
- Tolerance threshold: %80 title similarity → same book

### Risk 2: Open Library ISBN Extraction

**Sorun:** Open Library'de ISBN formatları tutarsız olabilir.

**Mitigasyon:**

- Multiple field'ları kontrol et (isbn, isbn_10, isbn_13)
- Normalize all to ISBN-13 before comparison
- Test suite ile edge case'leri kapsa

### Risk 3: Data Quality Issues

**Sorun:** Google Books ve Open Library veri kalitesi farklı olabilir.

**Mitigasyon:**

- Field priority system (hangi veri daha güvenilir)
- Validation: Google Books > Open Library for critical fields
- Fallback: Secondary source'tan al

### Risk 4: Performance Impact

**Sorun:** Merge işlemi search süresini uzatabilir.

**Mitigasyon:**

- O(n) complexity - linear time
- ISBN hashing ile hızlı lookup
- Parallel API calls zaten var, merge overhead minimal

---

## 📊 BAŞARI KRİTERLERİ

### Functional (Fonksiyonel)

- ✅ Google Books kitabının eksik alanları Open Library'den tamamlanır
- ✅ Open Library kitabının eksik alanları Google Books'tan tamamlanır
- ✅ ISBN-13 tabanlı matching başarılı
- ✅ Kategoriler merge edilir ve duplicate'lar kaldırılır
- ✅ Kapak resmi, pageCount gibi kritik alanlar enrichment ile tamamlanır

### Performance (Performans)

- ✅ Ek API çağrısı yapılmaz
- ✅ Search süresi mevcut süre ±200ms toleransında
- ✅ Merge işlemi O(n) complexity'de çalışır
- ✅ UI'da görünen sonuç sayısı artar (daha tam veri)

### Code Quality (Kod Kalitesi)

- ✅ Unit test coverage > 80%
- ✅ Integration testleri geçiyor
- ✅ JSDoc comments eklendi
- ✅ ESLint/Prettier uyumlu
- ✅ TypeScript tip güvenliği

### User Experience (Kullanıcı Deneyimi)

- ✅ Daha tam kitap verisi (kapak, kategori, sayfa sayısı)
- ✅ Daha az manuel veri girişi
- ✅ Arama sonuçları daha zengin görünümlü
- ✅ Duplicate sonuçlar azalır

---

## 🔄 İLERLEME PLANI

| Sprint       | Görevler                      | Süre   | Durum          |
| ------------ | ----------------------------- | ------ | -------------- |
| **Sprint 1** | BookMergeService.ts oluştur   | 2 saat | ⏳ Planlanıyor |
|              | Unit testleri yaz             | 1 saat | ⏳ Planlanıyor |
| **Sprint 2** | SearchEngine entegrasyonu     | 1 saat | ⏳ Planlanıyor |
|              | Integration testleri güncelle | 1 saat | ⏳ Planlanıyor |
| **Sprint 3** | Edge case handling            | 1 saat | ⏳ Planlanıyor |
|              | Kod review ve refactor        | 1 saat | ⏳ Planlanıyor |
| **Sprint 4** | Dokümantasyon                 | 1 saat | ⏳ Planlanıyor |
|              | Final QA testing              | 1 saat | ⏳ Planlanıyor |

---

## 📚 REFERANSLAR

### Kod Tabanı

- `services/SearchEngine.ts` - Mevcut arama mantığı
- `services/GoogleBooksService.ts` - Google Books API entegrasyonu
- `services/OpenLibraryService.ts` - Open Library API entegrasyonu
- `utils/isbnConverter.ts` - ISBN dönüştürme yardımcıları
- `utils/stringUtils.ts` - String normalization

### Best Practices

- [Google Books API v1 Documentation](https://developers.google.com/books/docs/v1/using)
- [Open Library API Documentation](https://openlibrary.org/dev/docs/api)
- [Audiobookshelf BookFinder Pattern](https://github.com/advplyr/audiobookshelf)
- [Readest Metadata Service](https://github.com/readest/readest)

---

## ✅ CHECKLIST (Plan Onayı)

- [x] Mevcut kod tabanı analizi yapıldı
- [x] API response yapıları anlaşıldı
- [x] Merge stratejisi belirlendi
- [x] Alan önceliklendirme tablosu hazır
- [x] Test stratejisi tanımlandı
- [x] Riskler ve mitigasyonlar belirlendi
- [x] Başarı kriterleri tanımlandı
- [x] İlerleme planı oluşturuldu
- [x] Referanslar belgelendi

---

**Plan Oluşturuldu:** 6 Ocak 2026
**Plan Sahibi:** AI Planner (Plan Mode)
**Durum:** 📋 İmzaya Hazır

---

## 🚀 SONRAKİ ADIMLAR

1. **Plan Onayı:** Bu planı gözden geçirin ve onaylayın
2. **Implementation:** `/start-work` komutunu çalıştırın
3. **Execution:** Planı takip ederek geliştirme yapın
4. **Review:** Kod review ve test
5. **Deploy:** Production'a deployment

---

**Not:** Bu plan READ-ONLY modunda oluşturulmuştur. İmplementasyon için `/start-work` komutunu çalıştırın.
