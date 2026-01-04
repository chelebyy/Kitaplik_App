# Faz 2: Paralel API Arama - Gelecek İyileştirme Planı

## 📋 Genel Bakış

**Durum:** Planlama aşamasında (Faz 1 tamamlandı)  
**Tahmini Süre:** 4-5 saat  
**Öncelik:** Orta (Faz 1 ile %80-85 başarı oranına ulaştık)  
**Beklenen İyileştirme:** %85-90 başarı oranı + daha hızlı yanıt

---

## 🎯 Hedef

Google Books ve Open Library API'lerini **paralel** olarak aramak, hangisi önce sonuç döndürürse onu kullanmak.

**Avantajlar:**

- ⚡ Daha hızlı sonuç (iki API aynı anda çalışır)
- 📊 Daha yüksek başarı oranı
- 🔄 Gelişmiş kullanıcı deneyimi ("2 kaynakta bulundu")

---

## 🏗️ Mimari Tasarım

### Mevcut Durum (Faz 1 - Sıralı/Fallback)

```
Google ISBN-10 → Google ISBN-13 → Open Library ISBN-10 → Open Library ISBN-13
    ↓ FAIL         ↓ FAIL             ↓ FAIL                ↓ FAIL
   Sonraki        Sonraki            Sonraki              NULL
```

### Hedef Durum (Faz 2 - Paralel)

```
         ┌─────────────┐
         │ User Scans  │
         │   Barcode   │
         └──────┬──────┘
                │
        ┌───────┴────────┐
        │                │
  ┌─────▼─────┐   ┌─────▼─────┐
  │  Google   │   │   Open    │
  │  Books    │   │  Library  │
  │  API      │   │   API     │
  └─────┬─────┘   └─────┬─────┘
        │                │
        └───────┬────────┘
                │
         ┌──────▼──────┐
         │ First Match │
         │   or Both   │
         └─────────────┘
```

---

## 💻 Teknik İmplementasyon

### 1. Yeni Servis Katmanı Oluştur

**Dosya:** `services/MultiSourceBookService.ts`

```typescript
import { GoogleBooksService, GoogleBookResult } from "./GoogleBooksService";
import { OpenLibraryService } from "./OpenLibraryService";
import {
  normalizeISBN,
  convertISBN10ToISBN13,
  convertISBN13ToISBN10,
} from "../utils/isbnConverter";

interface BookSearchResult {
  book: GoogleBookResult;
  source: "google" | "openlibrary";
  searchTime: number; // milliseconds
}

export const MultiSourceBookService = {
  /**
   * Search for a book using multiple sources in parallel
   * Returns the first successful result or aggregates all results
   */
  searchByIsbnParallel: async (
    isbn: string,
    lang: string = "tr",
  ): Promise<BookSearchResult | null> => {
    const normalized = normalizeISBN(isbn);
    const isISBN10 = normalized.length === 10;
    const convertedISBN = isISBN10
      ? convertISBN10ToISBN13(normalized)
      : convertISBN13ToISBN10(normalized);

    // Create array of all search promises
    const searches: Promise<BookSearchResult | null>[] = [
      searchWithSource("google", normalized, lang),
    ];

    // Add converted format search for Google
    if (convertedISBN) {
      searches.push(searchWithSource("google", convertedISBN, lang));
    }

    // Add Open Library searches
    searches.push(searchOpenLibrary(normalized));
    if (convertedISBN) {
      searches.push(searchOpenLibrary(convertedISBN));
    }

    // Race: Return first successful result
    return Promise.race(
      searches.map((p) =>
        p.then((result) => {
          if (result) return result;
          return new Promise(() => {}); // Never resolve if null
        }),
      ),
    ).catch(() => null);
  },

  /**
   * Search all sources and return all results
   * Useful for showing user "Found in 2 sources"
   */
  searchByIsbnAll: async (
    isbn: string,
    lang: string = "tr",
  ): Promise<BookSearchResult[]> => {
    const normalized = normalizeISBN(isbn);
    const isISBN10 = normalized.length === 10;
    const convertedISBN = isISBN10
      ? convertISBN10ToISBN13(normalized)
      : convertISBN13ToISBN10(normalized);

    const searches: Promise<BookSearchResult | null>[] = [
      searchWithSource("google", normalized, lang),
    ];

    if (convertedISBN) {
      searches.push(searchWithSource("google", convertedISBN, lang));
    }

    searches.push(searchOpenLibrary(normalized));
    if (convertedISBN) {
      searches.push(searchOpenLibrary(convertedISBN));
    }

    // Wait for all, filter out nulls
    const results = await Promise.all(searches);
    return results.filter((r): r is BookSearchResult => r !== null);
  },
};

async function searchWithSource(
  source: "google",
  isbn: string,
  lang: string,
): Promise<BookSearchResult | null> {
  const startTime = Date.now();
  try {
    const result = await GoogleBooksService.searchByIsbn(isbn, lang);
    if (result) {
      return {
        book: result,
        source: "google",
        searchTime: Date.now() - startTime,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function searchOpenLibrary(
  isbn: string,
): Promise<BookSearchResult | null> {
  const startTime = Date.now();
  try {
    const result = await OpenLibraryService.searchByIsbn(isbn);
    if (result) {
      return {
        book: OpenLibraryService.toGoogleBookFormat(result),
        source: "openlibrary",
        searchTime: Date.now() - startTime,
      };
    }
    return null;
  } catch {
    return null;
  }
}
```

---

### 2. UI Değişiklikleri

**Dosya:** `app/add-book.tsx`

```tsx
// Yeni state ekle
const [bookSources, setBookSources] = useState<string[]>([]);

// handleBarcodeScanned fonksiyonunu güncelle
const handleBarcodeScanned = async (isbn: string) => {
  setIsLoading(true);
  try {
    // Paralel arama yap
    const result = await MultiSourceBookService.searchByIsbnParallel(
      isbn,
      i18n.language?.split("-")[0],
    );

    if (result) {
      selectBook(result.book);

      // Kaynağı kaydet
      setBookSources([result.source]);

      Alert.alert(
        t("add_book_success"),
        `${t("add_book_success_msg")} (Kaynak: ${result.source === "google" ? "Google Books" : "Open Library"})`,
      );
    } else {
      Alert.alert(t("add_book_not_found"), t("add_book_not_found_msg"));
    }
  } catch {
    Alert.alert(t("settings_restore_error"), t("settings_restore_error_msg"));
  } finally {
    setIsLoading(false);
  }
};
```

---

### 3. Gelişmiş Özellikler (Opsiyonel)

#### A. Kaynak Tercih Sistemi

Kullanıcı hangi kaynağı tercih ettiğini ayarlarda seçebilir:

- **Hız:** İlk dönen sonuç
- **Google Books öncelikli:** Önce Google, sonra Open Library
- **Open Library öncelikli:** Önce Open Library, sonra Google

#### B. Sonuç Karşılaştırma UI

```tsx
<View>
  <Text>Bu kitap 2 kaynakta bulundu:</Text>
  <Button onPress={() => showSource("google")}>Google Books</Button>
  <Button onPress={() => showSource("openlibrary")}>Open Library</Button>
</View>
```

#### C. Analytics

Hangi kaynaktan kaç kitap bulunduğunu logla:

```typescript
analytics().logEvent("book_found", {
  source: result.source,
  searchTime: result.searchTime,
  isbn: isbn,
});
```

---

## 📊 Beklenen Metrikler

### Performans

- **Ortalama Arama Süresi:** 500-800ms (şu an 1-2 saniye)
- **Başarı Oranı:** %85-90 (şu an %80-85)

### API Kullanımı

- **Google Books API:** Günlük 1000 istek (ücretsiz limit)
- **Open Library API:** Günlük 500 istek (ücretsiz limit)
- **Rate Limiting:** Her API için retry logic ekle

---

## ⚠️ Riskler ve Çözümler

### Risk 1: Rate Limiting

**Çözüm:**

- Request caching ekle (aynı ISBN 5 dakika cache)
- Exponential backoff retry stratejisi

### Risk 2: API Hatası

**Çözüm:**

- Graceful degradation (bir API çökerse diğeri çalışır)
- Error boundary ekle

### Risk 3: Karmaşık Error Handling

**Çözüm:**

- Promise.allSettled kullan (tüm sonuçları topla)
- Detaylı error logging

---

## 🧪 Test Planı

### Unit Tests

- [ ] `MultiSourceBookService.searchByIsbnParallel()` test
- [ ] `MultiSourceBookService.searchByIsbnAll()` test
- [ ] ISBN dönüşüm kombinasyonları
- [ ] Error handling scenarios

### Integration Tests

- [ ] Mock API responses
- [ ] Network failure scenarios
- [ ] Timeout handling

### E2E Tests

- [ ] Gerçek barkod tarama
- [ ] Her iki kaynaktan sonuç dönme
- [ ] Sadece bir kaynaktan sonuç

---

## 📅 Uygulama Takvimi (Tahmini)

### Gün 1 (2-3 saat)

- [ ] `MultiSourceBookService.ts` oluştur
- [ ] Unit testler yaz
- [ ] Basic paralel arama implement et

### Gün 2 (2 saat)

- [ ] UI değişiklikleri
- [ ] Kaynak göstergesi ekle
- [ ] Error handling iyileştir

---

## ✅ Tamamlanma Kriterleri

- [ ] Paralel arama çalışıyor
- [ ] UI'da kaynak bilgisi gösteriliyor
- [ ] Testler yazıldı ve geçti
- [ ] Performans iyileştirmesi kanıtlandı
- [ ] Error handling test edildi
- [ ] Dokümantasyon güncellendi

---

## 🚀 Aktif Etme Adımları (Gelecekte)

```bash
# 1. Branch oluştur
git checkout -b feature/parallel-api-search

# 2. Kodu implement et
# ... (yukarıdaki adımları takip et)

# 3. Test et
npm test
npx expo run:android

# 4. Merge et
git checkout main
git merge feature/parallel-api-search
```

---

**Son Güncelleme:** 2026-01-01  
**Durum:** Planlandı - Faz 1 tamamlandı, Faz 2 bekliyor  
**Öncelik:** İsteğe bağlı (Şu an %80-85 başarı oranı yeterli)
