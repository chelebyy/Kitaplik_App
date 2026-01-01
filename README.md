# Kitaplık App

Kişisel kitap koleksiyonunuzu yönetmek, okuma alışkanlıklarınızı takip etmek ve yeni kitap önerileri almak için geliştirilmiş, Expo tabanlı modern bir mobil uygulama.

## 🚀 Özellikler

- **Kitap Yönetimi**: Kitaplığınızdaki kitapları ekleyin, düzenleyin ve detaylarını görüntüleyin.
- **Barkod Okuyucu**: Kitapları hızlıca eklemek için kameranızı kullanarak barkodları tarayın (`expo-camera`).
- **Öneri Sistemi**: Google Books API entegrasyonu ile okuma zevkinize uygun kitap önerileri alın.
- **Çevrimdışı Kimlik Doğrulama**: Yerel depolama tabanlı, üyelik gerektirmeyen hızlı profil oluşturma.
- **Yapay Zeka Destekli Öneriler**: Okuma zevkinize uygun "Sihirli Öneri" sistemi.
- **Fiyat Karşılaştırma**: Popüler Türk mağazaları için "Akıllı Linkler" ile en ucuz kitabı bulma.
- **Veri Yedekleme & Geri Yükleme**: Dosya tabanlı yedekleme ve sistem paylaşımı (Drive, bulut vb.) ile veri güvenliği.
- **Karanlık/Aydınlık Mod**: Göz yorgunluğunu azaltan modern tema desteği.

## 🛠️ Teknolojiler

- **Platform**: [Expo](https://expo.dev) (React Native)
- **Dil**: TypeScript
- **Yönlendirme**: Expo Router
- **Veri Tabanı**: AsyncStorage (Offline-First)
- **API**: Google Books API
- **UI**: Lucide React Native, Tailwind (nativewind/clsx)

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1. **Depoyu Klonlayın**:

   ```bash
   git clone <repo-url>
   cd Kitaplik_App
   ```

2. **Bağımlılıkları Yükleyin**:

   ```bash
   npm install
   # veya
   yarn install
   ```

3. **Uygulamayı Başlatın**:

   ```bash
   npm run dev
   # veya
   npm run build:web
   ```

## 📚 Dokümantasyon

Detaylı teknik dokümantasyon ve mimari analiz için [GEMINIDOCS/INDEX.md](GEMINIDOCS/INDEX.md) dosyasını inceleyebilirsiniz.

## 📂 Proje Yapısı

```
Kitaplik_App/
├── app/                 # Uygulama sayfaları ve yönlendirme (Expo Router)
│   ├── (tabs)/          # Alt navigasyon sekmeleri (Ana Sayfa, Kitaplar, Ayarlar)
│   ├── _layout.tsx      # Ana düzen yapılandırması
│   └── ...
├── components/          # Yeniden kullanılabilir UI bileşenleri
│   ├── BarcodeScannerModal.tsx
│   └── ...
├── config/              # Yapılandırma dosyaları
├── constants/           # Sabit değerler (Renkler, Temalar)
├── context/             # React Context (Auth, Theme, Books, Credits)
├── services/            # İş Mantığı ve API servisleri
│   ├── GoogleBooksService.ts
│   └── RecommendationService.ts
└── hooks/               # Özel React Hook'ları
```

## ❓ Sık Sorulan Sorular (FAQ)

### Neden uygulama dilini değiştirdiğimde kitap adları değişmiyor?

Uygulama dili (Türkçe/İngilizce) sadece **arayüz elementlerini** (butonlar, menüler, bildirimler) etkiler.

**Kitap başlıkları ve yazar isimleri** değişmez çünkü:

- Google Books'tan gelen veriler orijinal dilde saklanır
- Kitabın orijinal adını korumak daha doğrudur
- Goodreads, Kindle gibi benzer uygulamalar da aynı yaklaşımı kullanır

Örnek: "Kongoya Ağıt" kitabını eklerseniz, uygulama İngilizce olsa bile kitap adı "Kongoya Ağıt" olarak kalır.

### Neden bazı kitaplar barkod tarandığında bulunamıyor?

Barkod araması şu stratejiyi kullanır:

1. Google Books API'de arama
2. ISBN-10 ↔ ISBN-13 otomatik dönüştürme
3. Open Library API'de fallback arama

Buna rağmen bazı kitaplar bulunamayabilir:

- Yeni çıkan kitaplar henüz veritabanlarında olmayabilir
- Bazı yayınevleri dijital erişimi kısıtlamış olabilir
- Özel baskılar/nadir kitaplar kayıtlı olmayabilir

**Çözüm:** "Manuel Giriş" sekmesinden kitabı kendiniz ekleyebilirsiniz.

### Arama sonuçlarında alakasız kitaplar neden çıkıyor?

Uygulama artık daha akıllı arama kullanıyor:

1. İlk önce kitap başlığında (`intitle:`) arama yapar
2. Sonuç yoksa genel aramaya döner
3. Seçilen dildeki kitapları öne çıkarır

Bu iyileştirmeler en son sürümde eklenmiştir. Eski sürümü kullanıyorsanız güncelleyin.

### Kredi sistemi nasıl çalışıyor?

- Başlangıçta **10 kredi** verilir
- Her "Sihirli Öneri" **1 kredi** harcar
- Reklam izleyerek **+5 kredi** kazanabilirsiniz
- Krediler cihazınızda yerel olarak saklanır

---

**Geliştirici:** [Cheleby](mailto:chelebyapp@gmail.com)  
**Lisans:** MIT
