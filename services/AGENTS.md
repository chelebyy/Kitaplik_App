# Services Knowledge Base

## OVERVIEW

API integrations, business logic layer, and data processing services.

## STRUCTURE

```
services/
├── GoogleBooksService.ts     # Main search with fallback (315 lines)
├── OpenLibraryService.ts     # Secondary search API
├── RecommendationService.ts  # AI-powered recommendations
├── BackupService.ts         # Data backup/restore
├── PriceService.ts           # Price comparison logic
├── SearchEngine.ts           # Unified search interface
├── NotificationService.ts    # Push notification handling
└── __tests__/                # Service tests
```

## WHERE TO LOOK

| Task                 | Location                   | Notes                                                  |
| -------------------- | -------------------------- | ------------------------------------------------------ |
| **Book search**      | `GoogleBooksService.ts`    | Smart search: intitle → general → OpenLibrary fallback |
| **Fallback search**  | `OpenLibraryService.ts`    | When Google Books fails                                |
| **Recommendations**  | `RecommendationService.ts` | AI-based book suggestions                              |
| **Backup/restore**   | `BackupService.ts`         | expo-document-picker + expo-sharing                    |
| **Price comparison** | `PriceService.ts`          | Turkish bookstore links                                |
| **Search engine**    | `SearchEngine.ts`          | Unified search interface                               |
| **Notifications**    | `NotificationService.ts`   | Push notification management                           |

## CONVENTIONS

- **Service pattern:** Object-based exports with async functions
- **Error handling:** Always use logError() from utils
- **Network requests:** fetchWithTimeout() for all API calls
- **Search strategy:** Google Books (intitle/inauthor) → General → OpenLibrary
- **ISBN conversion:** Use isbnConverter utils for 10/13 conversion
- **Language filtering:** Results filtered by user's language preference
- **Test structure:** **tests** folder with .test.ts files

## ANTI-PATTERNS

- **Silent failures:** Always log errors, never silently fail API calls
- **Race conditions:** Cancel pending requests on component unmount
- **Hardcoded URLs:** Use constants for API endpoints
