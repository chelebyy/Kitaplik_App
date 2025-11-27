# Proje Yapısı ve Dokümantasyon İndeksi

Bu belge, `/sg:index` komutu ile otomatik olarak oluşturulmuş proje yapı analizini içerir.

## 🏗️ Dizin Yapısı Analizi

### `app/`
Expo Router tabanlı navigasyon yapısı.
*   `_layout.tsx`: Uygulamanın kök düzeni. Provider'ları (Auth, Theme, Books) sarar.
*   `(tabs)/`: Sekmeli navigasyon grubu.
    *   `index.tsx`: Ana Sayfa (Dashboard).
    *   `books.tsx`: Kitap listeleme ekranı.
    *   `settings.tsx`: Ayarlar ekranı.
*   `add-book.tsx`: Kitap ekleme modalı/ekranı.
*   `book-detail.tsx`: Kitap detay görünümü.

### `components/`
UI Bileşenleri.
*   `BarcodeScannerModal.tsx`: Kamera erişimi ile barkod tarama bileşeni.
*   `FilterDropdown.tsx`: Listeleme filtreleme aracı.
*   `RecommendationModal.tsx`: Kitap önerilerini gösteren modal.
*   `ProfileModal.tsx`: Kullanıcı profil detayları.

### `services/`
İş mantığı ve Veri erişimi.
*   `FirestoreService.ts`: Firebase Firestore veritabanı işlemleri (CRUD).
*   `RecommendationService.ts`: Kitap öneri algoritması ve Google Books API entegrasyonu.

### `context/`
State Yönetimi.
*   `AuthContext.tsx`: Oturum yönetimi.
*   `ThemeContext.tsx`: Tema (Dark/Light) yönetimi.
*   `BooksContext.tsx`: Kitap verilerinin global state'i.

## 🔗 Entegrasyonlar

*   **Firebase**: `config/firebaseConfig.ts` üzerinden başlatılır.
*   **Google Books**: `RecommendationService.ts` içinde kullanılır.
*   **Kamera**: `expo-camera` paketi `BarcodeScannerModal.tsx` içinde kullanılır.
