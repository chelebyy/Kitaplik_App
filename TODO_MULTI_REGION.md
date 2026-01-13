# 🌍 Çoklu Bölge/Dil Fiyat Karşılaştırma Planı

## 🎯 Hedef

Uygulamanın dil seçeneğine göre ilgili ülkenin mağazalarını ve fiyat karşılaştırma sitelerini göstermek.

- **Türkçe (tr):** Türkiye mağazaları (D&R, Kitapyurdu, BKM...) + Akakçe/Cimri
- **İngilizce (en):** Global mağazalar (Amazon.com, Barnes & Noble...) + Google Shopping Global

---

## 📋 Yapılacaklar Listesi (Roadmap)

### 1. Veri Yapısı Hazırlığı

- [ ] **Global Mağaza Listesi Oluştur**
  - Amazon.com (Global)
  - Barnes & Noble (US)
  - AbeBooks (Global/US)
  - Blackwell's (UK/Global - Ücretsiz kargo avantajı var)
- [ ] **Global Karşılaştırma Siteleri Belirle**
  - Google Shopping (Global)
  - CamelCamelCamel (Amazon Fiyat Takip)
  - eBay (İkinci el/Sıfır)

### 2. Service Katmanı (Backend Logic)

- [ ] `PriceService.ts` dosyasını güncelle.
- [ ] `STORES` sabitini `TR_STORES` ve `EN_STORES` olarak ayır.
- [ ] `getStoreLinks` fonksiyonuna `language` parametresi ekle.
- [ ] Dil parametresine göre ilgili listeyi döndüren mantığı kur.

### 3. UI Katmanı (Frontend)

- [ ] `PriceComparisonModal.tsx` dosyasını güncelle.
- [ ] `COMPARISON_SITES` sabitini dinamik hale getir (Dile göre değişsin).
  - TR: Google Shopping TR, Akakçe, Cimri
  - EN: Google Shopping Global, Amazon Search, eBay
- [ ] Modal açıldığında `i18n.language` değerini alıp servise gönder.

### 4. Test

- [ ] Uygulama dilini Türkçe yap -> D&R, Akakçe görünüyor mu?
- [ ] Uygulama dilini İngilizce yap -> Amazon.com, Google Global görünüyor mu?

---

## 🏪 Mağaza Listesi Taslağı

### 🇹🇷 Türkiye (Mevcut)

1. D&R
2. Kitapyurdu
3. BKM Kitap
4. Amazon.com.tr
5. Hepsiburada
6. N11

### 🌎 Global (İngilizce)

1. **Amazon.com** (Dünya devi)
2. **Barnes & Noble** (En büyük kitapçı zinciri)
3. **AbeBooks** (Nadir ve ikinci el kitaplar)
4. **Blackwell's** (Dünya geneli kargo)
5. **Google Books** (E-kitap ve basılı)

---

## 🔗 Karşılaştırma Butonları Taslağı

### 🇹🇷 TR Modu

`[Google TR] [Akakçe] [Cimri]`

### 🌎 EN Modu

`[Google Global] [Amazon.com] [eBay]`
