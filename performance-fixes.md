# Performance Fixes Plan - Kitaplik App

## Overview

Comprehensive performance optimization plan addressing 10 identified bottlenecks in the Kitaplik (Ayraç) React Native/Expo application. Current performance score: 72/100.

**Project Type:** MOBILE (React Native/Expo)
**Target Score:** 85+/100
**Estimated Time:** 6-8 hours

---

## BOTTLENECK ANALYSIS SUMMARY

### Critical Issues (HIGH Priority)

1. **BooksContext.tsx:188** - addBook unnecessary re-renders (books dependency)
2. **add-book.tsx** - 963 lines, too many responsibilities
3. **RecommendationModal.tsx:356** - Ad loading memory leak risk
4. **BookSelectionModal.tsx:179** - FlatList instead of FlashList
5. **GoogleBooksService.ts:140** - Sequential API calls (slow)

### Moderate Issues (MEDIUM Priority)

6. **index.tsx:283** - BookCard props re-creation on every render
7. **BooksContext.tsx:152** - 1000ms debounce too aggressive
8. **RecommendationModal.tsx:444** - excludedTitles array O(n) on every call

### Minor Issues (LOW Priority)

9. **FilterDropdown.tsx** - FlatList instead of FlashList
10. **All Image components** - Missing cachePolicy prop

---

## PHASE 1: CRITICAL MEMORY & RE-RENDER FIXES

### Task 1.1: Fix BooksContext addBook Re-render

**File:** context/BooksContext.tsx
**Agent:** mobile-developer
**Priority:** P0 (CRITICAL)
**Dependencies:** None

**Problem:** addBook has books in dependency array, causing re-renders every time books change.

**Code Changes:**

- Line 188: Remove books from dependency array
- Use functional update in setBooks instead
- Move duplicate check inside functional update

**INPUT:** Current BooksContext.tsx with books dependency
**OUTPUT:** addBook with functional update, empty deps
**VERIFY:** Run React DevTools Profiler - addBook should not re-render on books change

---

### Task 1.2: Fix RecommendationModal Ad Memory Leak

**File:** components/RecommendationModal.tsx
**Agent:** mobile-developer
**Priority:** P0 (CRITICAL)
**Dependencies:** None

**Problem:** Ad event listeners not cleaned up on unmount.

**Code Changes:**

- Line 356: Add cleanup function to useEffect
- Return unsubscribe calls for all 3 listeners

**INPUT:** Current RecommendationModal.tsx without cleanup
**OUTPUT:** useEffect with cleanup function
**VERIFY:** Repeatedly open/close modal 10x - memory should not increase

---

### Task 1.3: Fix GoogleBooksService Sequential API Calls

**File:** services/GoogleBooksService.ts
**Agent:** mobile-developer
**Priority:** P1 (HIGH)
**Dependencies:** None

**Problem:** Sequential ISBN searches are slow.

**Code Changes:**

- Line 140: Replace sequential awaits with Promise.allSettled
- Run all 4 searches in parallel
- Return first successful result

**INPUT:** Sequential search with 4 await steps
**OUTPUT:** Parallel search with Promise.allSettled
**VERIFY:** ISBN search time reduced from ~2s to ~0.6s

---

## PHASE 2: LIST RENDERING OPTIMIZATION

### Task 2.1: Replace FlatList with FlashList in BookSelectionModal

**File:** components/BookSelectionModal.tsx
**Agent:** mobile-developer
**Priority:** P1 (HIGH)
**Dependencies:** None

**Problem:** FlatList has poor performance for long lists.

**Code Changes:**

- Line 179: Replace FlatList with FlashList
- Import FlashList from @shopify/flash-list
- Add estimatedItemSize prop

**VERIFY:** Scroll 100+ items - smooth scrolling, no jank

---

### Task 2.2: Replace FlatList with FlashList in FilterDropdown

**File:** components/FilterDropdown.tsx
**Agent:** mobile-developer
**Priority:** P2 (MEDIUM)
**Dependencies:** None

**Code Changes:** Same as Task 2.1, apply FlashList pattern.

**VERIFY:** Filter dropdown opens instantly, no lag

---

## PHASE 3: COMPONENT OPTIMIZATION

### Task 3.1: Extract Search Results Component from add-book.tsx

**File:** app/add-book.tsx (create components/SearchResultsList.tsx)
**Agent:** mobile-developer
**Priority:** P1 (HIGH)
**Dependencies:** None

**Problem:** 963-line file violates SRP, hard to maintain.

**Code Changes:**

1. Create components/SearchResultsList.tsx with FlashList
2. Move search results rendering logic
3. Update add-book.tsx to import new component

**VERIFY:** File < 500 lines, component clearly separated

---

### Task 3.2: Memoize BookCard Props in index.tsx

**File:** app/(tabs)/index.tsx
**Agent:** mobile-developer
**Priority:** P2 (MEDIUM)
**Dependencies:** None

**Problem:** BookCard props recreated on every render.

**Code Changes:**

- Line 283: Use useCallback for renderBookItem
- Memoize the render function

**VERIFY:** BookCard doesn't re-render when filter changes

---

### Task 3.3: Add Image Caching Policy

**Files:** All components using expo-image
**Agent:** mobile-developer
**Priority:** P2 (LOW)
**Dependencies:** None

**Code Changes:**

- Add cachePolicy="memory-disk" to all Image components

**VERIFY:** Images load instantly on second view

---

## PHASE 4: DEBOUNCE & DATA OPTIMIZATION

### Task 4.1: Optimize excludedTitles in RecommendationModal

**File:** components/RecommendationModal.tsx
**Agent:** mobile-developer
**Priority:** P2 (MEDIUM)
**Dependencies:** None

**Code Changes:**

- Line 444: Memoize excludedTitles with useMemo
- Use [books] dependency

**VERIFY:** No array allocation on recommendation click

---

### Task 4.2: Adjust BooksContext Debounce

**File:** context/BooksContext.tsx
**Agent:** mobile-developer
**Priority:** P3 (LOW)
**Dependencies:** None

**Code Changes:**

- Line 152: Reduce debounce from 1000ms to 500ms

**VERIFY:** Data persists within 500ms of change

---

## PHASE 5: VERIFICATION (MANDATORY)

### Task 5.1: Run Mobile Audit Script

**Command:**

```bash
python ~/.claude/skills/mobile-design/scripts/mobile_audit.py .
```

**Verify:**

- No critical performance issues
- Memory leaks detected and fixed
- List rendering optimized

---

### Task 5.2: Manual Performance Testing

**Test Checklist:**

- Open/close app 10x - memory stable
- Scroll 100+ books - smooth 60fps
- Search books - results < 1s
- Add book - instant save, no lag
- Recommendation modal - no memory leak

---

### Task 5.3: Run Type Check & Lint

**Commands:**

```bash
npx tsc --noEmit
npm run lint
npm test
```

**Verify:** All pass, no new warnings

---

## SUCCESS CRITERIA

| Metric                   | Before      | Target       |
| ------------------------ | ----------- | ------------ |
| Performance Score        | 72/100      | 85+/100      |
| add-book.tsx lines       | 963         | <500         |
| ISBN search time         | ~2s         | <1s          |
| Memory leak (modal)      | Yes         | No           |
| List scroll (100+ items) | Janky       | Smooth 60fps |
| Re-renders (addBook)     | Unnecessary | Minimal      |

---

## EXECUTION ORDER

1. Phase 1 (Critical memory leaks) - Must complete first
2. Phase 2 (List rendering) - After Phase 1
3. Phase 3 (Component split) - Can run parallel with Phase 2
4. Phase 4 (Debounce optimization) - After Phase 1-3
5. Phase 5 (Verification) - Always last

---

## ROLLBACK STRATEGY

Each task has minimal risk, but if issues arise:

- Revert specific file change
- Test before proceeding
- Commit after each successful phase

---

## NOTES

- All changes preserve existing functionality
- No breaking changes to public APIs
- Tests must be updated alongside code changes
- Profile before/after for validation
