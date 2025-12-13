---
description: Custom React Native Hook Generator (TypeScript)
---

# Custom Hook Generator

Bu workflow, tekrar eden mantıkları kapsüllemek için **React Native uyumlu Custom Hook** üretir.

## Prensipler

- İsimlendirme: 'use' ile başla (örn: 'useBookStore').
- **TypeScript**: Girdi ve çıktıları kesinlikle tiple (interface/type).
- **Offline-First**: Veri çekme işlemlerinde önce 'AsyncStorage', yoksa API mantığını kur (veya sadece yerel).
- **Hata Yönetimi**: 'try-catch' blokları ve error state'i döndür.

## Adımlar

1.  **İhtiyaç Analizi**: Hangi mantık soyutlanacak? (Auth, Data Fetching, Form, Animation)
2.  **Interface Tanımı**: Hook'un parametrelerini ve dönüş değerini (return object) tasarla.
3.  **Implementasyon**:
    - 'useState', 'useEffect', 'useCallback' kullan.
    - Asenkron işlemler için loading state ekle.
4.  **Best Practice Kontrolü**:
    - Gereksiz re-render önlendi mi? (Dependency array kontrolü).
    - Temiz kod (JSDoc yorumları).
