# PROJECT KNOWLEDGE BASE

**Generated:** 2025-01-06
**Project:** Ayraç (Kitaplık App)
**Stack:** Expo/React Native, TypeScript, Firebase, Google Books API

## OVERVIEW

Expo Router tabanlı kişisel kitap koleksiyonu yönetim uygulaması. Barkod tarama, öneri sistemi, kredi sistemi ve çoklu dil desteği.

## STRUCTURE

```
./
├── app/              # Expo Router sayfaları (9 .tsx)
├── components/       # Yeniden kullanılabilir UI bileşenleri (9 .tsx/.ts)
├── context/          # React Context - State management (6 .tsx)
├── services/         # API servisleri ve iş mantığı (8 .ts)
├── utils/            # Pure utility fonksiyonlar (6 .ts)
├── i18n/             # Çoklu dil desteği (TR/EN)
├── hooks/            # Custom React hooks
├── constants/        # Renkler, sabitler
├── assets/           # Görseller, ikonlar
└── GEMINIDOCS/       # Mimari ve teknik analiz dokümantasyonu
```

## WHERE TO LOOK

| Task                      | Location      | Notes                                               |
| ------------------------- | ------------- | --------------------------------------------------- |
| **Sayfalar / Navigasyon** | `app/`        | Expo Router, (tabs) grup yapısı                     |
| **UI Bileşenleri**        | `components/` | Modal'lar, kartlar, tarayıcı                        |
| **State Management**      | `context/`    | Auth, Books, Theme, Language, Credits, Notification |
| **API Entegrasyonu**      | `services/`   | GoogleBooks, OpenLibrary, Backup, Recommendation    |
| **Utility Fonksiyonlar**  | `utils/`      | ISBN dönüştürme, string işlemleri, error handling   |
| **Çeviri**                | `i18n/`       | react-i18next, tr/en locale'ler                     |
| **Yapılandırma**          | `./`          | package.json, app.json, tsconfig.json               |

## CODE MAP

**Key Types:**

- `Book` (BooksContext) - Kitap veri modeli
- `BookStatus` - "Okunacak" | "Okunuyor" | "Okundu"
- `GoogleBookResult` (GoogleBooksService) - API response

**Key Contexts:**

- `BooksContext` - Kitap CRUD operasyonları
- `AuthContext` - Yerel kimlik doğrulama (offline-first)
- `ThemeContext` - Dark/light mod
- `LanguageContext` - TR/EN dil değişimi
- `CreditsContext` - Kredi sistemi (öneriler için)
- `NotificationContext` - Bildirim yönetimi

**Key Services:**

- `GoogleBooksService` - Google Books API entegrasyonu
- `OpenLibraryService` - Fallback arama servisi
- `RecommendationService` - AI destekli öneriler
- `BackupService` - Veri yedekleme/geri yükleme
- `PriceService` - Fiyat karşılaştırma mağazaları

## CONVENTIONS

- **Türkçe dil desteği:** UI elementleri (butonlar, menüler) dil değişince güncellenir ama kitap adları/yazarlar orijinal dilde kalır
- **Path alias:** `@/*` → root dizin (tsconfig.json)
- **Test naming:** `__tests__` klasörleri, `*.test.ts/x` dosyaları
- **Context pattern:** Her Context kendi provider'ını ve hook'unu export eder
- **Component naming:** PascalCase, descriptive names (BookCard, BarcodeScannerModal)
- **Service pattern:** Object-based exports, async/await functions

## ANTI-PATTERNS (THIS PROJECT)

- **Firebase Auth DEPRECATED:** Yerel kimlik doğrulama kullan (AuthContext + AsyncStorage)
- **Kitleme operasyonları:** AsyncStorage operasyonları await ile handle edilmeli
- **Large components:** 500+ satır dosyalar refactoring adayı (add-book.tsx: 885, settings.tsx: 824)
- **Console.log:** Production build'de kaldır (babel-plugin-transform-remove-console konfigürasyonu var ama dikkatli kullan)

## UNIQUE STYLES

- **Splash screen sequence:** Native splash → AnimatedSplash → App (3 aşamalı)
- **Günlük kredi:** Uygulama açılışında otomatik +1 kredi claim
- **Barkod arama stratejisi:** Google Books (intitle/inauthor) → General search → OpenLibrary fallback
- **Kredi sistemi:** Başlangıç 10 kredi, öneri başına -1, reklam başına +5
- **Multi-modal book entry:** Barkod tarama, Google Books arama, manuel giriş

## COMMANDS

```bash
npm run dev          # Expo geliştirme sunucusu (EXPO_NO_TELEMETRY=1)
npm run lint         # ESLint kontrolü
npm run build:web    # Web export
npm test             # Jest test çalıştırma
npm run android      # Android build
npm run ios          # iOS build
npx tsc --noEmit     # TypeScript tip kontrolü (değişiklik sonrası)
```

## NOTES

- **App name:** Ayraç (slug: ayrac, package: com.kitaplik.app)
- **Offline-first:** Tüm veriler AsyncStorage'da, network yoksa da çalışır
- **Firebase:** Analytics, Crashlytics, Performance monitoring (kullanıcı verisi DEĞİL)
- **Google Books API rate limit:** Çok hızlı aramalar için throttling gerekli
- **Kitap adları dil değişince DEĞİŞMELİ:** Veritabanında orijinal dilde saklanır
- **Barkod bulunamayan kitaplar:** Manuel giriş sekmesiyle ekle (bazı kitaplar dijital veritabanlarında yok)
