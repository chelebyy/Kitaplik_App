# Kitaplık App - Dokümantasyon İndeksi

Bu proje, **Kitaplık App** uygulamasının teknik dokümantasyonunu içerir. Aşağıdaki bağlantılar ve özetler, projenin mimarisi, bileşenleri ve veri akışı hakkında detaylı bilgi sağlar.

## 📚 Dokümantasyon Haritası

| Belge | Açıklama |
|-------|----------|
| **[README.md](../README.md)** | Proje genel bakışı, kurulum adımları ve hızlı başlangıç. |
| **[STRUCTURE.md](./STRUCTURE.md)** | Dosya ve klasör yapısının detaylı teknik analizi. |
| **[GEMINI.md](../GEMINI.md)** | Yapay zeka asistanı (Gemini) için bağlam ve kurallar. |
| **[GELISTIRME_PLANI.md](../GELISTIRME_PLANI.md)** | Dil desteği ve Fiyat karşılaştırma gibi planlanan özellikler. |
| **[FUTURE_ROADMAP.md](../FUTURE_ROADMAP.md)** | Uzun vadeli özellik planları (AI Chat, İstatistikler vb.). |

## 🏗️ Mimari Genel Bakış

Uygulama, **Expo (React Native)** üzerinde geliştirilmiştir ve **Expo Router** ile dosya tabanlı yönlendirme kullanır. Çevrimdışı öncelikli (offline-first) bir yaklaşım benimsenmiştir.

### Temel Katmanlar

1.  **Sunum Katmanı (UI)**: `app/` altındaki ekranlar ve `components/` altındaki yeniden kullanılabilir bileşenler (`BookCard`, `RecommendationModal` vb.).
2.  **Durum Yönetimi (State)**: `context/` altında React Context API:
    *   `BooksContext`: Kitap verileri.
    *   `AuthContext`: Kullanıcı oturumu.
    *   `ThemeContext`: Tema (Koyu/Açık).
    *   `CreditsContext`: Kredi ve ödül sistemi.
    *   `LanguageContext`: Dil yönetimi.
3.  **Servis Katmanı**: `services/` altında iş mantığı:
    *   `GoogleBooksService`: Kitap arama.
    *   `PriceService`: Fiyat karşılaştırma.
    *   `BackupService`: Veri yedekleme.
4.  **Veri Kalıcılığı**: `AsyncStorage` kullanılarak yerel veri saklama.

## 🧩 Temel Bileşenler

### Ekranlar (`app/`)
*   **`(tabs)/index.tsx`**: Ana Sayfa. İstatistikler ve kısayollar.
*   **`(tabs)/books.tsx`**: Kitap listesi. Gelişmiş filtreleme ve sıralama.
*   **`add-book.tsx`**: Yeni kitap ekleme (Barkod, Arama, Manuel).
*   **`book-detail.tsx`**: Kitap detayları, düzenleme ve notlar.
*   **`scraper-test.tsx`**: Fiyat çekme servislerini test etme ekranı.

### Servisler (`services/`)
*   **`BookPriceScraperService.ts`**: Kitap sitelerinden fiyat bilgisi çeker.
*   **`RecommendationService.ts`**: Kütüphane analizi veya dış kaynaklı öneriler sunar.

### Veri Akışı
Tüm veri değişiklikleri (Ekleme, Silme, Güncelleme) `BooksContext` üzerinden yönetilir ve `AsyncStorage`'a anlık olarak yansıtılır. `CreditsContext`, reklam izleme karşılığı kazanılan kredileri yönetir ve `AsyncStorage` üzerinde saklar.

## 🛠️ Geliştirme Rehberi

### Kurulum
```bash
npm install
npx expo start
```

### Önemli Komutlar
*   `npm run lint`: Kod standartlarını kontrol et.
*   `npx expo start --clear`: Cache temizleyerek başlat.

### Yapılacaklar (Geliştirme Durumu)
*   [x] Temel Kitap Yönetimi
*   [x] Barkod Okuma Entegrasyonu
*   [x] Çoklu Dil Desteği (`i18n`)
*   [x] Kredi ve Reklam Sistemi
*   [ ] Fiyat Karşılaştırma (Geliştirme Aşamasında)
*   [ ] AI Asistanı (Planlandı)

---
*Son Güncelleme: 14 Aralık 2025*