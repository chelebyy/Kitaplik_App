---
description: Custom React Native Hook Generator (TypeScript)
---

# Custom Hook Generator (v2.2)

Bu workflow, **performanslı, güvenli, sürdürülebilir ve test edilebilir**  
**React Native Custom Hook** üretmek için kullanılır.  
Runtime'da çalışmaz; **tasarım ve kalite standardı** olarak kullanılır.

---

## 🎯 Temel Prensipler

- **Naming**
  - Tüm hook'lar `use` ile başlamalıdır.
  - **Naming Patterns:**
    - Data fetching: `useBookQuery`, `useSearchBooks`
    - Mutations: `useAddBook`, `useDeleteBook`
    - State stores: `useLibraryStore`, `useSettingsStore`
    - UI logic: `useDebounce`, `useMediaQuery`

- **Rules of Hooks (Zorunlu)**
  - Hook'lar **koşullu çağrılamaz** (`if`, `for`, `try-catch` içinde değil).
  - Sadece fonksiyon component veya custom hook içinde çağrılır.
  - Hook çağrıları her render'da **aynı sırada** olmalıdır.

- **Type Safety**
  - Hook'un **public API'si (return object)** için `interface` kullanılmalıdır.
  - Internal / generic yardımcı tiplerde `type` kullanılabilir.

- **Return Type**
  - Hook'lar **her zaman object döndürür** (genişletilebilirlik için).

- **Single Responsibility**
  - 1 hook = 1 iş.
  - Cache, network, permission gibi sorumluluklar gerekirse **ayrı hook'lara bölünür**.

---

## 📂 Dosya Yapısı

```
hooks/
├── useDebounce.ts           # Genel utility hook'lar
├── useMediaQuery.ts
├── book/                    # Feature-specific hook'lar
│   ├── useBookQuery.ts
│   └── useAddBook.ts
└── __tests__/               # Test dosyaları
    ├── useDebounce.test.ts
    └── useBookQuery.test.ts
```

---

## 💾 Storage & Data Strategy

- **Storage Strategy**
  - Varsayılan olarak `react-native-mmkv` kullanılır.
  - Hook, storage implementasyonunu **doğrudan bilmemeli**;
    mümkünse adapter/helper üzerinden erişmelidir.
  - Secure / encrypted storage geçişine açık tasarlanmalıdır.

- **Data Synchronization**
  - **Stale-While-Revalidate (SWR)** uygulanır:
    - Cache verisi UI'ya **hemen** döndürülür.
    - Arka planda güncelleme yapılır.
  - Background refresh sonucu:
    - State merge açık ve kontrollü olmalıdır.
    - Eski verinin yanlışlıkla overwrite edilmesi engellenmelidir.

---

## 🧠 State & Mimari Karar

1. **Analiz**
   - Bu hook gerçekten gerekli mi?
   - Logic UI'dan ayrılmalı mı?

2. **State Kararı**
   - Local state mi?
   - Global state (Zustand / Context) mi?
   - Aynı hook **birden fazla ekranda eş zamanlı** kullanılıyor mu?

---

## 🧩 Implementasyon Kuralları

- **Referans Kararlılığı**
  - `useCallback` / `useMemo` yalnızca:
    - Hook dışına fonksiyon / değer dönüyorsa
    - Gerçek bir performans maliyeti varsa kullanılmalıdır.
  - Gereksiz over-optimization yapılmaz.

- **Dependency Array Best Practices**
  - Tüm dış bağımlılıklar `deps` array'ine dahil edilmelidir.
  - ESLint `exhaustive-deps` kuralına uyulmalıdır.
  - **Stale closure** riskine dikkat edilmelidir.

- **Async & Lifecycle Güvenliği**
  - Tüm async işlemler cleanup / abort edilebilir olmalıdır.
  - Unmount sonrası `setState` çağrısı yapmamalıdır.
  - **AbortController Pattern:**

    ```tsx
    useEffect(() => {
      const controller = new AbortController();
      fetchData({ signal: controller.signal }).then((data) => {
        if (!controller.signal.aborted) {
          setData(data);
        }
      });
      return () => controller.abort();
    }, []);
    ```

- **Error & Loading Yönetimi**
  - `try-catch` zorunludur.
  - `isLoading`, `isError` (veya `error`) state'leri açıkça döndürülmelidir.

- **Retry Strategy (Opsiyonel)**
  - Network hatalarında exponential backoff uygulanabilir.
  - `retryCount`, `retryDelay` opsiyonları düşünülmelidir.

---

## 📱 Platform-Specific Hooks

- Platform-specific logic varsa `Platform.OS` kontrolü hook içinde yapılmalı.
- Veya ayrı dosyalar kullanılmalı:
  - `useBookmarks.ios.ts`
  - `useBookmarks.android.ts`

---

## 🧪 Test & Dokümantasyon

- **Dokümantasyon**
  - Hook'lar JSDoc ile belgelenmelidir.
  - Parametreler ve return alanları açıkça açıklanmalıdır.

- **Test**
  - `renderHook` ile temel senaryolar test edilmelidir:
    - success
    - loading
    - error
  - Hook testleri:
    - UI'dan bağımsız olmalı
    - Platform API'leri (Storage, Permissions vb.) mock'lanmalıdır.

---

## ✅ Son Kontrol Checklist

- [ ] `use` ile başlıyor
- [ ] Rules of Hooks'a uyuyor
- [ ] Tek sorumluluğu var
- [ ] Interface'ler net
- [ ] UI bağımlılığı yok
- [ ] Dependency array'ler eksiksiz
- [ ] AbortController/cleanup var
- [ ] Stale closure riski yok
- [ ] Async güvenli
- [ ] Test edilebilir
- [ ] Genişletilebilir return object
