# 🏗️ Mimari Karar: Offline Veri Saklama ve Performans

## 🎯 Amaç

Kullanıcının internet bağlantısı olmadığında (Offline) kitaplığına erişebilmesi ve kendi kitapları arasında arama yapabilmesi.

---

## 🏎️ Seçenekler ve Kıyaslama

### 1. AsyncStorage (Mevcut Durum)

* **Teknoloji:** Basit JSON dosyası.
* **Avantajı:** Kurulum gerektirmez, %100 Expo uyumlu.
* **Dezavantajı:** Yavaş okuma/yazma (Disk I/O).
* **Kapasite:** ~1.000 kitaba kadar sorunsuz.

### 2. React Native MMKV (Önerilen - Orta Vade) 🚀

* **Teknoloji:** C++ ile yazılmış hafıza haritalama (Memory Mapping).
* **Avantajı:** AsyncStorage'dan **30 kat daha hızlı**.
* **Dezavantajı:** Basit kurulum gerektirir.
* **Kapasite:** ~10.000 kitaba kadar mükemmel performans.

### 3. Expo SQLite / Drizzle ORM (Uzun Vade) 🗄️

* **Teknoloji:** İlişkisel Veritabanı (SQL).
* **Avantajı:** 100.000+ kitapta bile arama hızlıdır. RAM tüketmez.
* **Dezavantajı:** Kurulumu ve kodlaması karmaşıktır (Tablolar, Migration'lar).
* **Kapasite:** Sınırsız (Disk boyutu kadar).

---

## 📊 Performans Senaryoları

| Kitap Sayısı | AsyncStorage | MMKV | SQLite | Yorum |
| :--- | :--- | :--- | :--- | :--- |
| **100** | ⚡ Hızlı | ⚡ Hızlı | 😐 Nötr | Fark hissedilmez. |
| **1.000** | ⚠️ Hafif Takılma (Kaydederken) | ⚡ Hızlı | ⚡ Hızlı | MMKV burada parlar. |
| **10.000** | 🐢 Yavaş (Açılışta bekletir) | ✅ Stabil | ⚡ Hızlı | AsyncStorage limiti. |
| **50.000+** | ❌ ÇÖKER (RAM yetmez) | ⚠️ RAM Şişer | ⚡ Hızlı | Artık veritabanı şart. |

---

## 🗺️ Yol Haritası Önerisi

1. **Faz 1 (Şimdi):** `AsyncStorage` ile devam.
    * Mevcut kitap sayısı (10-200) için fazlasıyla yeterli.
    * Offline arama RAM üzerinden (Context API) anlık çalışır.
2. **Faz 2 (Optimizasyon):** `react-native-mmkv`'ye geçiş.
    * Kullanıcı sayısı arttığında veya kitap ekleme yavaşlarsa.
    * Kod yapısını bozmadan sadece "Depolama Motorunu" değiştiririz.
3. **Faz 3 (Enterprise):** `Drizzle ORM + SQLite`.
    * Eğer uygulama "Tüm Türkiye'deki kitapları ara" gibi devasa bir veri setini offline indirmeyi hedeflerse.

## 💡 Sonuç

Şu anki projemiz **Kişisel Kütüphane** odaklı olduğu için (bir insan ömründe ortalama 1000-2000 kitap okur), **MMKV** bizim için nihai ve en performanslı çözüm olacaktır. SQL karmaşasına girmeye gerek yoktur.

---

## 🏗️ Storage Abstraction Layer (Soyutlama Katmanı)

### Neden Gerekli?

Şu an 4 context dosyasında toplam **14+ doğrudan AsyncStorage çağrısı** var. MMKV, Supabase veya Firebase'e geçmek istediğinizde tüm bu dosyaları tek tek değiştirmeniz gerekir.

**Soyutlama ile:** Tek bir `StorageService` oluşturulur. Tüm context'ler bu servisi kullanır. İleride sadece adapter değiştirilerek geçiş yapılır.

### Mimari

```
Context Layer (Books, Credits, Notification, Language)
                    │
                    ▼
            IStorageService (Interface)
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
AsyncStorage     MMKV           Supabase
 Adapter        Adapter          Adapter
```

### Etkilenen Dosyalar

| Dosya | AsyncStorage Çağrısı |
|-------|---------------------|
| `context/BooksContext.tsx` | 5 |
| `context/CreditsContext.tsx` | 4 |
| `context/NotificationContext.tsx` | 2 |
| `context/LanguageContext.tsx` | 3 |

---

## 🚀 MMKV Geçiş Rehberi

### Ön Koşullar

* ⚠️ **Expo Go desteği kaybolur** - Development Build gerekir
* `npx expo prebuild` çalıştırılmalı
* Native modül yüklenir

### Adımlar

1. **Soyutlama katmanını kur** (bir kerelik yatırım)
2. **MMKV kütüphanesini yükle:** `npm install react-native-mmkv`
3. **Prebuild:** `npx expo prebuild`
4. **MMKVAdapter.ts** yaz
5. **Veri migrasyonu:** Eski AsyncStorage → Yeni MMKV
6. **Factory'de switch et**

### Performans Karşılaştırması

| Operasyon | AsyncStorage | MMKV |
|-----------|--------------|------|
| `getItem` | ~5-10ms | ~0.1ms |
| `setItem` | ~8-15ms | ~0.2ms |
| API tipi | Asenkron (Promise) | Senkron |

---

## ☁️ Supabase/Firebase Geçiş Yol Haritası

### Ne Zaman Gerekli?

* Kullanıcılar arası veri paylaşımı
* Bulut yedekleme
* Çoklu cihaz senkronizasyonu
* User authentication (gerçek)

### Hibrit Strateji (Önerilen)

```
Local Storage (MMKV)  ←→  Cloud Sync (Supabase)
     │                           │
     └── Offline First ──────────┘
```

1. **Yerel öncelik:** Kullanıcı her zaman çevrimdışı çalışabilir
2. **Arka plan sync:** İnternet varsa buluta yedekle
3. **Çakışma çözümü:** "Last Write Wins" veya timestamp bazlı

### Soyutlama ile Geçiş Kolaylığı

| Senaryo | Soyutlama Olmadan | Soyutlama İle |
|---------|-------------------|---------------|
| MMKV'ye geç | 4 dosya, 14 satır | 1 adapter dosyası |
| Supabase ekle | 4 dosya + sync logic | 1 adapter + sync service |
| Firebase ekle | 4 dosya + SDK entegrasyonu | 1 adapter dosyası |

---

## 📊 Kapasite Limitleri (Güncel)

| Kitap Sayısı | AsyncStorage | MMKV | SQLite | Supabase |
|--------------|--------------|------|--------|----------|
| 100 | ✅ | ✅ | ✅ | ✅ |
| 1.000 | ⚠️ Hafif yavaşlama | ✅ | ✅ | ✅ |
| 5.000 | 🐢 Yavaş | ✅ | ✅ | ✅ |
| 10.000 | ❌ RAM sorunu | ⚠️ RAM şişer | ✅ | ✅ |
| 50.000+ | ❌ Crash | ❌ RAM yetersiz | ✅ | ✅ |

---

## ✅ Aksiyon Planı

* [ ] **Faz 0 (Şu an):** Soyutlama katmanını kur (`StorageService`)
* [ ] **Faz 1 (İhtiyaç olursa):** MMKV adapter ekle
* [ ] **Faz 2 (Gelecek):** Cloud sync (Supabase/Firebase)
