# UX Yeniden Tasarım Önerisi: "Dashboard & Kütüphane" Dönüşümü

## 🎯 Hedef

Ana Sayfayı karmaşadan kurtarmak için "kütüphane yönetimi" özelliklerini (Okundu, Okunuyor, Okunacak filtreleri) **Kitaplarım** sayfasına taşımak ve **Ana Sayfayı** kişisel bir **Okuma Paneline (Dashboard)** dönüştürmek.

---

## 🏗️ 1. Aşama: Yeni "Kitaplarım" Sayfası

_Tüm "Koleksiyon Yönetimi" tek bir güçlü ekranda._

### 🔹 Yapılacak Değişiklikler

- **Durum Filtrelerini Taşıma:** "Tümü / Okundu / Okunuyor / Okunacak" geçişlerini Ana Sayfadan alıp bu sayfanın en tepesine ekleyeceğiz.
- **Birleşik Filtreleme:** Yeni Durum filtrelerini, mevcut **Tür Filtresi** ve **Sıralama** seçenekleriyle entegre edeceğiz.
- **Sonuç:** Kütüphanenizdeki herhangi bir kitabı bulmak için tek ve güçlü bir merkez.

### 🎨 Görsel Konsept

1. **Üst Başlık:** "Kütüphanem"
2. **Sekmeler (Segmented Control):** [ Tümü | Okunuyor | Okunacak | Okundu ]
3. **Alt Araç Çubuğu:**
   - Açılır Menü: Tür (Roman, Tarih vb.)
   - Arama Çubuğu
   - Sıralama Butonu (A-Z, Puan vb.)

---

## 🚀 2. Aşama: Yeni Ana Sayfa (Dashboard)

_Okuma hayatınız için bir "Komuta Merkezi". Daha az yönetim, daha çok motivasyon._

Ana listeden boşalan yere şunları ekleyebiliriz:

### 🌟 1. "Şu An Okunuyor" Vitrini (Öncelik #1)

Eğer durumu **"Okunuyor"** olan bir kitabınız varsa, burada büyük ve şık bir kart olarak görünecek.

- **Görsel:** Büyük kapak resmi, mevcut ilerleme durumu ve bir "Devam Et" butonu.
- **Neden:** En önemli olana anında erişim.

### 📊 2. Okuma İstatistikleri (Oyunlaştırma)

Sizi motive edecek basit veriler.

- **Bu Yıl:** "2026'da 12 Kitap Okundu"
- **Toplam:** "Kütüphanede 145 Kitap"
- **Hedef:** Yıllık hedefinize ne kadar kaldığı.

### ⏱️ 3. Son Aktiviteler / Hızlı Erişim

- **Son Eklenenler:** Kütüphaneye eklediğiniz son 5 kitabın yatay listesi.

* **Hızlı İşlemler:** Barkod tarama veya kitap ekleme için kısayollar.

### 💡 4. Günlük İlham (Opsiyonel)

- Kitaplarınızdan rastgele bir alıntı veya "Biliyor muydunuz?" köşesi.

---

## 📝 Karar

Bu yapı sizin vizyonunuza uygun mu?

1. **Ana Sayfa:** Dashboard (İstatistikler + Aktif Okuma Odağı)
2. **Kitaplarım:** Tam Kütüphane Yönetimi (Tüm Filtreler + Arama)

Onaylarsanız, geliştirmeye **Kitaplarım** sayfasını düzenleyerek başlayacağım.
