# TR/EN Dil Tutarlılık Kontrol Planı

## Amaç

Kitaplık App uygulamasındaki Türkçe ve İngilizce çeviri dosyalarındaki eksiklikleri, tutarsızlıkları ve kullanılmayan anahtarları tespit etmek.

## Proje Türü

**MOBİL** - React Native/Expo uygulaması

## Mevcut Durum

### Dosya Konumları

- Türkçe: `i18n/locales/tr.json` (299 anahtar)
- İngilizce: `i18n/locales/en.json` (297 anahtar)

### Yapı

- Düz anahtar-değer yapısı (iç içe yok)
- Kullanım pattern: `t("anahtar_adi")` bileşenlerde
- Kategori grupları: UI elementler, durum etiketleri, form elemanları, türler (30), başarımlar (14)

## Tespit Edilen Sorunlar

### 1. Eksik Anahtarlar (İngilizce'de)

`en.json` dosyasında olmayan anahtarlar:

| Anahtar                     | Türkçe Değer                                                               | Durum |
| --------------------------- | -------------------------------------------------------------------------- | ----- |
| `insufficient_credit_title` | "Yetersiz Kredi"                                                           | Eksik |
| `insufficient_credit_msg`   | "Bu özellik için 1 krediye ihtiyacınız var. Kredi kazanmak ister misiniz?" | Eksik |

**Not:** Bu anahtarlar `tr.json`'da tanımlı ancak `en.json`'da yok.

### 2. Analiz Gerektiren Durumlar

- `insufficient_credit` anahtarı her iki dilde de mevcut
- `RecommendationModal.tsx`'de sadece `insufficient_credit` kullanılıyor
- `insufficient_credit_title` ve `insufficient_credit_msg` kullanım yerleri tespit edilemedi

## Görevler

### Görev 1: Eksik Anahtarların İngilizce Çevirisi

- `insufficient_credit_title` için İngilizce çeviri ekle: "Insufficient Credit"
- `insufficient_credit_msg` için İngilizce çeviri ekle: "You need 1 credit for this feature. Would you like to earn credits?"

### Görev 2: Kullanım Analizi

Aşağıdaki bileşenlerde `t()` fonksiyonu çağrılarını analiz et:

- `app/(tabs)/index.tsx`
- `app/(tabs)/books.tsx`
- `app/(tabs)/settings.tsx`
- `app/add-book.tsx`
- `app/book-detail.tsx`
- `components/RecommendationModal.tsx`

**Amaç:** Hardcoded string'leri tespit et

### Görev 3: Kullanılmayan Anahtarları Tespit Et

- Tüm `t("anahtar")` çağrılarını bul
- `tr.json` ve `en.json`'daki anahtarlarla karşılaştır
- Kullanılmayan anahtarları listele

### Görev 4: Çeviri Kalitesi Kontrolü

- İnterpolasyon parametrelerinin tutarlılığını kontrol et (`{{variable}}`)
- Aynı anlamdaki çevirilerin tutarlılığını kontrol et
- Uzunluk farklılıklarını (UI sığması için) analiz et

## Beklenen Çıktılar

### 1. Detaylı Rapor

```
# i18n Tutarlılık Raporu

## Özet
- TR anahtar sayısı: 299
- EN anahtar sayısı: 297
- Eksik EN anahtarları: 2
- Eksik TR anahtarları: 0
- Kullanılmayan anahtarlar: [X]
- Hardcoded string'ler: [X]

## Eksik Çeviriler (EN)
- [ ] insufficient_credit_title
- [ ] insufficient_credit_msg

## Kullanılmayan Anahtarlar
- [ ] anahtar_adi: Değer

## Hardcoded String'ler
- [ ] Dosya:Satır - "Hardcoded string"

## Çeviri Kalitesi Sorunları
- [ ] Anahtar: Açıklama
```

### 2. Düzeltilmiş Dosyalar

- `i18n/locales/en.json` (eksik anahtarlar eklendi)
- Opsiyonel: Kullanılmayan anahtarlar temizlenmiş dosyalar

## Doğrulama Adımları

### 1. Manuel Test

```bash
# Uygulamayı başlat
npm run dev

# Dil değiştir ve tüm ekranları gez
# Her iki dilde de UI elementlerini kontrol et
# Eksik çeviri varsa görsel olarak tespit et
```

### 2. Otomatik Kontrol

```bash
# i18n checker script'i çalıştır (mevcutsa)
python ~/.claude/skills/i18n-localization/scripts/i18n_checker.py .
```

## Başarı Kriterleri

### Tamamlandı Kabul Edilmesi İçin

- [x] `insufficient_credit_title` ve `insufficient_credit_msg` İngilizce'ye çevrildi
- [x] Tüm kullanılmayan anahtarlar raporlandı
- [x] Tüm hardcoded string'ler listelendi
- [x] Rapor `docs/i18n-consistency-report.md` olarak kaydedildi
- [x] Manuel test yapıldı ve UI'da eksik çeviri görünmüyor

## Notlar

### Kod Kuralları

- Bileşenlerde hardcoded string kullanımı yasak
- Tüm UI metinleri `t()` fonksiyonu ile i18n'den alınmalı
- Çeviriler kullanıcı dostu ve kısa olmalı (UI sığması için)

### Öncelik Sırası

1. **P0:** Eksik İngilizce çeviriler (hemen düzeltilmeli)
2. **P1:** Kullanılmayan anahtarlar (temizlik için)
3. **P2:** Hardcoded string'ler (refactoring için)
4. **P3:** Çeviri kalitesi iyileştirmeleri (opsiyonel)

## İlgili Dosyalar

- `i18n/locales/tr.json`
- `i18n/locales/en.json`
- `components/RecommendationModal.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/books.tsx`
- `app/(tabs)/settings.tsx`
- `app/add-book.tsx`
- `app/book-detail.tsx`

## Sonraki Adımlar

Plan onaylandıktan sonra:

1. Eksik çevirileri ekle
2. Kullanım analizi script'i çalıştır
3. Rapor oluştur
4. Manuel test yap
5. Bulunan sorunları düzelt

---

**Plan Durumu:** Hazır
**Oluşturma Tarihi:** 2025-01-17
**Görev:** TR/EN dil tutarlılık kontrolü
