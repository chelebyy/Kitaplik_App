# Kitaplik_App - Ürün Gereksinim Dokümanı (PRD)

> **Durum:** Canlı / Geriye Dönük Mühendislik ile Oluşturuldu
> **Tarih:** Ocak 2026
> **Versiyon:** 1.2

## 1. Ürün Özeti

**Kitaplik_App**, kitap severlerin fiziksel veya dijital kütüphanelerini mobil cihazları üzerinden kolayca yönetmelerini sağlayan, kullanıcı dostu ve **çevrimdışı öncelikli (offline-first)** bir mobil uygulamadır. Kullanıcılar kitaplarını kaydedebilir, okuma durumlarını (okunacak, okunuyor, okundu) takip edebilir ve kitap satın alımları için popüler mağazalara hızlı erişim sağlayabilir. Uygulama, modern bir arayüz ve akıcı bir kullanıcı deneyimi sunar.

## 2. Teknik Mimari ve Standartlar

Uygulama, sunucu maliyetlerini ortadan kaldıran ve maksimum gizlilik sağlayan "Sunucusuz" (Serverless) ve "Yerel Veri" (Local Storage) mimarisi üzerine inşa edilmiştir.

### 2.1. Temel Stack

- **Platform:** React Native (Expo Managed Workflow SDK 52+)
- **Programlama Dili:** TypeScript
- **Veri Tabanı:** AsyncStorage (Veriler kullanıcının cihazında JSON olarak saklanır).
- **Navigasyon:** Expo Router (Dosya tabanlı yönlendirme).
- **Global Durum Yönetimi:** React Context API (`AuthContext`, `BooksContext`, `ThemeContext`, `CreditsContext`).
- **UI Framework:** NativeWind (Tailwind CSS) & Lucide Icons.

### 2.2. Dış Servisler

- **Google Books API:** Birincil kitap veri kaynağı.
- **Open Library API:** Tamamlayıcı kitap veri kaynağı (Hybrid Search).
- **Expo Camera:** ISBN (EAN-13) barkod taraması için.
- **AdMob:** Ödüllü reklamlar (Rewarded Ads) üzerinden kredi kazanımı için.

### 2.3. Kalite ve Test Standartları

- **Test:** Jest ile Unit Test zorunluluğu (TDD prensipleri).
- **Kod Analizi:** SonarQube ile sürekli denetim (Quality Gate).
- **Stil:** NativeWind (Tailwind) ile tutarlı UI/UX.

## 3. Temel Özellikler ve Modüller

### 3.1. Kimlik Doğrulama (Local Auth)

- **Özellik:** Sunucu bağımsız, cihaz içi profil oluşturma.
- **Detay:** Kullanıcı sadece bir "Takma Ad" (Nickname) girerek giriş yapar. Şifre veya E-posta gerekmez.
- **Avatar:** `ui-avatars.com` entegrasyonu ile isme özel avatar oluşturulur.

### 3.2. Kitap Yönetimi

Kullanıcılar kütüphanelerine 3 yöntemle kitap ekleyebilir:

1. **Barkod Tarama:** Kamera ile ISBN taranarak Google Books verisi otomatik çekilir.
2. **Hybrid Akıllı Arama:** Kitap/Yazar adı ile yapılan aramalarda **Google Books** ve **Open Library** sonuçları birleştirilir, puanlanır ve en alakalı sonuçlar sunulur.
3. **Manuel Giriş:** Özel basımlar için elle veri girişi.

### 3.3. Okuma Takibi ve İstatistikler

- **Raflar:** "Okunacaklar", "Okunuyor" ve "Bitenler" durumları.
- **İlerleme:** Sayfa bazlı ilerleme çubuğu ve yüzde gösterimi.
- **Notlar:** Her kitap için özel not alma alanı.

### 3.4. Kredi ve Reklam Sistemi (Gamification)

- **Amaç:** Uygulamanın sürdürülebilirliğini sağlamak ve "premium" özellik hissi yaratmak.
- **Mekanizma:** Kullanıcılar "Ödüllü Reklam" izleyerek kredi kazanır.
- **Kullanım:** Bazı gelişmiş özellikler (örn: detaylı yapay zeka önerileri veya çoklu kitap ekleme) kredi gerektirebilir.

### 3.5. Fiyat Karşılaştırma (Akıllı Linkler) ✅

- **Durum:** Tamamlandı.
- **Yöntem:** ISBN veya kitap adı kullanılarak popüler mağazalar için dinamik arama linkleri oluşturulur.
- **Desteklenen Mağazalar:** Kitapyurdu, D&R, İdefix, Amazon TR, BKM Kitap, NadirKitap.
- **Özellik:** Canlı fiyat çekmek yerine, kullanıcıyı doğrudan mağazanın ilgili arama sonucuna yönlendirir. En uygun fiyat için Akakçe/Cimri yönlendirmeleri de dahildir.

### 3.6. Ayarlar ve UX ✅

- **Durum:** Tamamlandı.
- **Dil:** Türkçe/İngilizce (i18n) desteği.
- **Yedekleme:** "BackupService" ile yerel depolamaya kaydetme veya Drive/Paylaş üzerinden buluta aktarma seçeneği.
- **Tema:** Otomatik veya manuel Koyu/Açık mod.
- **Splash Screen:** Native Splash API kullanılarak pürüzsüz açılış (Siyah ekran sorunu çözülmüştür).

## 4. Kullanıcı Hikayeleri (User Stories)

| Rol               | İstek                                                                   | Amaç                                                                   |
| :---------------- | :---------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Hızlı Okur**    | Kitabın arkasındaki barkodu okutup hemen eklemek istiyorum.             | Manuel yazmakla vakit kaybetmemek için.                                |
| **Öğrenci**       | "Okunuyor" rafımdaki kitapta kaldığım sayfayı güncellemek istiyorum.    | Bir sonraki okumamda nerede kaldığımı hatırlamak için.                 |
| **Ekonomik Okur** | Bir kitabın Kitapyurdu ve Amazon linklerine tek tıkla gitmek istiyorum. | En ucuz fiyatı bulmak için manuel arama yapmaktan kurtulmak istiyorum. |
| **Gezgin**        | Metroda internetim yokken notlarıma bakmak istiyorum.                   | Offline-first yapı sayesinde verilerime her an erişebilmek için.       |

## 5. Gelecek Planları (Roadmap)

- **Yedekleme (JSON Export/Import):** Verilerin cihazlar arası taşınabilmesi.
- **Okuma Hedefleri:** Yıllık okuma hedefi belirleme ve grafiksel takip.
- **Koleksiyonlar:** "Yaz Tatili", "Favoriler" gibi özel listeler oluşturma.
- **Sosyal Paylaşım:** Okunan kitabın Instagram hikayelerinde paylaşılması için özel görsel oluşturucu.
