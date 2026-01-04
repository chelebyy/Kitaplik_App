# 🧪 Test Ortamı Onarım Kılavuzu (Jest & Expo)

## 🚨 Mevcut Sorun

Projede `npm test` komutu çalıştırıldığında, **`react-native-google-mobile-ads`** kütüphanesinin native modüllerine erişmeye çalışması nedeniyle testler çökmektedir. Jest (Test ortamı) bir cihaz simülasyonu olmadığı için native kodları çalıştıramaz; bu modüllerin "taklit edilmesi" (mocking) gerekir.

**Hata Örneği:**

```
TypeError: Cannot read properties of undefined (reading 'create')
```

## 🛠️ Çözüm Adımları

Testlerin sağlıklı çalışması için aşağıdaki adımları uygulayınız:

### 1. `jest.setup.js` Dosyasını Güncelleme

Proje ana dizinindeki `jest.setup.js` dosyasını açın ve aşağıdaki mock tanımlarını ekleyin/güncelleyin:

```javascript
// jest.setup.js
import "react-native-gesture-handler/jestSetup";

// Google Mobile Ads Mock
jest.mock("react-native-google-mobile-ads", () => ({
  TestIds: {
    BANNER: "ca-app-pub-3940256099942544/6300978111",
    INTERSTITIAL: "ca-app-pub-3940256099942544/1033173712",
    REWARDED: "ca-app-pub-3940256099942544/5224354917",
    REWARDED_INTERSTITIAL: "ca-app-pub-3940256099942544/5354046379",
  },
  BannerAd: "BannerAd",
  BannerAdSize: {
    BANNER: "BANNER",
  },
  InterstitialAd: {
    createForAdRequest: jest.fn(() => ({
      load: jest.fn(),
      show: jest.fn(),
      addAdEventListener: jest.fn(),
    })),
  },
  RewardedAd: {
    createForAdRequest: jest.fn(() => ({
      load: jest.fn(),
      show: jest.fn(),
      addAdEventListener: jest.fn(),
    })),
  },
  RewardedInterstitialAd: {
    createForAdRequest: jest.fn(() => ({
      load: jest.fn(),
      show: jest.fn(),
      addAdEventListener: jest.fn(),
    })),
  },
  AdEventType: {
    LOADED: "loaded",
    ERROR: "error",
    OPENED: "opened",
    CLOSED: "closed",
  },
  RewardedAdEventType: {
    LOADED: "loaded",
    EARNED_REWARD: "earned_reward",
  },
}));

// Expo Router Mock (Eğer router hataları alırsanız)
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: "Link",
}));

// Expo SecureStore Mock
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

/**
 * Sessizleştirmeler
 * Test sırasında gereksiz console loglarını gizler
 */
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === "string" && /Warning:/.test(args[0])) return;
  originalConsoleError(...args);
};
```

### 2. `package.json` Jest Ayarlarını Kontrol Etme

`package.json` içindeki `transformIgnorePatterns` ayarının native modülleri kapsadığından emin olun (Mevcut ayarınız genelde doğru görünmektedir, ancak `react-native-google-mobile-ads` eklendiğinden emin olun).

```json
"transformIgnorePatterns": [
  "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|nativewind|react-native-svg|lucide-react-native|react-native-google-mobile-ads)"
]
```

_(Not: `lucide-react-native` sonrasına `|react-native-google-mobile-ads` eklendi)_

### 3. Testleri Tekrar Çalıştırma

Yapılandırmayı kaydettikten sonra terminalden:

```bash
npm test
# veya önbelleği temizleyerek:
npm test -- --clearCache
```

Bu adımlar uygulandığında "Cannot read properties of undefined" hatası çözülecektir.
