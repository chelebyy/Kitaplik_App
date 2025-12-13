---
description: React Native (Expo) Component Audit & Fix (NativeWind/UI/UX)
---

# React Native Component Audit & Fix

Bu workflow, belirtilen dosyayı (veya projeyi) tarayarak **React Native (Expo)** standartlarına, **NativeWind** kullanımına ve **UI/UX** kalitesine göre analiz eder ve düzeltir.

## Adımlar

1.  **Analiz Et**:
    - Dosyadaki bileşeni oku.
    - **HTML elementleri** var mı? (div, span -> View, Text olmalı)
    - **Styling**: 'NativeWind' (className) kullanılıyor mu? 'StyleSheet' veya inline style var mı?
    - **Accessibility**: 'accessibilityLabel' ve 'accessibilityRole' kullanılmış mı?
    - **Hooks**: Hooks kurallarına uyulmuş mu? (Top level call)

2.  **Planla**:
    - Düzeltilmesi gereken 'Code Smell'leri listele.
    - Tasarımı iyileştirmek için Tailwind sınıfları öner (padding, shadow, rounded).

3.  **Uygula (Refactoring)**:
    - Kodu 'Golden Sample' yapısına dönüştür (FC, TypeScript, i18n).
    - 'react-native' ve 'expo-router' importlarını düzelt.
    - Gerekiyorsa bileşeni küçük parçalara böl.

4.  **Kontrol**:
    - Typescript hatası var mı?
    - Expo Router <Link> kullanımı doğru mu?
