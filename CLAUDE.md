# Kitaplık App

## What

Expo/React Native tabanlı kişisel kitap koleksiyonu yönetim uygulaması.

**Stack:** TypeScript, Expo Router, Firebase (Auth/Firestore), Google Books API, Lucide Icons

**Yapı:**

- `app/` - Expo Router sayfaları ve navigasyon
- `components/` - Yeniden kullanılabilir UI bileşenleri
- `context/` - React Context (Auth, Theme, Books, Language)
- `services/` - API ve backend servisleri
- `i18n/` - Çoklu dil desteği (TR/EN)

## Why

Kullanıcıların kitaplarını kataloglaması, barkod ile hızlı ekleme yapması, okuma alışkanlıklarını takip etmesi ve kitap önerileri alması.

## How

**Geliştirme:**

```bash
npm run dev          # Expo geliştirme sunucusu
npm run lint         # ESLint kontrolü
npm run build:web    # Web export
```

**Doğrulama:** Değişikliklerden sonra TypeScript hatalarını kontrol et (`npx tsc --noEmit`).

**Detaylı Dokümantasyon:**

- `GEMINIDOCS/` - Mimari ve teknik analiz
- `GELISTIRME_PLANI.md` - Aktif geliştirme planı
- `knowledge_base.md` dosyaları - Sayfa bazlı geliştirme notları

**Kurallar:**

- Türkçe yanıt ver
- Değişikliklerden sonra test et
- `scratchpad.md` dosyasını güncel tut
