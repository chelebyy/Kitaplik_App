# Kitaplik_App Context & Instructions

This file serves as the primary context for the Gemini CLI agent when working on the `Kitaplik_App` project.

## 1. Project Overview

**Kitaplik_App** is a mobile application designed for personal library management. It allows users to track their book collection, discover new books via recommendations, and manage reading statuses.

*   **Type:** Mobile Application (Cross-platform iOS/Android via Expo).
*   **Primary Language:** TypeScript.
*   **Framework:** React Native (Expo SDK 50+).
*   **Navigation:** Expo Router (File-based routing).
*   **Backend/Database:** Firebase (Authentication, Firestore).
*   **External Integrations:** Google Books API (for book data and recommendations), Expo Camera (Barcode scanning).
*   **Styling:** Custom Theme Context + Tailwind-like utility classes (clsx) and Lucide Icons.

## 2. Architecture & Directory Structure

The project follows a standard Expo Router structure with separation of concerns for logic and UI.

*   `app/`: Contains all screens and navigation logic.
    *   `(tabs)/`: Main tab navigation layout (Home, Books, Settings).
    *   `_layout.tsx`: Root layout handling global providers (Auth, Theme, Books).
*   `components/`: Reusable UI components (e.g., `BarcodeScannerModal`, `FilterDropdown`).
*   `context/`: Global state management using React Context API.
    *   `AuthContext`: User session state.
    *   `BooksContext`: User's book collection state.
    *   `ThemeContext`: Dark/Light mode state.
*   `services/`: Business logic and API interactions.
    *   `FirestoreService`: Abstraction layer for Firebase operations.
    *   `RecommendationService`: Google Books API logic.
*   `config/`: Configuration files (Firebase initialization).
*   `constants/`: App-wide constants (Colors, Theme definitions).

## 3. Building & Running

### Prerequisites
*   Node.js (LTS recommended)
*   npm or yarn
*   Expo Go app on mobile device or Android/iOS Emulator.

### Commands
*   **Start Development Server:**
    ```bash
    npm run dev
    # or
    npx expo start
    ```
*   **Linting:**
    ```bash
    npm run lint
    ```
*   **Build for Web:**
    ```bash
    npm run build:web
    ```

## 4. Development Conventions

*   **Language:** All documentation, comments, and UI strings must be in **Turkish** (Türkçe).
*   **Type Safety:** Strict TypeScript usage. Interfaces should be defined for all data models (e.g., `Book`, `User`).
*   **State Management:** Prefer React Context for global state and local `useState`/`useReducer` for component state.
*   **Async Handling:** Use `async/await` for all API and Database calls. Handle errors gracefully with user feedback (Alerts or Toast messages).
*   **Styling:** Use the `useTheme` hook to access dynamic colors respecting the user's Dark/Light mode preference.
*   **Imports:** Use relative imports or strictly follow `tsconfig.json` paths if configured.

## 5. Key Integrations

### Firebase
*   Configuration is located in `config/firebaseConfig.ts`.
*   Security rules should ensure users can only access/modify their own data (`users/{userId}/books`).

### Google Books API
*   Used in `RecommendationService.ts`.
*   Base URL: `https://www.googleapis.com/books/v1/volumes`.

## 6. Current Status
*   **Documentation:** `README.md` and `GEMINIDOCS/STRUCTURE.md` are up to date.
*   **Core Features:** Auth, Book Listing, Barcode Scanning, and Recommendations are implemented.
