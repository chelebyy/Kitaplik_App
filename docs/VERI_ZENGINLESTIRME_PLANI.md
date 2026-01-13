# Akıllı Veri Zenginleştirme (Smart Enrichment) Analiz Raporu

## 1. Mevcut Durum Analizi

Şu anki altyapıda (`SearchEngine.ts` ve servisler):

- **Google Books API** ve **Open Library API** sorguları paralel olarak veya sırasıyla çalıştırılıyor.
- Sonuçlar genellikle "ya o, ya bu" mantığıyla veya basit bir birleştirme ile kullanıcıya sunuluyor.
- **Sorun:** Aynı kitap (örn: "Sefiller" - ISBN: 978975... ) her iki servisten de dönüyor olabilir. Google'da kapak resmi kaliteliyken sayfa sayısı eksik olabilir; Open Library'de kapak yoktur ama sayfa sayısı ve kategoriler tamdır. Şu anki sistemde kullanıcı ya eksik Google kaydını ya da kapaksız Open Library kaydını görüyor.

## 2. Teknik Strateji: "ISBN Tabanlı Füzyon"

Ek API çağrısı yapmadan bu sorunu çözmenin yolu **Post-Process Merging** (Sorgu Sonrası Birleştirme) tekniğidir.

### Algoritma Akışı

1.  **Paralel Sorgu:** Kullanıcı arama yaptığında `Promise.all` ile hem Google hem Open Library aranır.
2.  **Normalizasyon:** Dönen tüm kitapların ISBN'leri (varsa) standart bir formata (ISBN-13) çevrilir.
3.  **Eşleştirme (Mapping):**
    - Google sonuçları bir `Map<ISBN, Book>` içine alınır.
    - Open Library sonuçları döngüye sokulur.
4.  **Zenginleştirme (Enrichment Logic):**
    - Eğer Open Library'den gelen bir kitabın ISBN'i Google Map'inde varsa → **BİRLEŞTİR**.
    - Yoksa → Listeye yeni eleman olarak ekle.

### Birleştirme Kuralları (Priority Rules)

Veri çakışması durumunda hangi kaynağın baskın olacağı şöyledir:

| Alan             | Birincil Kaynak | Yedek Kaynak | Neden?                                             |
| :--------------- | :-------------- | :----------- | :------------------------------------------------- |
| **Başlık/Yazar** | Google Books    | Open Library | Google genelde daha temiz başlık formatına sahip.  |
| **Kapak Resmi**  | Google Books    | Open Library | Google kapakları genelde daha yüksek çözünürlüklü. |
| **Sayfa Sayısı** | _Dolu Olan_     | _Dolu Olan_  | Hangisi `0` veya `null` değilse o alınır.          |
| **Kategoriler**  | _Dolu Olan_     | _Dolu Olan_  | Kategori bilgisi genelde birinde eksiktir.         |
| **Özet (Desc)**  | Google Books    | Open Library | Google özetleri daha detaylı olma eğiliminde.      |

## 3. Uygulama Planı

Bu özelliği `SearchEngine.ts` içerisine, mevcut mimariyi bozmadan entegre edeceğiz.

### Adım 1: Yardımcı Fonksiyonlar (`utils/bookMerge.ts`)

Yeni bir utility dosyası oluşturulacak. Bu dosya, iki `Book` objesini alıp tek bir `Book` objesi döndüren `mergeBooks(primary: Book, secondary: Book): Book` fonksiyonunu barındıracak.

### Adım 2: ISBN Normalizasyonu

`utils/isbnConverter.ts` dosyasındaki fonksiyonlar kullanılarak, karşılaştırma öncesi tüm ISBN'lerin 13 haneli formata çevrildiğinden emin olunacak.

### Adım 3: SearchEngine Refactoring

`SearchEngine.ts` içindeki `search` metodunun akışı güncellenecek.

### Adım 4: Test ve Doğrulama

- **Senaryo 1:** Sadece Google'da olan kitap (Değişiklik olmamalı).
- **Senaryo 2:** Sadece OL'de olan kitap (Listeye eklenmeli).
- **Senaryo 3:** Her ikisinde de olan eksik kitap (Örn: Google'da sayfa sayısı yok, OL'den gelmeli).

## 4. Avantajlar

1.  **Sıfır Ek Maliyet:** Halihazırda yapılan sorguların sonuçları kullanıldığı için ekstra HTTP isteği atılmaz, uygulama yavaşlamaz.
2.  **Daha Kaliteli Veri:** Kullanıcılar "Sayfa sayısı: Bilinmiyor" yazısını daha az görür.
3.  **Kullanıcı Deneyimi:** Listede mükerrer (duplicate) kitaplar görünmesi engellenir.

## 5. Mevcut Implementasyon Durumu

Bu planda öngörülen özelliklerin çoğu **tamamlanmış ve production'da kullanımda**.

### ✅ Tamamlanan Özellikler

| Özellik                    | Dosya                                         | Satır Sayısı | Durum    |
| -------------------------- | --------------------------------------------- | ------------ | -------- |
| **BookMergeService**       | `services/BookMergeService.ts`                | 235 satır    | ✅ Aktif |
| **mergeIsbnResults()**     | `services/BookMergeService.ts`                | -            | ✅ Aktif |
| **searchByIsbnEnriched()** | `services/SearchEngine.ts`                    | -            | ✅ Aktif |
| **Relevance Scoring**      | `services/BookMergeService.ts`                | -            | ✅ Aktif |
| **AbortSignal Desteği**    | `services/SearchEngine.ts`                    | -            | ✅ Aktif |
| **Test Suite**             | `services/__tests__/BookMergeService.test.ts` | 589 satır    | ✅ Aktif |

### Kullanım Örnekleri

```typescript
// ISBN ile zenginleştirilmiş arama (en yaygın kullanım)
const results = await SearchEngine.searchByIsbnEnriched(
  "9786053609421", // ISBN-13
  "tr", // Kullanıcı dili
  { signal }, // AbortSignal (isteğe bağlı)
);

// Metin araması + otomatik merge
const books = await SearchEngine.search(
  "Sefiller",
  "tr",
  "book", // "book" | "isbn" | "all"
);

// Manuel merge işlemi
const merged = BookMergeService.mergeIsbnResults(
  googleBooksResults,
  openLibraryResults,
  "tr",
);
```

### Mevcut Mimarisi

```
SearchEngine.ts
├── search()                    // Genel arama girişi
│   ├── ISBN tespiti
│   ├── searchByIsbnEnriched()  // ISBN özel akış
│   └── searchByText()          // Metin araması
├── searchByIsdnEnriched()      // Paralel API + Merge
│   ├── GoogleBooksService.searchByIsbn()
│   ├── OpenLibraryService.searchByIsbn()
│   └── BookMergeService.mergeIsbnResults()
└── SearchEngine.test.ts        // Testler

BookMergeService.ts
├── mergeIsbnResults()          // ISBN tabanlı füzyon
├── mergeBooks()                // İki kitap objesi birleştirme
├── normalizeIsbn()             // ISBN-13 normalizasyonu
├── calculateRelevanceScore()   // Alaka scoring
└── Title+Author fallback matching
```

### Scoring Sistemi

`calculateRelevanceScore()` fonksiyonu sonuçları şu kriterlere göre puanlar:

| Kriter                 | Puan | Açıklama                                  |
| ---------------------- | ---- | ----------------------------------------- |
| **Kapak resmi var**    | +20  | Görsel olan kitaplar öncelikli            |
| **Başlık tam eşleşme** | +30  | Arama terimi başlıkla birebir eşleşirse   |
| **Dil uyumu**          | +15  | Kullanıcının diliyle kitap dili uyumluysa |
| **Sayfa sayısı**       | +5   | Metadata tam ise ek puan                  |

### Dosya Yolları

| Dosya                  | Konum                                         | Açıklama                 |
| ---------------------- | --------------------------------------------- | ------------------------ |
| **SearchEngine**       | `services/SearchEngine.ts`                    | Ana arama servisi        |
| **BookMergeService**   | `services/BookMergeService.ts`                | Merge mantığı ve scoring |
| **GoogleBooksService** | `services/GoogleBooksService.ts`              | Google Books API         |
| **OpenLibraryService** | `services/OpenLibraryService.ts`              | Open Library API         |
| **Testler**            | `services/__tests__/BookMergeService.test.ts` | Merge servis testleri    |

### Kalan Geliştirme Alanları

1. **Cache Katmanı:** Aynı ISBN için tekrar arama yapmayı önleyecek lokal cache
2. **Hata Yönetimi:** API fail durumunda daha detaylı fallback stratejileri
3. **Performans:** Büyük sonuç setleri için pagination desteği
