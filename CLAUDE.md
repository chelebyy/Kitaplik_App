# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Kitaplık App (Ayraç)

Offline-first Expo/React Native mobile application for personal book collection management with barcode scanning, intelligent search across multiple APIs, AI-powered recommendations, and a credit/gamification system.

**App Name:** Ayraç | **Slug:** ayrac | **Package:** com.ayrac.app

## Quick Reference - Where to Look

| Task                  | Location      | Notes                                               |
| --------------------- | ------------- | --------------------------------------------------- |
| **Pages/Navigation**  | `app/`        | Expo Router file-based routing                      |
| **UI Components**     | `components/` | Modals, cards, scanner                              |
| **State Management**  | `context/`    | Auth, Books, Theme, Language, Credits, Notification |
| **API Integration**   | `services/`   | GoogleBooks, OpenLibrary, Backup, Recommendation    |
| **Utility Functions** | `utils/`      | ISBN conversion, string operations, error handling  |
| **Translations**      | `i18n/`       | react-i18next, tr/en locales                        |
| **Configuration**     | `./`          | package.json, tsconfig.json, tailwind.config.js     |

## Development Commands

```bash
# Development
npm run dev              # Start Expo dev server (EXPO_NO_TELEMETRY=1)
npm run android          # Run on Android device/emulator
npm run ios              # Run on iOS device/simulator

# Building
npm run build:web        # Export for web platform

# Quality & Testing
npm run lint             # Run ESLint
npm test                 # Run Jest tests
npm test -- --coverage   # With coverage
npm test -- book/SearchEngine.test.ts  # Run specific test file
npm run sonar:scan       # Run SonarQube analysis

# Type Checking (IMPORTANT: Run after changes)
npx tsc --noEmit         # TypeScript type checking
```

## High-Level Architecture

### Core Philosophy

- **Offline-first:** All data lives on device using AsyncStorage. No backend server.
- **Local authentication:** Users create a local profile with just a nickname (stored in Expo SecureStore).
- **External APIs only used for enrichment:** Google Books API and Open Library API are only called during add/search operations.

### Directory Structure

```
app/                    # Expo Router file-based routing
├── (tabs)/            # Tab navigation pages
├── _layout.tsx        # Root layout with all providers
├── add-book.tsx       # Modal for adding books
└── book-detail.tsx    # Book details page

components/            # Reusable UI components (modals, cards, etc.)
context/              # React Context providers (Auth, Books, Theme, Language, Credits, Notifications)
services/             # Business logic & API integrations (PURE TS - no React hooks)
hooks/                # Custom React hooks
utils/                # Pure utility functions
i18n/                 # Internationalization (TR/EN)
constants/            # App constants (colors, themes)
```

### Key Technologies

- **Expo SDK 54** (Managed Workflow) with **New Architecture Enabled**
- **React Native 0.81.5** with **React 19.1.0** (React Compiler enabled via `babel-plugin-react-compiler`)
- **TypeScript 5.9.3** (strict mode)
- **Expo Router 6** (file-based routing with typedRoutes experiment)
- **NativeWind 4.2.1** (Tailwind CSS for React Native)
- **Lucide React Native** for icons
- **Hermes JS Engine** for improved performance

### State Management

Six React Context providers wrap the app in `app/_layout.tsx`:

1. **LanguageProvider** - TR/EN language switching
2. **ThemeProvider** - Dark/light mode with system preference
3. **AuthProvider** - Local user profile management (no backend)
4. **BooksProvider** - Book CRUD operations with debounced persistence
5. **CreditsProvider** - Gamification system (daily credits, ad rewards)
6. **NotificationProvider** - Push notifications

### Search Architecture

The `SearchEngine` service orchestrates multiple APIs:

1. Detect ISBN (10 or 13 digits)
2. If ISBN: Direct precise search
3. If text: Smart search strategy - `intitle:` first → general search → OpenLibrary fallback
4. Merge results with `BookMergeService` (smart data enrichment)
5. Score by relevance (cover, language, metadata)
6. Sort by score (highest first)

### Splash Screen Sequence

Three-stage splash system:

1. **Native Splash** (expo-splash-screen) - Visible until resources load
2. **AnimatedSplash** (Lottie animation) - Brand transition
3. **App Content** - Main application

### Credit & Gamification System

- **Starting Balance:** 10 credits
- **Daily Credit:** +1 credit on app open (auto-claimed)
- **Usage:** -1 credit per "Magic Recommendation"
- **Rewards:** +5 credits per ad watched (AdMob rewarded ads)

## Code Conventions

### Language Rules (STRICT)

- **Code Variables:** English (`bookList`, `fetchDetails`, `useBookSearch`)
- **Comments/Commits:** Turkish (`// Kitap verisi çekiliyor`, `feat: yeni özellik eklendi`)
- **UI Text:** MUST use i18n keys (`t('common.save')`). No hardcoded strings.
- **Book titles/authors:** Remain in original language from API (not translated)

### Code Patterns

- **Path Aliases:** `@/*` → root directory (configured in `tsconfig.json`)
- **Component Naming:** PascalCase (`BookCard`, `BarcodeScannerModal`)
- **Service Pattern:** Object-based exports, async/await functions
- **Context Pattern:** Each context exports Provider and custom hook
- **Styling:** Use `className` (Tailwind). Avoid `StyleSheet.create`.
- **Theme:** Use `useTheme()` hook for dynamic colors
- **Memoization:** React Compiler enabled - manual `useMemo`/`useCallback` rarely needed

### Anti-Patterns to Avoid

- **Large Components:** Files >500 lines need refactoring
  - `add-book.tsx` (885 lines)
  - `settings.tsx` (824 lines)
  - `RecommendationModal.tsx` (571 lines)
- **React Hooks in Services:** Services must be pure TypeScript (no React hooks)
- **Blocking Operations:** Always use `await` for AsyncStorage operations
- **Firebase Auth:** DEPRECATED - Use local auth (AuthContext + AsyncStorage)
- **Console.log:** Removed in production via babel plugin (babel.config.js:18)
- **Silent Failures:** Always log errors using `logError()` from utils for API calls
- **Race Conditions:** Cancel pending requests on component unmount

### Modal Pattern

All modal components follow this structure:

```tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  // ... other props
}
```

## Key Services

| Service                   | Purpose                                                                        |
| ------------------------- | ------------------------------------------------------------------------------ |
| **GoogleBooksService**    | Primary book data API (smart search: intitle → general → OpenLibrary fallback) |
| **OpenLibraryService**    | Fallback/enrichment API                                                        |
| **SearchEngine**          | Unified search interface with ISBN detection                                   |
| **BookMergeService**      | Smart data merging from multiple sources                                       |
| **RecommendationService** | AI-powered book suggestions                                                    |
| **BackupService**         | Data export/import (JSON) using expo-document-picker + expo-sharing            |
| **PriceService**          | Turkish bookstore price comparison links                                       |
| **StorageService**        | Abstraction over AsyncStorage                                                  |
| **NotificationService**   | Push notification management                                                   |
| **CrashlyticsService**    | Firebase Crashlytics integration                                               |

### SearchEngine Usage Examples

```typescript
// ISBN ile zenginleştirilmiş arama (merge + scoring)
const results = await SearchEngine.searchByIsbnEnriched("9786053609421", "tr");

// Metin araması + otomatik merge
const books = await SearchEngine.search("Sefiller", "tr", "book");

// AbortSignal ile iptal edilebilir arama
const controller = new AbortController();
const results = await SearchEngine.searchByIsbnEnriched("9786053609421", "tr", {
  signal: controller.signal,
});
```

## Testing

### Setup

- **Jest 29.7.0** with jest-expo preset
- **React Native Testing Library**

### Key Mocks (jest.setup.js)

- `react-native-reanimated` - Replaced with mock
- `@react-native-async-storage/async-storage` - Mocked
- `expo-router` - Router mocked
- `expo-secure-store` - Mocked
- `react-native-google-mobile-ads` - Test IDs provided

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage
npm test -- book/SearchEngine.test.ts  # Run specific test file
```

## Data Models

### Book Interface

```typescript
interface Book {
  id: string; // Timestamp-based
  title: string;
  author: string;
  status: BookStatus; // "Okunacak" | "Okunuyor" | "Okundu"
  coverUrl: string;
  genre?: string;
  progress?: number; // 0-1 range
  pageCount?: number;
  currentPage?: number;
  notes?: string;
  addedAt: number; // Timestamp
}
```

### Book Status Types

- `"Okunacak"` - To Read
- `"Okunuyor"` - Currently Reading
- `"Okundu"` - Read

## Important Documentation

| File            | Purpose                                        |
| --------------- | ---------------------------------------------- |
| **CLAUDE.md**   | This file - quick reference for AI agents      |
| **GEMINI.md**   | Senior dev guidelines & golden sample patterns |
| **AGENTS.md**   | Project knowledge base for agents              |
| **PRD.md**      | Product Requirements Document                  |
| **README.md**   | User-facing documentation with FAQ             |
| **GEMINIDOCS/** | Technical analysis & architecture docs         |
| **docs/**       | Roadmaps & implementation plans                |

## Before Making Changes

1. Run `npx tsc --noEmit` to check for TypeScript errors
2. Run `npm run lint` to check code quality
3. Run `npm test` to ensure tests pass

## After Making Changes

1. Test on device/simulator
2. Run type checking again
3. Update tests if needed
4. Update i18n files (`i18n/locales/tr.json` & `en.json`) if UI text changed
5. Commit with Turkish commit messages

## External Services

- **Google Books API** (Read-only) - Primary book data source (rate limit: use throttling for rapid searches)
- **Open Library API** - Fallback/enrichment
- **Expo Camera** - Barcode scanning
- **AdMob** - Rewarded ads for credits (+5 per ad watched)
- **Firebase** - Analytics, Crashlytics, Performance monitoring (no user data stored)

## Important Implementation Details

### Barcode Search Strategy

When a book is not found via barcode:

1. Google Books API search
2. ISBN-10 ↔ ISBN-13 automatic conversion
3. Open Library API fallback search
4. Manual entry option if all fail

### Language Handling

- **UI elements:** Change with app language (buttons, menus, notifications)
- **Book titles/authors:** Remain in original language from API (NOT translated)
- **Search results:** Filtered by user's language preference where possible

### Service Layer Conventions

- Object-based exports with async functions
- Always use `logError()` from utils for error handling
- Use `fetchWithTimeout()` for all API calls
- Test structure: `__tests__` folders with `.test.ts` files
