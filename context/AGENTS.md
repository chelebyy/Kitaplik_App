# Context Knowledge Base

## OVERVIEW

React Context providers for global state management.

## STRUCTURE

```
context/
├── BooksContext.tsx       # Book CRUD (303 lines)
├── AuthContext.tsx        # Offline authentication
├── ThemeContext.tsx       # Dark/light mode
├── LanguageContext.tsx    # i18next TR/EN
├── CreditsContext.tsx     # Credit system
└── NotificationContext.tsx # Push notifications
```

## WHERE TO LOOK

| Task                | Location                  | Notes                                             |
| ------------------- | ------------------------- | ------------------------------------------------- |
| **Book management** | `BooksContext.tsx`        | addBook, updateBook, deleteBook with AsyncStorage |
| **Authentication**  | `AuthContext.tsx`         | Local auth via AsyncStorage/SecureStore           |
| **Theme**           | `ThemeContext.tsx`        | isDarkMode, colors object                         |
| **Language**        | `LanguageContext.tsx`     | useTranslation wrapper                            |
| **Credits**         | `CreditsContext.tsx`      | 10 initial, +1 daily, -1 per recommendation       |
| **Notifications**   | `NotificationContext.tsx` | Push token management                             |

## CONVENTIONS

- **Provider pattern:** Each file exports Provider and custom hook (use\*)
- **Storage keys:** Named constants (e.g., BOOKS_STORAGE_KEY)
- **Initial state:** Default values defined in context
- **Persistence:** All state synced with AsyncStorage/SecureStore
- **Loading states:** Boolean isLoading for async operations
- **Test structure:** **tests** folder with .test.tsx files
- **Type safety:** Full TypeScript interfaces for context values

## ANTI-PATTERNS

- **Direct storage access:** Never use AsyncStorage directly from components
- **Missing context checks:** Always check if context is defined
- **Hydration races:** Use isLoading to prevent rendering before data ready
