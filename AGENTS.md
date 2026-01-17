# AGENTS.md - AI Agent Instructions

**Project:** Ayraç (Kitaplık App)  
**Stack:** Expo 54 / React Native 0.81 / TypeScript 5.9 / NativeWind 4  
**Architecture:** Offline-first with AsyncStorage, Google Books API, Firebase Analytics

---

## COMMANDS

```bash
# Development
npm run dev              # Start Expo dev server
npm run android          # Build & run Android
npm run ios              # Build & run iOS
npm run build:web        # Export for web

# Quality
npm run lint             # ESLint (expo lint)
npx tsc --noEmit         # Type check

# Testing
npm test                 # Run all tests (Jest)
npm test -- --watch      # Watch mode
npm test -- <pattern>    # Single test: npm test -- useBookSearch
npm test -- --testPathPattern="services/__tests__/GoogleBooksService"  # Specific file
npm test -- --coverage   # Coverage report
```

---

## PROJECT STRUCTURE

```
app/              # Expo Router pages (file-based routing)
├── (tabs)/       # Bottom tab navigation (index, books, settings)
├── add-book.tsx  # Modal: barcode/search/manual entry
└── book-detail.tsx
components/       # Reusable UI (BookCard, Modals, etc.)
context/          # React Context providers (BooksContext, ThemeContext, etc.)
services/         # API clients & business logic (GoogleBooksService, etc.)
hooks/            # Custom hooks (useDebounce, useBookSearch, etc.)
utils/            # Pure helper functions (isbnConverter, errorUtils, cn)
i18n/             # Localization (TR/EN via react-i18next)
```

---

## CODE STYLE

### Imports (Order)

```typescript
// 1. React & React Native
import React, { useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";

// 2. Expo modules
import { Image } from "expo-image";
import { useRouter } from "expo-router";

// 3. Third-party libraries
import { useTranslation } from "react-i18next";

// 4. Internal: context, hooks, services, utils
import { useTheme } from "@/context/ThemeContext";
import { useBooks } from "@/context/BooksContext";
import { logError } from "@/utils/errorUtils";

// 5. Components & types
import { BookCard } from "@/components/BookCard";
import type { Book } from "@/context/BooksContext";
```

### Naming Conventions

| Type             | Convention                       | Example                                   |
| ---------------- | -------------------------------- | ----------------------------------------- |
| Components       | PascalCase                       | `BookCard.tsx`, `RecommendationModal.tsx` |
| Hooks            | camelCase with `use` prefix      | `useBookSearch.ts`, `useDebounce.ts`      |
| Services         | PascalCase with `Service` suffix | `GoogleBooksService.ts`                   |
| Utils            | camelCase                        | `isbnConverter.ts`, `errorUtils.ts`       |
| Contexts         | PascalCase with `Context` suffix | `BooksContext.tsx`                        |
| Types/Interfaces | PascalCase                       | `Book`, `BookStatus`, `GoogleBookResult`  |
| Constants        | SCREAMING_SNAKE_CASE             | `BOOKS_STORAGE_KEY`, `BASE_URL`           |

### TypeScript

- **Strict mode enabled** (`tsconfig.json`)
- Use `@/` path alias for imports (configured in tsconfig)
- Define explicit interfaces for props, return types, context values
- Avoid `any` - use `unknown` and type guards when needed
- Export types alongside implementations

### Styling

- **NativeWind (Tailwind)** for styling: `className="flex-row items-center px-4"`
- Use `cn()` utility for conditional classes: `cn("text-sm", isDarkMode && "text-white")`
- Theme colors via `useTheme()`: `style={{ color: colors.text }}`
- Icons: `lucide-react-native` (e.g., `<Sun size={20} color={colors.text} />`)

---

## ERROR HANDLING

```typescript
// Always use logError() for consistent error tracking
import { logError } from "@/utils/errorUtils";

try {
  const result = await fetchData();
} catch (error) {
  logError("ComponentName.methodName", error);
  // Handle gracefully - show user-friendly message
}
```

- `logError()` logs full error in dev, sanitized in production + Crashlytics
- Never silently swallow errors in catch blocks
- AbortError is expected (request cancellation) - handle separately:
  ```typescript
  if (error instanceof Error && error.name !== "AbortError") {
    logError("Context", error);
  }
  ```

---

## STATE MANAGEMENT

### Context Pattern

```typescript
// Provider exports: BooksProvider (component) + useBooks (hook)
// NEVER export raw Context - always use custom hook
export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooks must be used within BooksProvider");
  }
  return context;
}
```

### Storage Access

- **NEVER** call AsyncStorage directly in components
- Always use Context actions: `addBook()`, `updateBook()`, `deleteBook()`
- Storage keys are constants: `BOOKS_STORAGE_KEY`

---

## SERVICE PATTERN

```typescript
// Object-based exports with async methods
export const GoogleBooksService = {
  searchBooks: async (
    query: string,
    lang: string = "tr",
  ): Promise<GoogleBookResult[]> => {
    // Implementation
  },
  searchByIsbn: async (isbn: string): Promise<GoogleBookResult | null> => {
    // Implementation
  },
};
```

- Use `fetchWithRetry()` for network requests (handles timeout, retries)
- Support `AbortSignal` for request cancellation
- Fallback strategy: Google Books → Open Library

---

## TESTING

### Test Location

Tests live in `__tests__/` folders next to source files:

```
hooks/book/__tests__/useBookSearch.test.ts
services/__tests__/GoogleBooksService.test.ts
context/__tests__/BooksContext.test.tsx
```

### Test Structure

```typescript
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("useBookSearch", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  it("should return initial state correctly", () => {
    // Arrange, Act, Assert
  });
});
```

### Mocking

- Mocks configured in `jest.setup.js`
- AsyncStorage, expo-router, reanimated pre-mocked
- Mock services with `jest.mock()` at top of test file

---

## ANTI-PATTERNS (AVOID THESE)

| Don't                           | Do Instead                                |
| ------------------------------- | ----------------------------------------- |
| Call AsyncStorage in components | Use Context hooks (`useBooks`, `useAuth`) |
| Write components > 500 lines    | Extract sub-components                    |
| Use Firebase Auth               | Use `AuthContext` (local auth)            |
| Suppress errors silently        | Always `logError()` and handle            |
| Use `any` type                  | Use `unknown` + type guards               |
| Hardcode API URLs               | Use constants (`BASE_URL`)                |
| Block UI without loading state  | Show loading indicator                    |

---

## UNIQUE PATTERNS

- **Splash Sequence:** Native → AnimatedSplash → App
- **Book ID:** Google Books ID or timestamp (manual entry)
- **Credits System:** +5 daily login, -1 per AI recommendation
- **Language:** UI translates (TR/EN), book titles stay original
- **Search Strategy:** intitle/inauthor → general → OpenLibrary fallback
- **ISBN Handling:** Auto-convert ISBN-10 ↔ ISBN-13

---

## QUICK REFERENCE

### Key Contexts

- `useBooks()` - Book CRUD, library state
- `useAuth()` - User authentication (offline)
- `useTheme()` - colors, isDarkMode, toggleTheme
- `useCredits()` - AI recommendation credits

### Key Services

- `GoogleBooksService` - Primary book search
- `OpenLibraryService` - Fallback search
- `RecommendationService` - AI suggestions
- `BackupService` - Data export/import

### Key Utilities

- `cn()` - className merging (clsx + tailwind-merge)
- `logError()` - Safe error logging
- `fetchWithRetry()` - Network requests with retry
- `normalizeISBN()`, `convertISBN10ToISBN13()` - ISBN utils
