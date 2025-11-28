# Kitaplık App

Kişisel kitap koleksiyonunuzu yönetmek, okuma alışkanlıklarınızı takip etmek ve yeni kitap önerileri almak için geliştirilmiş, Expo tabanlı modern bir mobil uygulama.

## 🚀 Özellikler

*   **Kitap Yönetimi**: Kitaplığınızdaki kitapları ekleyin, düzenleyin ve detaylarını görüntüleyin.
*   **Barkod Okuyucu**: Kitapları hızlıca eklemek için kameranızı kullanarak barkodları tarayın (`expo-camera`).
*   **Öneri Sistemi**: Google Books API entegrasyonu ile okuma zevkinize uygun kitap önerileri alın.
*   **Kullanıcı Doğrulama**: Firebase Authentication ile güvenli giriş ve hesap yönetimi.
*   **Karanlık/Aydınlık Mod**: Tercihinize göre tema desteği (`ThemeContext`).
*   **Modern Arayüz**: Akıcı geçişler ve kullanıcı dostu tasarım (Expo Router, Lucide Icons).

## 🛠️ Teknolojiler

*   **Platform**: [Expo](https://expo.dev) (React Native)
*   **Dil**: TypeScript
*   **Yönlendirme**: Expo Router
*   **Backend**: Firebase (Auth, Firestore)
*   **API**: Google Books API
*   **UI**: Lucide React Native, Tailwind (nativewind/clsx)

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın**:
    ```bash
    git clone <repo-url>
    cd Kitaplik_App
    ```

2.  **Bağımlılıkları Yükleyin**:
    ```bash
    npm install
    # veya
    yarn install
    ```

3.  **Firebase Yapılandırması**:
    `config/firebaseConfig.ts` dosyasını kendi Firebase proje bilgilerinizle güncelleyin.

4.  **Uygulamayı Başlatın**:
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
├── config/              # Yapılandırma dosyaları (Firebase vb.)
├── constants/           # Sabit değerler (Renkler, Temalar)
├── context/             # React Context (Auth, Theme, Books)
├── services/            # API ve Backend servisleri
│   ├── FirestoreService.ts
│   └── RecommendationService.ts
└── hooks/               # Özel React Hook'ları
```
