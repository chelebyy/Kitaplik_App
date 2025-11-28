# Kitaplık App - Dokümantasyon İndeksi

Bu proje, **Kitaplık App** uygulamasının teknik dokümantasyonunu içerir. Aşağıdaki bağlantılar ve özetler, projenin mimarisi, bileşenleri ve veri akışı hakkında detaylı bilgi sağlar.

## 📚 Dokümantasyon Haritası

| Belge | Açıklama |
|-------|----------|
| **[README.md](../README.md)** | Proje genel bakışı, kurulum adımları ve hızlı başlangıç. |
| **[STRUCTURE.md](./STRUCTURE.md)** | Dosya ve klasör yapısının detaylı teknik analizi. |
| **[GEMINI.md](../GEMINI.md)** | Yapay zeka asistanı (Gemini) için bağlam ve kurallar. |
| **[GELISTIRME_PLANI.md](../GELISTIRME_PLANI.md)** | Dil desteği ve Fiyat karşılaştırma gibi planlanan özellikler. |

## 🏗️ Mimari Genel Bakış

Uygulama, **Expo (React Native)** üzerinde geliştirilmiştir ve **Expo Router** ile dosya tabanlı yönlendirme kullanır.

### Temel Katmanlar

1.  **Sunum Katmanı (UI)**: `app/` altındaki ekranlar ve `components/` altındaki yeniden kullanılabilir bileşenler.
2.  **Durum Yönetimi (State)**: `context/` altında React Context API (`BooksContext`, `AuthContext`, `ThemeContext`).
3.  **Servis Katmanı**: `services/` altında dış API entegrasyonları (Google Books) ve veritabanı soyutlamaları.
4.  **Veri Kalıcılığı**: `AsyncStorage` kullanılarak yerel veri saklama.

## 🧩 Temel Bileşenler

### Ekranlar (`app/`)
*   **`(tabs)/index.tsx`**: Ana Sayfa. Okunuyor/Okunacak özetleri.
*   **`(tabs)/books.tsx`**: Kitap listesi. Arama ve filtreleme özellikleri.
*   **`add-book.tsx`**: Yeni kitap ekleme modalı (Barkod veya Manuel).
*   **`book-detail.tsx`**: Kitap detay sayfası. Durum ve not güncelleme.

### Servisler (`services/`)
*   **`GoogleBooksService.ts`**: ISBN veya başlık ile kitap arama.
*   **`RecommendationService.ts`**: Kullanıcı kitaplarına göre öneri algoritması.

### Veri Akışı (`BooksContext`)
Kitap verileri global olarak yönetilir.
*   **Ekleme**: `addBook` fonksiyonu yeni kitap objesi oluşturur.
*   **Güncelleme**: `updateBookStatus`, `updateBookProgress` fonksiyonları durumu değiştirir.
*   **Saklama**: Değişiklikler otomatik olarak `AsyncStorage`'a (`books_data` anahtarı ile) yazılır.

## 🛠️ Geliştirme Rehberi

### Kurulum
```bash
npm install
npx expo start
```

### Linting
Kod kalitesini korumak için:
```bash
npm run lint
```

### Yapılacaklar (Geliştirme Planı)
*   [x] Temel Kitap Ekleme/Listeleme
*   [x] Barkod Okuma
*   [ ] Gelişmiş Filtreleme Seçenekleri
*   [ ] Cloud Yedekleme (Firebase Tam Entegrasyonu)

---
*Son Güncelleme: 28 Kasım 2025*
