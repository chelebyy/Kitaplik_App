# Geliştirme Planı - Yeni Özellikler (Dil & Fiyat Karşılaştırma)

Bu plan, Kitaplık Uygulaması için çoklu dil desteği ve kitap fiyat karşılaştırma özelliğinin uygulanması adımlarını içerir.

## 1. Dil Desteği (i18n)

**Hedef:** Uygulamanın Türkçe (varsayılan) ve İngilizce arasında geçiş yapabilmesini sağlamak.

### Bağımlılıklar

- `i18next`: Temel uluslararasılaştırma çerçevesi.
- `react-i18next`: i18next için React bağlamaları.
- `expo-localization`: Cihazın varsayılan dilini algılamak için.
- `intl-pluralrules`: Çoğullaştırma kuralları için çoklu dolgu (Android için gereklidir).

### Dil Desteği Uygulama Adımları

1. **Paketlerin Kurulumu:**

   ```bash
   npm install i18next react-i18next expo-localization intl-pluralrules
   ```

2. **Yapılandırma:**
   - i18next'i başlatmak için `i18n/i18n.ts` oluşturun.
   - Dil algılamayı yapılandırın ('tr'ye geri dönüş).
3. **Çeviri Dosyaları:**
   - `i18n/locales/tr.json` (Türkçe çeviriler) oluşturun.
   - `i18n/locales/en.json` (İngilizce çeviriler) oluşturun.
   - `app/`, `components/` ve `context/` içindeki tüm sabit kodlanmış dizeleri çıkarın ve JSON dosyalarına taşıyın.
4. **Bağlam/Durum:**
   - Kullanıcının dil tercihini yönetmek için `ThemeContext`'i güncelleyin veya yeni bir `LanguageContext` oluşturun (`AsyncStorage` ile kalıcı hale getirin).
5. **Arayüz Güncellemeleri:**
   - Metin dizelerini `useTranslation` kancasıyla değiştirin: `const { t } = useTranslation(); ... <Text>{t('welcome')}</Text>`.
   - Profil veya Ayarlar modunda bir "Dil / Language" geçişi ekleyin.

## 2. Kitap Fiyat Karşılaştırması

**Hedef:** Kullanıcıların çeşitli çevrimiçi perakendecilerden kitap fiyatlarını kontrol etmelerini sağlamak.

**Kısıt:** Özel bir arka uç kazıyıcı olmayan çevrimdışı öncelikli bir uygulama olarak, 3. taraf sitelerden gerçek zamanlı fiyat getirme (kazıma), mobil cihazlarda CORS ve bot korumaları nedeniyle teknik olarak zordur.

**Önerilen Çözüm (MVP):** "Akıllı Arama Bağlantıları"
Kırılabilecek hassas gerçek zamanlı fiyatları görüntülemek yerine, büyük Türk kitapçılarına doğrudan "Tek Dokunuşla Arama" bağlantıları sağlayacağız. Bu, kullanıcının her zaman en güncel fiyatı ve stok durumunu doğrudan satıcının sitesinde görmesini sağlar.

### Fiyat Karşılaştırma Uygulama Adımları

1. **Fiyat Servisi:**
   - `services/PriceService.ts` oluşturun.
   - Desteklenen perakendecilerin bir listesini tanımlayın (Kitapyurdu, D&R, Idefix, Amazon TR, NadirKitap, BKM Kitap).
   - Her mağaza için arama URL'leri oluşturan bir `getStoreLinks(bookTitle, isbn)` işlevi uygulayın.
2. **Arayüz Entegrasyonu:**
   - `app/book-detail.tsx` dosyasını güncelleyin.
   - Bir "Fiyat Karşılaştır" butonu ekleyin.
   - Bir `PriceComparisonModal` bileşeni oluşturun.
3. **Modal Tasarımı:**
   - Logoları/isimleri olan mağazaların bir listesini görüntüleyin.
   - Tıklandığında, o kitap için belirli arama sayfasını açmak üzere `Linking.openURL()` veya `WebBrowser.openBrowserAsync()` kullanın.
   - _İsteğe Bağlı:_ Google Books API bir `saleInfo.retailPrice` sağlıyorsa, bunu referans olarak görüntüleyin.

## 3. Önerilen Klasör Yapısı

Bu planın uygulanması için önerilen dosya ve klasör organizasyonu aşağıdaki gibidir:

```text
Kitaplik_App/
├── i18n/                        # [YENİ] Dil yapılandırma klasörü
│   ├── i18n.ts                  # [YENİ] Ayar dosyası (init)
│   └── locales/                 # [YENİ] Çeviri dosyaları
│       ├── tr.json              # [YENİ] Türkçe (Varsayılan)
│       └── en.json              # [YENİ] İngilizce
├── app/
│   └── _layout.tsx              # [GÜNCELLEME] i18n başlatması burada yapılacak
├── context/
│   └── LanguageContext.tsx      # [YENİ] Dil değişikliğini yönetecek context
├── services/
│   └── PriceService.ts          # [YENİ] Mağaza linklerini üreten mantık
└── components/
    └── PriceComparisonModal.tsx # [YENİ] Linkleri gösteren açılır pencere
```
