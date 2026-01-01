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
jest.mock("react-native-reanimated", () => {
    const Reanimated = require("react-native-reanimated/mock");
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock Async Storage
jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

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


