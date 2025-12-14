# Proje Yapısı ve Dokümantasyon İndeksi

Bu belge, `/sg:index` komutu ile güncellenmiş proje yapı analizini içerir.

## 🏗️ Dizin Yapısı Analizi

### `app/`

Expo Router tabanlı navigasyon yapısı.

* `_layout.tsx`: Uygulamanın kök düzeni. Provider'ları (Auth, Theme, Books, Credits, Language) sarar.
* `(tabs)/`: Sekmeli navigasyon grubu.
  * `index.tsx`: Ana Sayfa (Dashboard).
  * `books.tsx`: Kitap listeleme ekranı.
  * `settings.tsx`: Ayarlar ekranı.
* `add-book.tsx`: Kitap ekleme modalı/ekranı.
* `book-detail.tsx`: Kitap detay görünümü.
* `scraper-test.tsx`: Fiyat kazıma (scraping) test ekranı.

### `components/`

UI Bileşenleri.

* `BarcodeScannerModal.tsx`: Kamera erişimi ile barkod tarama bileşeni.
* `BookCard.tsx`: Kitap listeleme kartı bileşeni.
* `FilterDropdown.tsx`: Listeleme filtreleme aracı.
* `PriceComparisonModal.tsx`: Kitap fiyat karşılaştırma modalı.
* `ProfileModal.tsx`: Kullanıcı profil detayları.
* `RecommendationModal.tsx`: Kitap önerilerini gösteren modal.

### `services/`

İş mantığı ve Veri erişimi.

* `BackupService.ts`: Veri yedekleme ve geri yükleme işlemleri.
* `BookPriceScraperService.ts`: Kitap fiyatlarını dış kaynaklardan çekme servisi.
* `GoogleBooksService.ts`: Google Books API ile kitap arama ve detay çekme.
* `PriceService.ts`: Fiyat karşılaştırma ve yönetimi.
* `RecommendationService.ts`: Kitap öneri algoritması.
* `ScraperTestService.ts`: Kazıma işlemleri için test servisi.
* `FirestoreService.ts`: *(Mevcutsa)* Firebase Firestore işlemleri.

### `context/`

State Yönetimi.

* `AuthContext.tsx`: Oturum yönetimi.
* `BooksContext.tsx`: Kitap verilerinin global state'i.
* `CreditsContext.tsx`: Kredi sistemi yönetimi (Reklam izleme vb.).
* `LanguageContext.tsx`: Çoklu dil desteği yönetimi.
* `ThemeContext.tsx`: Tema (Dark/Light) yönetimi.

## 🔗 Entegrasyonlar

* **Google Books**: `GoogleBooksService.ts` içinde kullanılır.
* **Kamera**: `expo-camera` paketi `BarcodeScannerModal.tsx` içinde kullanılır.
* **Reklamlar**: `react-native-google-mobile-ads` paketi kredi kazanımı için kullanılır.
* **Dil**: `i18next` ve `react-i18next` paketi `LanguageContext` ve `i18n` klasöründe kullanılır.