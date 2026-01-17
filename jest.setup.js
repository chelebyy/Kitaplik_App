// React Native Gesture Handler
import "react-native-gesture-handler/jestSetup";

// Mock NativeWind
jest.mock("nativewind", () => ({
  styled: (Component) => Component,
  useColorScheme: () => ({
    colorScheme: "light",
    setColorScheme: jest.fn(),
  }),
}));

// Mock React Native Reanimated
jest.mock("react-native-reanimated", function mockReanimated() {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = function noop() {};
  return Reanimated;
});

// MMKV Mock
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map();

  return {
    createMMKV: jest.fn(() => ({
      getString: jest.fn((key) => mockStorage.get(key)),
      set: jest.fn((key, value) => mockStorage.set(key, value)),
      remove: jest.fn((key) => mockStorage.delete(key)),
      getAllKeys: jest.fn(() => Array.from(mockStorage.keys())),
      getBoolean: jest.fn((key) => mockStorage.get(key)),
      clearAll: jest.fn(() => mockStorage.clear()),
    })),
  };
});

// Mock Expo Modules
jest.mock("expo-linking", () => ({
  createURL: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useLocalSearchParams: () => ({}),
  Link: "Link",
}));

// Mock Localization
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "tr" }],
  locale: "tr-TR",
}));

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

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

// Firebase Mock
jest.mock("@react-native-firebase/app", () => ({
  firebase: {
    app: jest.fn(),
  },
}));

jest.mock("@react-native-firebase/crashlytics", () => ({
  getCrashlytics: jest.fn(() => ({
    setUserId: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
    recordError: jest.fn(),
    log: jest.fn(),
  })),
}));

jest.mock("@react-native-firebase/analytics", () => ({
  getAnalytics: jest.fn(() => ({
    logEvent: jest.fn(),
    setAnalyticsCollectionEnabled: jest.fn(),
  })),
}));

jest.mock("@react-native-firebase/perf", () => ({
  getPerformance: jest.fn(() => ({
    newTrace: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
    newHttpMetric: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      setRequestMethod: jest.fn(),
      setRequestResponse: jest.fn(),
      setHttpResponseCode: jest.fn(),
    })),
  })),
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
