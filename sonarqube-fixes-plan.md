# SonarQube Issues Fix Plan

## Goal

Fix all 25+ SonarQube issues in Kitaplik App (Ayraç) to achieve Quality Gate pass status.

## Project Type

MOBILE (React Native/Expo)

## Current Status

- Quality Gate: PASS (but issues present)
- Coverage: 40.3% (target: 80%)
- Critical Issues: 2 (Cognitive Complexity)
- Security Hotspots: 10
- Code Smells: 13
- Vulnerabilities: 3

---

## Priority 0: Critical Complexity Issues

### Task 1: Refactor handleBarcodeScanned (Complexity 18 -> ≤15)

**File:** app/add-book.tsx:169
**Agent:** mobile-developer

**Approach:**

1. Extract extractBookData() function
2. Extract showSuccessAlert() function
3. Simplify nested if-else with early returns

**Input:** Current handleBarcodeScanned function (60+ lines)
**Output:** Refactored function with complexity ≤15
**Verify:** Run SonarQube scan, complexity should be ≤15

---

### Task 2: Refactor syncNotificationSchedule (Complexity 30 -> ≤15)

**File:** context/NotificationContext.tsx:246
**Agent:** mobile-developer

**Approach:**

1. Create notification handler strategy map
2. Extract each case to separate handler function
3. Replace switch statement with map lookup

**Input:** Current syncNotificationSchedule function (120+ lines)
**Output:** Simplified function with complexity ≤10
**Verify:** Run SonarQube scan, complexity should be ≤10

---

## Priority 1: Security Hotspots

### Task 3: Fix Weak Cryptography (Math.random)

**Files:** services/RecommendationService.ts:33, 101
**Agent:** security-auditor

**Approach:**

1. Create utils/cryptoUtils.ts with getSecureRandomInt()
2. Replace Math.random() with crypto.getRandomValues()
3. Add fallback for older environments

**Input:** Math.floor(Math.random() \* length) calls
**Output:** getSecureRandomInt(length) calls
**Verify:** Security scan passes, no weak crypto warnings

---

### Task 4: Fix AndroidManifest Permissions

**File:** android/app/src/main/AndroidManifest.xml
**Agent:** security-auditor

**Approach:**

1. Add permission documentation comments
2. Fix allowBackup contradiction (set to true)
3. Document debug cleartext traffic justification

**Input:** Current AndroidManifest.xml
**Output:** Documented and consistent permissions
**Verify:** Mobile audit passes, security hotspots resolved

---

## Priority 2: Code Smells

### Task 5: Extract Magic Numbers to Constants

**Files:** NotificationContext.tsx, RecommendationService.ts
**Agent:** mobile-developer

**Approach:**

1. Create constants/Notifications.ts
2. Extract NOTIFICATION_INTERVALS, NOTIFICATION_IDS
3. Replace magic numbers with named constants

**Input:** Hard-coded values (10, 3, 15, 7, 18, etc.)
**Output:** Named constants
**Verify:** No magic numbers remain

---

### Task 6: Extract Sub-components from Large Files

**Files:** app/add-book.tsx (970 lines), components/RecommendationModal.tsx (571 lines)
**Agent:** mobile-developer

**Approach:**

1. Extract BookForm component
2. Extract useBookSearch hook
3. Extract useBarcodeScanner hook

**Input:** Large component files
**Output:** Smaller, focused files (<300 lines each)
**Verify:** Lint passes, components work correctly

---

## Priority 3: Test Coverage (40.3% -> 80%)

### Task 7: Write RecommendationService Tests

**File:** services/**tests**/RecommendationService.test.ts (NEW)
**Agent:** test-engineer

**Test Cases:**

- getRandomFromLibrary returns null when empty
- getRandomFromLibrary returns book from Okunacak status
- getDiscoveryRecommendation fetches by genre
- getDiscoveryRecommendation handles API errors
- getFavoriteGenre returns most common genre

**Input:** RecommendationService.ts
**Output:** 5 passing tests, 80%+ coverage
**Verify:** npm test -- RecommendationService passes

---

### Task 8: Write ISBN Converter Tests

**File:** utils/**tests**/isbnConverter.converter.test.ts (NEW)
**Agent:** test-engineer

**Test Cases:**

- converts ISBN-10 to ISBN-13 correctly
- converts ISBN-13 to ISBN-10 correctly
- validates checksum
- handles invalid ISBNs
- handles edge cases
- handles ISBN with dashes

**Input:** utils/isbnConverter.ts
**Output:** 6 passing tests, 80%+ coverage
**Verify:** npm test -- isbnConverter passes

---

### Task 9: Write RecommendationModal Tests

**File:** components/**tests**/RecommendationModal.test.tsx (NEW)
**Agent:** test-engineer

**Test Cases:**

- renders loading state
- renders recommendation result
- handles add to library
- handles close action

**Input:** components/RecommendationModal.tsx
**Output:** 4 passing tests, 80%+ coverage
**Verify:** npm test -- RecommendationModal passes

---

### Task 10: Enhance SearchEngine Tests

**File:** services/**tests**/SearchEngine.test.ts
**Agent:** test-engineer

**New Tests:**

- searchByIsbnEnriched with merge
- Error handling in enriched search
- AbortSignal cancellation

**Input:** Current SearchEngine.test.ts
**Output:** +3 tests, 80%+ coverage
**Verify:** npm test -- SearchEngine passes

---

## Priority 4: Vulnerabilities

### Task 11: Update Dependencies

**File:** package.json, package-lock.json
**Agent:** devops-engineer

**Approach:**

1. Run npm audit
2. Run npm audit fix
3. Manual updates if needed

**Input:** Current dependencies
**Output:** Updated packages with 0 vulnerabilities
**Verify:** npm audit returns 0 vulnerabilities

---

## Execution Order

| Phase  | Task                                      | Duration | Dependencies |
| ------ | ----------------------------------------- | -------- | ------------ |
| P0     | Task 1: Refactor handleBarcodeScanned     | 15 min   | -            |
| P0     | Task 2: Refactor syncNotificationSchedule | 20 min   | -            |
| P1     | Task 3: Fix Weak Cryptography             | 10 min   | -            |
| P1     | Task 4: Fix AndroidManifest               | 5 min    | -            |
| P2     | Task 5: Extract Magic Numbers             | 10 min   | Tasks 1-2    |
| P2     | Task 6: Extract Sub-components            | 30 min   | Tasks 1-2    |
| P3     | Task 7: RecommendationService Tests       | 20 min   | Task 3       |
| P3     | Task 8: ISBN Converter Tests              | 15 min   | -            |
| P3     | Task 9: RecommendationModal Tests         | 15 min   | Task 6       |
| P3     | Task 10: Enhance SearchEngine Tests       | 10 min   | -            |
| P4     | Task 11: Update Dependencies              | 5 min    | -            |
| Verify | Full SonarQube Scan                       | 5 min    | All tasks    |

**Total Estimated Time:** ~2.5 hours

---

## Phase X: Verification

### Step 1: Complexity Check

```bash
npm run sonar:scan
# Expected: 0 critical complexity issues
```

### Step 2: Security Check

```bash
python ~/.claude/skills/vulnerability-scanner/scripts/security_scan.py .
# Expected: 0 critical security issues
```

### Step 3: Mobile Audit

```bash
python ~/.claude/skills/mobile-design/scripts/mobile_audit.py .
# Expected: All checks pass
```

### Step 4: Lint Check

```bash
npm run lint
# Expected: 0 errors, 0 warnings
```

### Step 5: Type Check

```bash
npx tsc --noEmit
# Expected: 0 errors
```

### Step 6: Test Coverage

```bash
npm test -- --coverage
# Expected: Coverage ≥80%
```

### Step 7: Dependency Check

```bash
npm audit
# Expected: 0 vulnerabilities
```

---

## Done When

- [ ] All 2 critical complexity issues resolved (≤15)
- [ ] All 10 security hotspots addressed
- [ ] All 13 code smells fixed
- [ ] Test coverage ≥80%
- [ ] All 3 vulnerabilities patched
- [ ] SonarQube Quality Gate: PASS with 0 issues
- [ ] All verification scripts pass
- [ ] Build succeeds without errors
- [ ] No TypeScript errors
- [ ] All tests pass
