---
description: React Native Performance & Optimization Check
---

# React Native Performance Audit

Bu workflow, mobil uygulamanın performansını etkileyebilecek darboğazları statik kod analizi ile tespit eder.

## Odak Noktaları

1.  **Liste Performansı**:
    - 'FlatList' veya 'FlashList' kullanılıyor mu? ('map' ile render kaçınılmalı).
    - 'keyExtractor' doğru tanımlı mı?
    - 'getItemLayout' var mı?

2.  **Render Optimization**:
    - Anonim fonksiyonlar prop olarak geçilmiş mi? (useCallback öner).
    - Ağır bileşenler 'React.memo' ile sarmalanmış mı?

3.  **Görsel Yönetimi**:
    - 'Image' bileşeni yerine 'expo-image' kullanımı.
    - Cache stratejisi.

4.  **Paket Boyutu**:
    - Gereksiz büyük kütüphane importları (örn: tüm 'lodash' yerine parça import).

## Çıktı

- Bulunan performans risklerini maddeler halinde listele.
- Her madde için kod düzeltme önerisi sun.
