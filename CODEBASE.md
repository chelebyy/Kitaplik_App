# CODEBASE.md

> **Auto-generated project context.** Refreshed on every session start.

---

## Project Info

| Property | Value |
|----------|-------|
| **Project** | `Kitaplik_App` |
| **Framework** | `react-native` |
| **Type** | `node` |
| **OS** | Windows |
| **Path** | `C:\Users\muham\OneDrive\Belgeler\Kitaplik\Kitaplik_App` |

---

## Project Structure

> **Legend:** `file.ts <- A.tsx, B.tsx` = This file is **imported by** A.tsx and B.tsx.
> Directories with `[N files: ...]` are summarized to reduce size.
> [STATS] Showing 195 files. 12 dirs summarized, 5 dirs excluded (node_modules, etc.)


```
.agent/
  rules/
    README.md
    advanced-react-component-patterns.md
    advanced-typescript-patterns.md
    ai-prompt-engineer-agent.md
    architecture.md
    backend.md
    code-migration-agent.md
    code-review-agent.md
    core-orchestrator.md
    debugging-agent.md
    debugging.md
    dependency-management.md
    design-system.md
    documentation.md
    geo-specialist.md
    lyra-optimization-protocol.md
    mobile-performance-optimization.md
    mobile-security.md
    mobile.md
    multi-file-sync.md
    optimization.md
    performance-optimization-agent.md
    production-deployment.md
    quality-gates.md
    react-and-modern-javascript.md
    react-hooks-best-practices.md
    react-performance-optimization.md
    refactoring-agent.md
    refactoring.md
    security-audit-agent.md
    seo-specialist.md
    strong-reasoner-planner-agent.md
    tailwind-css-expert.md
    test-driven-development-tdd.md
    test-writing-agent.md
    testing.md
    typescript-strict-mode-and-safety.md
    typescript-tooling-and-ecosystem.md
    ultrathink.md
    unit-testing-best-practices.md
  tasks/
    sonarqube-fixes-v1.md
  workflows/
    README.md
    debug.md
    deploy.md
    docs.md
    front-fix.md
    geo.md
    guvenlik-kontrol.md
    hiz-testi.md
    hook-yaz.md
    implement.md
    plan.md
    react-test.md
    refactor.md
    review.md
    rnec.md
    seo.md
    sonar-start.md
    test.md
    ultrathink.md
.claude/
  agents/
    react-performance-debugger.md
  settings.local.json
.expo/
  README.md
  cache/
    eslint/
      .cache_10s0r88
      .cache_mkqqvd
  devices.json
  web/
    cache/
      production/
        images/ [70 files: 70 .png]
.scannerwork/
  .sonar_lock
  report-task.txt
.serena/
  .gitignore
  cache/
    typescript/
      document_symbols.pkl
      raw_document_symbols.pkl
  memories/
    project_overview.md
    style_and_conventions.md
    suggested_commands.md
    task_completion_checklist.md
  project.yml
.sisyphus/
  plans/
    api-merge-smart-enrichment.md
GEMINIDOCS/
  HOMEPAGE_REDESIGN_IDEAS.md
  INDEX.md
  STRUCTURE.md
android/
  .gitignore
  app/
    build.gradle
    debug.keystore
    google-services.json
    proguard-rules.pro
    src/
      debug/
        AndroidManifest.xml
      debugOptimized/
        AndroidManifest.xml
      main/
        AndroidManifest.xml
        java/
          com/
            kitaplik/
              app/
                MainActivity.kt
                MainApplication.kt
        res/
          drawable/
            ic_launcher_background.xml
            rn_edit_text_material.xml
          mipmap-anydpi-v26/
            ic_launcher.xml
            ic_launcher_round.xml
          values/
            colors.xml
            strings.xml
            styles.xml
          values-night/
            colors.xml
  build.gradle
  gradle/
    wrapper/
      gradle-wrapper.jar
      gradle-wrapper.properties
  gradle.properties
  gradlew
  gradlew.bat
  settings.gradle
app/
  (tabs)/
    __tests__/ [1 files: 1 .tsx]
    _layout.tsx
    books.tsx
    index.tsx
    settings.tsx ← settings.test.tsx
  +not-found.tsx
  AGENTS.md
  _layout.tsx
  add-book.tsx
  book-detail.tsx
assets/ [22 files: 17 .png, 4 .json, 1 .storyboard]
codeql/
  Kitaplik_Analiz.sarif
codeql-custom-queries-javascript/
  codeql-pack.lock.yml
  codeql-pack.yml
components/
  AGENTS.md
  AchievementCard.tsx ← index.tsx
  AnimatedSplash.tsx ← _layout.tsx
  BarcodeScannerModal.tsx ← add-book.tsx
  BookCard.tsx ← BookCard.test.tsx, books.tsx
  BookNotes.tsx ← book-detail.tsx
  BookSelectionModal.tsx ← add-book.tsx
  BookShelf.tsx ← index.tsx
  CollapsibleSection.tsx ← CollapsibleSection.test.tsx, settings.tsx
  CurrentlyReadingCard.tsx ← index.tsx
  FilterDropdown.tsx ← books.tsx
  NotificationPermissionModal.tsx
  PriceComparisonModal.tsx ← book-detail.tsx
  ProfileModal.tsx ← ProfileModal.test.skip.tsx, index.tsx
  ReadingChallengeCard.tsx ← index.tsx
  ReadingGoalModal.tsx ← ReadingChallengeCard.tsx
  RecommendationModal.tsx ← index.tsx
  SearchResultsList.tsx ← add-book.tsx
  __tests__/ [3 files: 3 .tsx]
conductor/
  code_styleguides/
    general.md
    html-css.md
    javascript.md
    typescript.md
  product-guidelines.md
  product.md
  setup_state.json
  tech-stack.md
  tracks/
    feedback_20251222/
      metadata.json
      plan.md
      spec.md
    stats_20251222/
      metadata.json
      plan.md
      spec.md
  tracks.md
  workflow.md
constants/
  Colors.ts ← AnimatedSplash.tsx, ThemeContext.tsx
  Notifications.ts ← NotificationContext.tsx, NotificationService.ts
context/
  AGENTS.md
  AuthContext.tsx ← _layout.tsx, ProfileModal.tsx, books.tsx +1 more
  BooksContext.tsx ← add-book.tsx, book-detail.tsx, _layout.tsx +17 more
  CreditsContext.tsx ← _layout.tsx, RecommendationModal.tsx, CreditsContext.test.tsx
  LanguageContext.tsx ← _layout.tsx, settings.tsx
  NotificationContext.tsx ← _layout.tsx, NotificationContext.test.tsx, settings.tsx
  ThemeContext.tsx ← add-book.tsx, book-detail.tsx, _layout.tsx +18 more
  __tests__/ [3 files: 3 .tsx]
docs/ [10 files: 10 .md]
hooks/
  __tests__/ [2 files: 2 .ts]
  book/
    __tests__/ [3 files: 3 .ts]
    useBookDetails.ts ← book-detail.tsx, useBookDetails.test.ts
    useBookSearch.ts ← add-book.tsx, useBookSearch.test.ts
    useRecommendation.ts ← useRecommendation.test.ts
  useBackup.ts ← useBackup.test.ts
  useDebounce.ts ← useBookSearch.ts, useDebounce.test.ts
  useFrameworkReady.ts ← _layout.tsx
i18n/ [3 files: 2 .json, 1 .ts]
kapak/
  code.html
scripts/
  test-search-filter.ts
services/
  AGENTS.md
  BackupService.ts ← useBackup.ts, settings.tsx
  BookMergeService.ts ← SearchEngine.ts, BookMergeService.test.ts
  GoogleBooksService.ts ← add-book.tsx, SearchResultsList.tsx, BookMergeService.ts +5 more
  NotificationService.ts ← BooksContext.tsx, NotificationContext.tsx, NotificationService.test.ts
  OpenLibraryService.ts ← GoogleBooksService.ts, SearchEngine.test.ts, SearchEngine.ts
  PriceService.ts ← PriceComparisonModal.tsx
  RecommendationService.ts ← RecommendationModal.tsx, RecommendationService.test.ts, useRecommendation.ts
  SearchEngine.ts ← add-book.tsx, SearchEngine.test.ts, useBookSearch.ts +1 more
  __tests__/ [4 files: 4 .ts]
  storage/
    AsyncStorageAdapter.ts ← index.ts, StorageService.ts
    IStorageAdapter.ts ← AsyncStorageAdapter.ts, index.ts, StorageService.ts
    StorageService.ts ← index.ts
    index.ts ← add-book.tsx, book-detail.tsx, _layout.tsx +18 more
utils/
  AGENTS.md
  __tests__/ [6 files: 6 .ts]
  cn.ts ← BookCard.tsx, BookNotes.tsx, FilterDropdown.tsx +4 more
  cryptoUtils.ts ← RecommendationService.ts, RecommendationService.test.ts
  email.ts ← email.test.ts, settings.tsx
  errorUtils.ts ← RecommendationModal.tsx, AuthContext.tsx, BooksContext.tsx +14 more
  fetchWithTimeout.ts ← GoogleBooksService.ts, OpenLibraryService.ts, RecommendationService.ts +3 more
  isbnConverter.ts ← BookMergeService.ts, GoogleBooksService.ts, isbnConverter.test.ts
  stringUtils.ts ← BookMergeService.ts, GoogleBooksService.ts, SearchEngine.ts +1 more
web/
  .netlify/
    state.json
  assets/ [2 files: 1 .png, 1 .json]
  contact.html
  index.html
  privacy.html
  script.js
  style.css
```


## File Dependencies

> Scanned 103 files

### High-Impact Files

*Files imported by multiple other files:*

| File | Imported by |
|------|-------------|
| `context/ThemeContext` | 21 files |
| `context/BooksContext` | 20 files |
| `utils/errorUtils` | 17 files |
| `services/GoogleBooksService` | 8 files |
| `utils/cn` | 7 files |


---

*Auto-generated by Maestro session hooks.*
