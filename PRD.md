# Kitaplik_App - Ürün Gereksinim Dokümanı (PRD)

> **Durum:** Canlı / Geriye Dönük Mühendislik ile Oluşturuldu
> **Tarih:** 2 Aralık 2025
> **Versiyon:** 1.0

## 1. Ürün Özeti
**Kitaplik_App**, kitap severlerin fiziksel veya dijital kütüphanelerini mobil cihazları üzerinden kolayca yönetmelerini sağlayan, kullanıcı dostu ve **çevrimdışı öncelikli (offline-first)** bir mobil uygulamadır. Kullanıcılar kitaplarını kaydedebilir, okuma durumlarını (okunacak, okunuyor, okundu) takip edebilir ve kitap satın alımları için popüler mağazalara hızlı erişim sağlayabilir. Uygulama, herhangi bir üyelik veya sürekli internet bağlantısı gerektirmeden tam fonksiyonel olarak çalışır.

## 2. Teknik Mimari ve Kısıtlar
Uygulama, sunucu maliyetlerini ortadan kaldıran ve maksimum gizlilik sağlayan "Sunucusuz" (Serverless) ve "Yerel Veri" (Local Storage) mimarisi üzerine inşa edilmiştir.

*   **Platform:** React Native (Expo Managed Workflow)
*   **Programlama Dili:** TypeScript
*   **Veri Tabanı:** AsyncStorage (Veriler kullanıcının cihazında JSON olarak saklanır).
*   **Navigasyon:** Expo Router (Dosya tabanlı yönlendirme).
*   **Global Durum Yönetimi:** React Context API (`AuthContext`, `BooksContext`, `ThemeContext`).
*   **Dış Servisler:**
    *   **Google Books API:** Kitap kapak resmi, yazar, özet ve sayfa sayısı bilgilerini çekmek için.
    *   **Expo Camera:** Kitap arkasındaki ISBN (EAN-13) barkodlarını taramak için.
*   **Kısıtlar:**
    *   Veriler bulutta yedeklenmez (kullanıcı uygulamayı silerse veriler gider).
    *   Çoklu cihaz senkronizasyonu yoktur.

## 3. Temel Özellikler ve Modüller

### 3.1. Kimlik Doğrulama (Local Auth)
*   **Özellik:** Sunucu bağımsız, cihaz içi profil oluşturma.
*   **Detay:** Kullanıcı sadece bir "Takma Ad" (Nickname) girerek giriş yapar. Şifre veya E-posta gerekmez.
*   **Avatar:** Girilen isme göre `ui-avatars.com` üzerinden otomatik profil resmi oluşturulur.

### 3.2. Kitap Ekleme Modülü
Kullanıcıların kütüphanelerine kitap eklemesi için üç farklı yöntem sunulur:
1.  **Barkod Tarama:** Telefon kamerası kullanılarak kitabın ISBN kodu taranır ve bilgiler Google Books API'den otomatik çekilir.
2.  **Akıllı Arama:** Kitap adı veya yazar adı ile Google Books veritabanında arama yapılır.
3.  **Manuel Giriş:** API'de bulunamayan kitaplar için (veya özel basımlar için) elle veri girişi yapılabilir.

### 3.3. Kütüphane ve Okuma Takibi
*   **Raflar:** Kitaplar "Okunacaklar", "Okunuyor" ve "Bitenler" olarak üç ana kategoride listelenir.
*   **İlerleme Çubuğu:** "Okunuyor" durumundaki kitaplar için güncel sayfa sayısı girilerek görsel bir ilerleme çubuğu (Progress Bar) görüntülenir.
*   **Kişisel Notlar:** Her kitap detayına kullanıcı tarafından özel metin notları eklenebilir.

### 3.4. Fiyat Karşılaştırma (Akıllı Linkler)
*   **Amaç:** Kullanıcının en uygun fiyatı bulmasını kolaylaştırmak.
*   **Yöntem:** Canlı veri çekmek (scraping) yerine, kitabın ISBN veya adını kullanarak popüler mağazalar için "Doğrudan Arama Linkleri" üretilir.
*   **Desteklenen Mağazalar:** Kitapyurdu, D&R, İdefix, Amazon TR, BKM Kitap, NadirKitap.

### 3.5. Ayarlar ve Kişiselleştirme
*   **Çoklu Dil Desteği:** Türkçe (Varsayılan) ve İngilizce. Uygulama içi anlık geçiş imkanı.
*   **Tema:** Koyu Mod (Dark Mode) ve Açık Mod (Light Mode) desteği.
*   **Veri Yönetimi:** "Tüm Verileri Temizle" seçeneği ile cihazdaki verilerin sıfırlanması.

## 4. Kullanıcı Hikayeleri (User Stories)

| Rol | İstek | Amaç |
| :--- | :--- | :--- |
| **Okur** | Elimdeki fiziksel kitabın barkodunu okutmak istiyorum. | Kitabın adını ve yazarını yazmakla uğraşmadan saniyeler içinde kütüphaneme eklemek için. |
| **Öğrenci** | Okuduğum kitapta kaçıncı sayfada kaldığımı kaydetmek istiyorum. | Sonraki okuma seansımda kaldığım yeri hatırlamak ve bitirmeye ne kadar kaldığını görmek için. |
| **Kitap Sever** | Bir kitabın Kitapyurdu ve Amazon fiyatlarını görmek istiyorum. | Tek tek sitelere girip arama yapmadan, tek tıkla ilgili sayfalara gidip fiyatı karşılaştırmak için. |
| **Gezgin** | Kitap notlarıma internetim yokken de erişmek istiyorum. | Metroda veya uçakta seyahat ederken aldığım notları gözden geçirebilmek için. |
| **Kullanıcı** | Uygulamayı İngilizce kullanmak istiyorum. | Telefon dilim İngilizce olduğu için veya İngilizce pratiği yapmak için. |

## 5. Gelecek Planları (Roadmap)
*   **Yedekleme:** Verilerin JSON dosyası olarak dışa aktarılması (Export) ve içe aktarılması (Import).
*   **İstatistikler:** Aylık/Yıllık okuma hedefleri ve grafikleri.
*   **Koleksiyonlar:** Özel listeler (örn: "Yaz Tatili Listesi", "Favorilerim") oluşturma.
