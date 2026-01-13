# Utils Knowledge Base

## OVERVIEW

Pure utility functions for data processing and helper operations.

## STRUCTURE

```
utils/
├── isbnConverter.ts       # ISBN-10 ↔ ISBN-13 conversion
├── stringUtils.ts         # String manipulation
├── errorUtils.ts         # Error logging
├── fetchWithTimeout.ts   # Network timeout wrapper
├── email.ts              # Email validation
└── cn.ts                 # className merging
```

## WHERE TO LOOK

| Task                 | Location              | Notes                                                       |
| -------------------- | --------------------- | ----------------------------------------------------------- |
| **ISBN conversion**  | `isbnConverter.ts`    | convertISBN10ToISBN13, convertISBN13ToISBN10, normalizeISBN |
| **String utils**     | `stringUtils.ts`      | normalizeForMatching, search scoring                        |
| **Error handling**   | `errorUtils.ts`       | logError function                                           |
| **Network utils**    | `fetchWithTimeout.ts` | Timeout wrapper for fetch                                   |
| **Email validation** | `email.ts`            | Email regex validation                                      |
| **CSS merging**      | `cn.ts`               | clsx + tailwind-merge combo                                 |

## CONVENTIONS

- **Pure functions:** All utilities have no side effects
- **Error handling:** logError() for consistent error tracking
- **Type safety:** Full TypeScript types for all functions
- **Test coverage:** **tests** folder with .test.ts files
- **Utility exports:** Named exports for individual functions

## ANTI-PATTERNS

- **Side effects:** Never add side effects in utility functions
- **Silent failures:** Always throw or log errors appropriately
