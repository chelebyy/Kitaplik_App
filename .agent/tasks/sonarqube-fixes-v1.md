# 🔧 SonarQube Issues Fix Plan

> **Goal:** SonarQube taramasında tespit edilen Code Smell ve Vulnerability sorunlarını düzeltmek.
>
> **Scope:** 34 sorun (Token BLOCKER hariç = 33 sorun)
>
> **Generated:** 2026-01-03T18:02

---

## 📊 Özet

| Kategori | Sayı | Durum |
|----------|------|-------|
| 🔴 BLOCKER (Token - SKIP) | 1 | ⏭️ Atlanacak |
| 🟠 Duplicate Imports | 6 | ⏳ Bekliyor |
| 🟡 Unused Imports | 8 | ⏳ Bekliyor |
| 🟣 Deprecated API Usage | 2 | ⏳ Bekliyor |
| 🔵 Props Read-Only | 4 | ⏳ Bekliyor |
| ⚪ window → globalThis | 1 | ⏳ Bekliyor |
| 🟤 Diğer Code Smells | 12 | ⏳ Bekliyor |

---

## 📋 Micro-Tasks (Dosya Bazlı)

### Task 1: `app/(tabs)/books.tsx` [~3 dk]

- [ ] 1.1 Duplicate import düzelt: `BookCard` birden fazla import edilmiş (Line 28)
- [ ] 1.2 Diğer import sorunlarını kontrol et

### Task 2: `app/add-book.tsx` [~5 dk]

- [ ] 2.1 Duplicate import düzelt: `LinearGradient` (Line 33)
- [ ] 2.2 Deprecated `MediaTypeOptions` kullanımını güncelle (Line 94)
- [ ] 2.3 Diğer sorunları kontrol et

### Task 3: `app/book-detail.tsx` [~2 dk]

- [ ] 3.1 Unused import kaldır: `cn`

### Task 4: `app/(tabs)/index.tsx` [~3 dk]

- [ ] 4.1 Import sorunlarını düzelt
- [ ] 4.2 Unused variable/import varsa kaldır

### Task 5: `app/(tabs)/settings.tsx` [~2 dk]

- [ ] 5.1 Import sorunlarını kontrol et ve düzelt

### Task 6: `context/BooksContext.tsx` [~2 dk]

- [ ] 6.1 Props'u `Readonly<T>` ile işaretle (Line 106)

### Task 7: `context/ThemeContext.tsx` [~2 dk]

- [ ] 7.1 Props'u `Readonly<T>` ile işaretle (Line 21)

### Task 8: `context/LanguageContext.tsx` [~2 dk]

- [ ] 8.1 Props'u `Readonly<T>` ile işaretle (varsa)

### Task 9: `hooks/useFrameworkReady.ts` [~1 dk]

- [ ] 9.1 `window` → `globalThis` değişikliği (Line 11)

### Task 10: `services/GoogleBooksService.ts` [~3 dk]

- [ ] 10.1 Import path vulnerability düzelt
- [ ] 10.2 Diğer code smell'leri kontrol et

### Task 11: `services/SearchEngine.ts` [~3 dk]

- [ ] 11.1 Import path vulnerability düzelt
- [ ] 11.2 Diğer code smell'leri kontrol et

### Task 12: `components/*.tsx` [~5 dk]

- [ ] 12.1 Tüm component dosyalarını kontrol et
- [ ] 12.2 Unused import'ları kaldır
- [ ] 12.3 Duplicate import'ları düzelt

---

## ✅ Verification Plan

1. Her dosya düzeltmesinden sonra → TypeScript compile kontrolü
2. Tüm düzeltmeler tamamlandıktan sonra → `npm run lint`
3. Final → `npm run sonar` ile yeniden tarama
4. SonarQube dashboard'da issue sayısının düştüğünü doğrula

---

## 📝 Notlar

- **Token (BLOCKER):** Kullanıcı talebi ile atlanıyor
- **Test Coverage:** Kullanıcı talebi ile kapsam dışı
- **TDD Exception:** Bu bir refactoring görevi, davranış değişmiyor

---

## 🔄 Progress Tracker

| Task | Status | Notes |
|------|--------|-------|
| Task 1 | ⏳ | - |
| Task 2 | ⏳ | - |
| Task 3 | ⏳ | - |
| Task 4 | ⏳ | - |
| Task 5 | ⏳ | - |
| Task 6 | ⏳ | - |
| Task 7 | ⏳ | - |
| Task 8 | ⏳ | - |
| Task 9 | ⏳ | - |
| Task 10 | ⏳ | - |
| Task 11 | ⏳ | - |
| Task 12 | ⏳ | - |
