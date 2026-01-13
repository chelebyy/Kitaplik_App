# Track Spec: Geliştirici İletişim Modülü

## 1. Genel Bakış (Overview)

Kullanıcıların geliştiriciye hata raporu, öneri, istek veya diğer konular hakkında doğrudan e-posta yoluyla ulaşabilmesini sağlayan bir iletişim seçeneğinin eklenmesi.

## 2. Fonksiyonel Gereksinimler (Functional Requirements)

- **Erişim Noktası:** Ayarlar (Settings) sekmesine "Geliştiriciye Ulaş" veya "Geri Bildirim" adında yeni bir seçenek eklenecek.
- **İletişim Yöntemi:** Seçeneğe tıklandığında cihazın varsayılan e-posta istemcisi (`mailto:`) açılacak.
- **E-posta Şablonu:**
  - **Alıcı:** Geliştiricinin e-posta adresi (Sabit bir adres belirlenecek).
  - **Konu (Subject):** "Kitaplık App - Geri Bildirim" şeklinde otomatik doldurulacak.
  - **İçerik (Body):** Kullanıcının kolayca seçebilmesi için şu başlıkları içeren bir şablon eklenecek:
    - [ ] Hata (Bug)
    - [ ] Öneri
    - [ ] İstek
    - [ ] Diğer
    - Mesajınız: ...

## 3. Teknik Detaylar (Technical Design)

- **Kütüphane:** Expo'nun `expo-linking` kütüphanesi kullanılarak `Linking.openURL` ile `mailto:` protokolü tetiklenecek.
- **Konum:** `app/(tabs)/settings.tsx` dosyasına yeni bir `Pressable` veya `TouchableOpacity` bileşeni eklenecek.
- **Uluslararasılaştırma (i18n):** Tüm metinler `en.json` ve `tr.json` dosyalarına eklenecek.

## 4. Kabul Kriterleri (Acceptance Criteria)

- Ayarlar sekmesinde iletişim seçeneği görünür olmalı.
- Seçeneğe tıklandığında e-posta uygulaması doğru alıcı, konu ve taslak içerikle açılmalı.
- E-posta içeriğinde "Hata, Öneri, İstek ve Diğer" seçenekleri yer almalı.

## 5. Kapsam Dışı (Out of Scope)

- Uygulama içi özel bir mesajlaşma/chat sistemi.
- Sunucu tabanlı bir geri bildirim formu.
