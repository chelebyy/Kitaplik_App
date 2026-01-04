# Arama Motoru V2 İyileştirme Planı (The Hybrid Engine)

## Hedef

Arama motorunu hızlandırmak (Paralel Arama), "Akıllı" hale getirmek (ISBN Dedektifi) ve sonuç kalitesini artırmak (Puanlama Sistemi).

## 1. Paralel Arama (Parallel Execution) ⚡

**Mevcut Durum:** Google'a sor -> Bekle -> Sonuç yoksa Open Library'ye sor.
**Yeni Durum:** İkisine aynı anda sor -> Sonuçları birleştir -> Puanla -> Göster.

```typescript
// Pseudo-code
const [googleResults, openLibResults] = await Promise.all([
  GoogleBooksService.search(query),
  OpenLibraryService.search(query),
]);
const combined = mergeAndDeduplicate(googleResults, openLibResults);
```

## 2. ISBN Dedektifi (Smart Detection) 🕵️‍♂️

Kullanıcının girdiği metnin ISBN olup olmadığını anlayan Regex yapısı.

- **Regex:** `^(97(8|9))?\d{9}(\d|X)$` (Basit kontrol)
- **Aksiyon:** Eğer ISBN ise, normal arama yapma; direkt `searchByIsbn` fonksiyonuna git.

## 3. Puanlama Sistemi (Weighted Scoring) 🏆

Sonuçları rastgele değil, kaliteye göre sıralayacağız.

**Puan Tablosu:**

| Kriter                                                              | Puan     |
| :------------------------------------------------------------------ | :------- |
| **Kapak Resmi Var**                                                 | +20 Puan |
| **Başlık Tam Eşleşiyor**                                            | +30 Puan |
| **Yazar Tam Eşleşiyor**                                             | +20 Puan |
| **Kullanıcı Dili Eşleşiyor** (Örn: App İngilizce ise `en` kitaplar) | +15 Puan |
| **Sayfa Sayısı Var**                                                | +5 Puan  |
| **Yayın Tarihi Var**                                                | +5 Puan  |

**Sıralama:** En yüksek puanlı en üstte.

---

## Eylem Planı (Checklist)

- [ ] **Adım 1:** `services/SearchEngine.ts` adında yeni bir "Orkestra Şefi" servisi oluştur.
- [ ] **Adım 2:** ISBN tespit Regex'ini ve yönlendirmesini yaz.
- [ ] **Adım 3:** Paralel Arama (`Promise.all`) yapısını kur.
- [ ] **Adım 4:** Puanlama Algoritmasını (`calculateRelevanceScore`) yaz.
- [ ] **Adım 5:** `GoogleBooksService.ts` içindeki mantığı bu yeni servise taşı (Refactor).
