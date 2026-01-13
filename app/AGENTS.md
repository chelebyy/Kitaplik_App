# App Pages Knowledge Base

## OVERVIEW

Expo Router file-based navigation with 3 tab screens, modal screens, and provider hierarchy.

## STRUCTURE

```
app/
├── (tabs)/              # Tab navigation group
│   ├── index.tsx       # Home screen (recommendations, stats)
│   ├── books.tsx       # Book library list with filters
│   ├── settings.tsx    # User settings and preferences
│   └── _layout.tsx     # Tab bar configuration
├── _layout.tsx         # Root layout with providers
├── add-book.tsx        # Add book modal (885 lines - large)
├── book-detail.tsx     # Book details view (405 lines)
└── +not-found.tsx      # 404 page
```

## WHERE TO LOOK

| Task                  | Location                  | Notes                                |
| --------------------- | ------------------------- | ------------------------------------ |
| **Home screen**       | `app/(tabs)/index.tsx`    | Stats, recommendations, recent books |
| **Book library**      | `app/(tabs)/books.tsx`    | Filter, search, book list            |
| **Settings**          | `app/(tabs)/settings.tsx` | Theme, language, data management     |
| **Add book flow**     | `app/add-book.tsx`        | 3 tabs: barkod, search, manual       |
| **Book details**      | `app/book-detail.tsx`     | Progress, notes, status updates      |
| **Navigation config** | `app/_layout.tsx`         | Provider hierarchy, splash flow      |
| **Tab bar**           | `app/(tabs)/_layout.tsx`  | Custom TabBar with LinearGradient    |

## CONVENTIONS

- **File-based routing:** Expo Router uses directory structure for routes
- **Tab naming:** (tabs) group creates bottom tab navigation
- **Modal screens:** add-book uses presentation: "modal"
- **Provider hierarchy:** Language → Theme → Auth → Books → Credits → Notification
- **Splash flow:** Native splash → AnimatedSplash → App (via RootLayoutContent)
- **Context consumption:** All screens use custom hooks from contexts
- **Internationalization:** useTranslation() for UI text

## ANTI-PATTERNS

- **Large files:** add-book.tsx (885 lines), settings.tsx (824 lines) - extract components
- **Direct AsyncStorage:** Never use directly - always go through contexts
- **Missing error boundaries:** Consider error boundaries for tab screens
