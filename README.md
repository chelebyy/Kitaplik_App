# Kitaplık App

Kişisel kitap koleksiyonunuzu yönetmek, okuma alışkanlıklarınızı takip etmek ve yeni kitap önerileri almak için geliştirilmiş, Expo tabanlı modern bir mobil uygulama.

## 🚀 Özellikler

* **Kitap Yönetimi**: Kitaplığınızdaki kitapları ekleyin, düzenleyin ve detaylarını görüntüleyin.
* **Barkod Okuyucu**: Kitapları hızlıca eklemek için kameranızı kullanarak barkodları tarayın (`expo-camera`).
* **Öneri Sistemi**: Google Books API entegrasyonu ile okuma zevkinize uygun kitap önerileri alın.
* **Çevrimdışı Kimlik Doğrulama**: Yerel depolama tabanlı, üyelik gerektirmeyen hızlı profil oluşturma.
* **Yapay Zeka Destekli Öneriler**: Okuma zevkinize uygun "Sihirli Öneri" sistemi.
* **Fiyat Karşılaştırma**: Popüler Türk mağazaları için "Akıllı Linkler" ile en ucuz kitabı bulma.
* **Veri Yedekleme & Geri Yükleme**: Dosya tabanlı yedekleme ve sistem paylaşımı (Drive, bulut vb.) ile veri güvenliği.
* **Karanlık/Aydınlık Mod**: Göz yorgunluğunu azaltan modern tema desteği.

## 🛠️ Teknolojiler

* **Platform**: [Expo](https://expo.dev) (React Native)
* **Dil**: TypeScript
* **Yönlendirme**: Expo Router
* **Veri Tabanı**: AsyncStorage (Offline-First)
* **API**: Google Books API
* **UI**: Lucide React Native, Tailwind (nativewind/clsx)

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
