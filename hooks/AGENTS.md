# Hooks Knowledge Base

## OVERVIEW

Custom React hooks for encapsulating logic and state management.

## STRUCTURE

```
hooks/
├── book/               # Domain-specific hooks
│   ├── useBookDetails.ts
│   ├── useBookSearch.ts
│   └── useRecommendation.ts
├── useBackup.ts        # Backup logic
├── useDebounce.ts      # Input throttling
└── useFrameworkReady.ts # Initialization
```

## WHERE TO LOOK

| Task                  | Location               | Notes                         |
| --------------------- | ---------------------- | ----------------------------- |
| **Book Operations**   | `hooks/book/`          | Domain logic split by feature |
| **Search Throttling** | `useDebounce.ts`       | Prevents API spam             |
| **App Init**          | `useFrameworkReady.ts` | Splash screen & font loading  |
| **Data Sync**         | `useBackup.ts`         | Export/Import logic           |

## CONVENTIONS

- **Prefix:** All hooks start with `use`.
- **Composition:** Hooks compose other hooks (e.g., useBookSearch uses useDebounce).
- **Return Types:** Explicit interfaces for return values.
- **Testing:** Unit tests in `__tests__` directories.

## ANTI-PATTERNS

- **Huge Hooks:** Don't put everything in one file (see `hooks/book/` split).
- **Side Effects:** Avoid hidden side effects; allow controlling execution.
