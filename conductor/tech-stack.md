# Technology Stack

This document outlines the core technologies used in the Kitaplık App project.

## 1. Core Platform & Framework

- **Platform:** [Expo](https://expo.dev) (Managed Workflow)
- **Framework:** React Native
- **Language:** TypeScript (Strict mode enabled)

## 2. Navigation & Routing

- **Routing:** Expo Router (File-based navigation)
- **Tabs:** Bottom Tabs implementation via `@react-navigation/bottom-tabs`

## 3. UI & Styling

- **Styling:** NativeWind (Tailwind CSS engine for React Native)
- **Utilities:** `clsx`, `tailwind-merge` for class management
- **Icons:** `lucide-react-native`
- **Animations:** `lottie-react-native`, `react-native-reanimated`

## 4. State Management & Data

- **Global State:** React Context API (Auth, Theme, Books, Credits, Language)
- **Persistence:** `@react-native-async-storage/async-storage` (Offline-first architecture)
- **Logic:** Redux Toolkit (Included for complex state needs)

## 5. External Services & APIs

- **Book Data:** Google Books API
- **Camera/Scanning:** `expo-camera`
- **Monetization:** `react-native-google-mobile-ads` (AdMob)

## 6. Globalization

- **I18n:** `i18next`, `react-i18next`
- **Locales:** Turkish (TR), English (EN)

## 7. Development & Tooling

- **Linting:** ESLint (Expo config)
- **Formatting:** Prettier (via ESLint)
- **Building:** EAS (Expo Application Services)
