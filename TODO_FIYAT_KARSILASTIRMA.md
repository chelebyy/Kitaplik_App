# Fiyat Karşılaştırma Özelliği - TODO

## 🎯 Hedef

Kullanıcıya kitabın en uygun fiyatını ve hangi mağazada olduğunu göstermek.

---

## 📊 Mevcut Durum

- [x] Fiyat karşılaştırma modalı oluşturuldu
- [x] Mağaza linkleri eklendi (Kitapyurdu, D&R, İdefix, Amazon TR, BKM, NadirKitap)
- [x] "Mağazaya Git" butonu çalışıyor
- [x] **Karar:** Scraping yerine güvenli yönlendirme (Smart Links) yöntemi seçildi ve uygulandı.
- [x] **Sonuç:** Özellik Canlı (Production-Ready). mockPrices servisi yönlendirme linkleri için temel oluşturuyor.

---

## 💡 Değerlendirilen Yöntemler

### 1. Cimri/Akakçe Üzerinden Sorgulama ❌ (BAŞARISIZ)

**Mantık:** Tek tek mağazalara gitmek yerine, fiyat karşılaştırma sitelerini kullan.

- [x] Cimri.com HTML yapısını incele → **403 Cloudflare engeli**
- [x] Akakçe HTML yapısını incele → **403 Cloudflare engeli**
- [x] Test: React Native'den fetch ile HTML çekilebiliyor mu? → **HAYIR**

**Sonuç:** Bu yöntem kullanılamaz, Cloudflare koruması var.

---

### 1b. Doğrudan Mağaza Scraping ⭐ (YENİ ÖNCELİK)

**Mantık:** Mağaza sitelerinden doğrudan fiyat çek.
**Test Sonuçları (2 Aralık 2025):**

| Site       | Status      | Veri Çekildi?     |
| ---------- | ----------- | ----------------- |
| D&R        | ✅ 200      | ✅ Fiyat bulundu  |
| Kitapyurdu | ✅ 200      | ⚠️ Regex güncelle |
| BKM Kitap  | ✅ 200      | ⚠️ Regex güncelle |
| İdefix     | ⚠️ Redirect | Düzeltilecek      |

- [x] D&R fiyat parse mantığı yaz ✅ ÇALIŞIYOR
- [x] Kitapyurdu fiyat parse mantığı yaz ✅ ÇALIŞIYOR
- [x] BKM Kitap fiyat parse mantığı yaz ✅ ÇALIŞIYOR
- [x] Amazon TR ✅ ÇALIŞIYOR
- [x] Hepsiburada ✅ ÇALIŞIYOR
- [x] N11 ✅ ÇALIŞIYOR
- ⚠️ İdefix - Redirect sorunu
- 🛡️ Trendyol, Cimri, Akakçe - Cloudflare engeli

**KARAR: Güvenli Yaklaşım Seçildi** ✅
Scraping yerine karşılaştırma sitelerine yönlendirme yapılacak.

**Uygulanan Çözüm:**

- "Fiyatları Karşılaştır" bölümü eklendi
- Google Shopping, Akakçe, Cimri butonları
- Mağaza linkleri korundu (D&R, Kitapyurdu, vb.)
- %100 yasal ve güvenli

**Avantajlar:**

- Çalışıyor! (Test edildi)
- Ücretsiz

**Riskler:**

- Site yapısı değişirse kod kırılır
- Her site için ayrı parser gerekli

---

### 2. İmece Usulü (Crowdsourced) 🔄

**Mantık:** Kullanıcı fiyatı çektiğinde Firebase'e kaydet, diğer kullanıcılar oradan okusun.

- [ ] Firebase/Supabase kurulumu
- [ ] Fiyat cache yapısı tasarla
- [ ] Client-side scraping servisi yaz
- [ ] Fiyat kaydetme/okuma mantığı

**Avantajlar:**

- Sunucu maliyeti yok
- IP ban riski düşük
- Veri zamanla büyür

**Dezavantajlar:**

- Firebase kurulumu gerekli
- Başlangıçta veri boş

---

### 3. WebView ile Scraping 🌐

**Mantık:** Arka planda görünmez tarayıcı açıp siteyi yükle.

- [ ] react-native-webview kurulumu
- [ ] Gizli WebView ile sayfa yükleme
- [ ] JavaScript injection ile fiyat çekme

**Avantajlar:**

- JS gerektiren siteleri açar
- Gerçek tarayıcı gibi davranır

**Dezavantajlar:**

- Pil ve internet tüketimi yüksek
- Yavaş

---

### 4. Google Books API + RapidAPI 📚

**Mantık:** Resmi API'ler kullan.

- [ ] Google Books saleInfo entegrasyonu
- [ ] RapidAPI PriceAPI araştır
- [ ] Amazon TR fiyat API'si

**Avantajlar:**

- Stabil, kırılmaz
- Resmi yol

**Dezavantajlar:**

- Türk mağazalarını kapsamaz
- RapidAPI ücretli olabilir

---

### 5. Backend Scraper (.NET Core) 🖥️

**Mantık:** Kendi sunucunda scraping yap.

- [ ] .NET Core Web API oluştur
- [ ] HtmlAgilityPack ile scraping
- [ ] Azure/Render'a deploy
- [ ] React Native'den API çağır

**Avantajlar:**

- Tam kontrol
- Güvenilir

**Dezavantajlar:**

- Sunucu maliyeti
- Bakım gerektirir

---

## 🚀 Eylem Planı

### Faz 1: Fizibilite Testi

- [ ] Cimri.com'dan fetch ile HTML çekilebilir mi test et
- [ ] Akakçe'den fetch ile HTML çekilebilir mi test et
- [ ] Sonuçlara göre yöntem seç

### Faz 2: Uygulama

- [ ] Seçilen yöntemi implement et
- [ ] "En İyi Teklif" UI kartını tasarla
- [ ] Hata yönetimi ekle (site açılmazsa fallback)

### Faz 3: İyileştirme

- [ ] Cache mekanizması (aynı kitap için tekrar sorma)
- [ ] Loading animasyonu
- [ ] Çoklu mağaza fiyat listesi

---

## 📝 Notlar

- Şu an mock fiyatlar kullanılıyor (PriceService.ts)
- Kullanıcı her zaman "Mağazaya Git" ile siteye gidebilir (fallback)
- CORS sorunu olursa backend zorunlu olabilir

---

## 🔗 Referanslar

- Kampanyam uygulaması: XML feed + Affiliate anlaşmaları kullanıyor
- Cimri.com: <https://www.cimri.com>
- Akakçe: <https://www.akakce.com>

---

_Son güncelleme: 2 Aralık 2025_
